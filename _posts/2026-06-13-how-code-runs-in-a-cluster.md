---
layout: post
title: "How Code Runs in a Cluster"
date: 2026-06-13
author: "Jayant Lohia"
---

The hardware question was: when many chips are wired together, where does bandwidth fall off?

The software question is the same question backwards. Model code pretends a tensor is one thing. Hardware sees bytes sitting in HBM on one chip, or another chip, or the host. Who keeps those bytes local? Who decides when they must move?

A tensor is bytes plus shape plus dtype plus placement. The same add can be cheap or expensive depending on that last word.

Use one add as the microscope.

```
x = ones(shape, dtype)
y = ones(shape, dtype)

compiled_add = jax.jit(
    lambda x, y: x + y
)

out = compiled_add(x, y)
```

If `x` and `y` are already in the same HBM, the add is just a tiny local kernel. If they are on the host, they must be copied first. If they are sharded the same way, every chip adds its own slice. If they are sharded differently, software has to communicate before the add can even start.

So the kernel is not the real question. The boundary is.

Bad software lets the boundary appear inside the loop.

```
Python op -> launch -> sync
Python op -> launch -> sync
Python op -> launch -> sync
```

Good software pays the planning cost once, then reuses the plan.

```
trace / capture
      |
      v
graph IR
      |
      v
compiler or library plan
      |
      v
cached executable
      |
      v
many launches without rethinking the world
```

This is the job: take a global-looking tensor program, turn it into local work, and make communication rare, planned, and overlapped.

## TPUs

### Program

TPU software pushes the answer toward the compiler. Python should describe the computation, not drive every operation. JAX traces the Python function for a particular set of shapes and dtypes. The result lowers to StableHLO or HLO. PJRT is the API that asks the TPU backend to compile and run it. `libtpu.so` is where the TPU implementation lives.

```
jax.jit(lambda x, y: x + y)
        |
        v
trace Python once
        |
        v
jaxpr
        |
        v
StableHLO / HLO
        |
        v
PJRT compile()
        |
        v
libtpu.so + XLA TPU backend
        |
        v
cached TPU executable
```

On the second call with the same signature, compile is done. Python hands over buffers and launches the executable.

```
host arrays
   |
   v
PJRT device buffers
   |
   v
HBM on TPU
   |
   v
launch executable
   |
   v
TPU reads HBM -> adds -> writes HBM
   |
   v
copy back only if Python asks
```

### Sharding

The illusion is that a tensor can span a pod. The reality is that every chip owns a slice. The user names a mesh and says how tensor dimensions map onto mesh axes. XLA/GSPMD then inserts the missing pieces: local shapes, resharding, all-reduce, all-gather, reduce-scatter.

For the add, matching shards are perfect.

```
chip 0: x[0] + y[0]
chip 1: x[1] + y[1]
chip 2: x[2] + y[2]
chip 3: x[3] + y[3]
```

No chip needs another chip. The moment the next operation wants a different layout, the compiler has to move data. That is the software version of the hardware bottleneck.

### Kernel

TPUs do not want a long chain of tiny launches. They want the compiler to see the whole shape of the work. XLA chooses layouts, fuses operations, tiles matrix multiplies onto MXUs, and schedules VMEM traffic. Pallas exists for the cases where the compiler needs a hand-written kernel, but the default path is still compiler-first.

### Cluster

Inside a TPU slice, collectives ride ICI. Across slices, they ride DCN. Multi-controller JAX runs one Python process per host. Pathways moves toward a single controller that can see many slices as one machine. Either way, the rule is simple: keep the hot loop inside the fast fabric.

Training works when gradient communication is planned at step boundaries. Inference works when decode stays inside the local memory and fast interconnect domain. The failure mode is accidental resharding or cross-slice traffic in the inner loop.

## AMD

### Program

AMD has a different software problem. The world already wrote CUDA-shaped model code. PyTorch code says `device="cuda"` even when the backend is ROCm. So AMD's stack has to preserve the user-facing shape of CUDA while swapping the machinery underneath.

```
torch.ones(..., device="cuda")
        |
        v
PyTorch dispatcher / ATen
        |
        v
HIP backend on ROCm
        |
        v
ROCm library or HIP kernel
        |
        v
AMDGPU driver
        |
        v
AMD GPU reads HBM -> writes HBM
```

HIP is the bridge. It is close enough to CUDA that kernels and runtimes can be ported, but the code that finally runs is AMD code.

### Kernel

For a plain add, PyTorch can dispatch a generic elementwise kernel. For model performance, the important path is the fused or library path: rocBLAS or hipBLASLt for GEMM, MIOpen for neural network primitives, Composable Kernel and Triton for fused kernels, AITER for ROCm-specific LLM kernels.

```
torch.compile(...)
        |
        v
TorchDynamo captures an FX graph
        |
        v
Inductor picks fused work
        |
        v
Triton / HIP / ROCm libraries
        |
        v
GFX ISA or tuned library kernel
        |
        v
HIP launch
```

The bottleneck here is often not the API. The API can look familiar while performance falls off because one kernel, one dtype, one attention path, or one collective is not tuned yet. A cluster is only as fast as the path the real model actually takes.

### Cluster

RCCL is AMD's collective layer. It gives PyTorch distributed the familiar objects: ranks, tensors, all-reduce, all-gather, reduce-scatter, all-to-all, send, receive. Inside a node it can use PCIe and xGMI. Across nodes it uses InfiniBand, RoCE, or TCP/IP.

```
PyTorch / Megatron / vLLM
      -> HIP / ROCm libraries
      -> ROCm runtime + driver
      -> RCCL
      -> xGMI / PCIe / RoCE
```

Training works when RCCL and the GEMM/attention kernels are on the fast path. Inference works when vLLM or TGI can keep KV cache, attention, GEMM, and collectives on tuned ROCm paths. The failure mode is falling off the optimized path and discovering that compatibility is not the same thing as speed.

## NVIDIA

### Program

NVIDIA's software problem is almost the opposite. CUDA is the default mental model, so the stack can be very opinionated. PyTorch, JAX, Triton, TensorRT, cuBLAS, cuDNN, CUTLASS, and NCCL all bottom out in CUDA runtime or driver APIs.

```
torch.ones(..., device="cuda")
        |
        v
PyTorch dispatcher / ATen
        |
        v
CUDA backend
        |
        v
CUDA library or custom kernel
        |
        v
CUDA runtime / driver
        |
        v
NVIDIA GPU reads HBM -> writes HBM
```

The user sees tensors. The stack sees streams, kernels, library calls, memory pools, and events.

### Kernel

CUDA code becomes PTX or cubin, then device code for the target GPU. Most users do not write that layer. They call libraries that already encode the hardware schedule: cuBLASLt for matmul, cuDNN operation graphs for fused neural network primitives, CUTLASS for templates, Triton for Python-written kernels, TensorRT for inference graphs.

```
CUDA / Triton / generated kernel
        |
        v
PTX or cubin
        |
        v
driver selects or JITs code
        |
        v
SASS on the target SM
        |
        v
launch on a CUDA stream
```

For a big model, the trick is not to make one launch fast. It is to reduce the number of launches, fuse memory traffic, reuse CUDA Graphs where shapes are stable, and let libraries choose kernels that match the chip.

### Cluster

NCCL is the collective layer. It knows about PCIe, NVLink, NVSwitch, and InfiniBand. Data parallelism, tensor parallelism, pipeline parallelism, expert parallelism: all of them become local kernels plus NCCL collectives.

```
PyTorch / JAX / TensorRT-LLM
      -> CUDA libraries + kernels
      -> CUDA runtime / driver
      -> NCCL
      -> NVLink / NVSwitch / InfiniBand
```

Training works when the high-frequency collectives stay inside NVLink/NVSwitch and the slower network is overlapped with compute. Inference works when TensorRT-LLM manages the serving problem as a whole: paged KV cache, in-flight batching, chunked prefill, quantization, and tensor, pipeline, expert, and context parallelism.

The failure mode is the same as hardware: a tensor crosses the slow boundary too often. NVIDIA's advantage is that many applications already land on the tuned path by default.

## The Three Bets

Google makes the compiler the operating system. You describe computation and placement. XLA turns it into shards, kernels, and collectives.

AMD makes the CUDA-shaped ecosystem portable. You keep the PyTorch/HIP surface. ROCm swaps in AMD compilers, libraries, collectives, and tuned kernels underneath.

NVIDIA makes the library stack the machine. You call CUDA-shaped APIs. NVIDIA controls the kernels, the collectives, and the serving runtime.

The software bottleneck is always the same: an innocent tensor expression becomes slow when it crosses a boundary the programmer did not mean to cross. The best stack is the one that makes the fast path obvious and the slow path hard to enter by accident.
