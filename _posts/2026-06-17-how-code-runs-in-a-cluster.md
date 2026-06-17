---
layout: post
title: "How Code Runs in a Cluster"
date: 2026-06-17
author: "Jayant Lohia"
---

Software has one job in an AI cluster: turn tensor math into local work. A tensor is bytes plus shape plus placement. An operation is cheap if its inputs are already on the same chip. Everything else is communication.

Use one add as the microscope.

```
x = ones(shape, dtype)
y = ones(shape, dtype)
compiled_add = jax.jit(
    lambda x, y: x + y
)
out = compiled_add(x, y)
```

The operation is trivial. The path is not.

## TPUs

### Program

On TPU, Python is mostly a graph builder. JAX, TensorFlow, and PyTorch/XLA lower tensor programs into HLO or StableHLO, the compiler IR. PJRT is the device API. `libtpu` is the TPU implementation. The important object is not one kernel. It is a compiled program over a device mesh.

```
jax.jit(lambda x, y: x + y)
        |
        v
JAX traces Python once for shapes + dtypes
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
TPU executable cached for this signature
```

### Sharding

The user names mesh axes and says which tensor dimensions live on which axes. XLA/GSPMD fills in the rest: local shapes, resharding, all-reduce, all-gather, reduce-scatter. This is why TPU code can look like one huge device. The compiler turns it back into many devices.

### Kernel

TPUs do not reward op-by-op dispatch. The chip has no cache hierarchy to rescue bad scheduling. XLA chooses layouts, fuses operations, tiles matrix multiplies onto MXUs, and schedules VMEM traffic. Pallas is the escape hatch when the compiler needs a hand-written kernel.

### Cluster

Inside one slice, collectives ride ICI. Across slices, they ride DCN. Multi-controller JAX runs one Python process per host. Pathways flips that into a single controller that can see many slices as one machine. The goal is the same either way: keep high-frequency communication inside ICI and let DCN carry only what can tolerate it.

```
host x, y
   |
   v
PJRT client moves arrays to device
   |
   v
host runtime prepares device buffers
   |
   v
HBM allocation on TPU
   |
   v
launch cached executable
   |
   v
TPU executes: read HBM -> add -> write HBM
   |
   v
copy result to host only if Python asks
```

Training survives because the compiler owns the sharding plan. Inference survives because vLLM-TPU keeps the vLLM interface but lowers the work through JAX/XLA, with TPU-specific attention and KV-cache kernels underneath.

## AMD

### Program

AMD's software bet is not a new framework. It is ROCm under the frameworks people already use. PyTorch stays PyTorch. CUDA-shaped code moves through HIP. HIP is a C++ runtime and kernel language aligned closely enough with CUDA that large parts of the ecosystem can be ported instead of rewritten.

```
torch.ones(..., device="cuda")
        |
        v
CUDA-shaped PyTorch API on ROCm
        |
        v
PyTorch dispatcher / ATen
        |
        v
HIP backend
        |
        v
TensorIterator or library call
        |
        v
HIP runtime
        |
        v
ROCm runtime + AMDGPU driver
        |
        v
AMD GPU kernel reads HBM -> writes HBM
```

### Kernel

HIP code compiles with `hipcc` or `amdclang++` into AMDGPU IR and then GFX ISA, AMD's device code. Framework operations call rocBLAS or hipBLASLt for GEMM, MIOpen for neural network primitives, Composable Kernel and Triton for fused kernels, and AITER for ROCm-specific LLM paths. Performance is library coverage plus kernel tuning.

```
torch.compile(...)
        |
        v
TorchDynamo captures an FX graph
        |
        v
Inductor chooses fused kernels
        |
        v
Triton / HIP / ROCm libraries
        |
        v
GFX ISA or prebuilt library kernel
        |
        v
HIP launch
```

### Cluster

RCCL is the collective layer. It implements all-reduce, all-gather, reduce-scatter, all-to-all, and send/receive for AMD GPUs. Inside a node it uses PCIe and xGMI. Across nodes it uses InfiniBand, RoCE, or TCP/IP. To PyTorch distributed, the shape looks familiar: ranks, tensors, collectives.

```
PyTorch / Megatron / vLLM
      -> HIP / ROCm libraries
      -> ROCm runtime + AMDGPU driver
      -> RCCL
      -> xGMI / PCIe / RoCE
```

Training survives because the stack presents familiar distributed primitives. Inference survives because vLLM and TGI can run on ROCm, then pick AITER, Triton, hipBLASLt, RCCL, and Quick Reduce where the hardware needs a fast path. The hard part is not launching a kernel. It is closing every CUDA-shaped performance gap.

## NVIDIA

### Program

NVIDIA's software bet is CUDA. PyTorch, JAX, TensorRT, Triton kernels, and most custom infrastructure eventually hit CUDA runtime or driver APIs, cuBLAS, cuDNN, CUTLASS, TensorRT, or NCCL. CUDA is not just a language. It is the contract between model code and the GPU.

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
TensorIterator or library call
        |
        v
CUDA runtime
        |
        v
CUDA driver
        |
        v
NVIDIA GPU kernel reads HBM -> writes HBM
```

### Kernel

CUDA code compiles through PTX or cubin into device code. Most users never write that code directly. They call cuBLASLt for matrix multiply, cuDNN operation graphs for fused neural network primitives, CUTLASS for template kernels, Triton for Python-written kernels, or TensorRT for inference graphs. `torch.compile`, CUDA Graphs, and TensorRT reduce launch overhead and fuse work. The library contains the hardware schedule.

```
custom CUDA / Triton / generated kernel
        |
        v
PTX or cubin
        |
        v
driver selects or JITs device code
        |
        v
SASS on the target SM
        |
        v
kernel launch on a CUDA stream
```

### Cluster

NCCL is the collective layer. It is topology-aware and optimized for PCIe, NVLink, NVSwitch, and InfiniBand. Data parallelism, tensor parallelism, pipeline parallelism, expert parallelism: they all become local kernels plus NCCL collectives. NVL72 can feel like one giant GPU only if software keeps the hot collectives inside NVLink.

```
PyTorch / JAX / TensorRT-LLM
      -> CUDA libraries + custom kernels
      -> CUDA runtime / driver
      -> NCCL
      -> NVLink / NVSwitch / InfiniBand
```

Training survives because CUDA and NCCL are the default path for the ecosystem. Inference survives because TensorRT-LLM manages tokens, not just kernels: paged KV cache, in-flight batching, chunked prefill, FP8/FP4, and tensor, pipeline, expert, and context parallelism.

## The Three Bets

Google makes the compiler the operating system. You write model code and placement hints. XLA creates shards, kernels, and collectives.

AMD makes the CUDA ecosystem portable. You keep the PyTorch/HIP mental model. ROCm swaps in an open compiler, open libraries, and AMD-specific kernels.

NVIDIA makes the library stack the machine. You call CUDA-shaped libraries. NVIDIA controls the kernels, the collectives, and the serving runtime.

The bottleneck is always the same: a tensor must either stay local or move. Hardware decides how expensive moving is. Software decides whether movement happens in the inner loop. The best stack is the one that makes the slow boundary rare.
