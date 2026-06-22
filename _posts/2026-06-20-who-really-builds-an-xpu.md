---
layout: post
title: "Who Really Builds an XPU?"
date: 2026-06-20
author: "Jayant Lohia"
description: "A practical walk through the companies and constraints behind a modern AI accelerator."
tags: [ai-infrastructure, supply-chain, hardware]
---

Start with the thing in your hand.

An XPU package shows up from the vendor. It has the logo, the HBM stacks, the interposer, the big heat spreader, the whole expensive-looking object. It is tempting to call that the product.

I don't think it is.

At that point, it is unfinished. It becomes a product only if the compiler can target it, the kernels can keep it busy, the wafer process yields enough good die, the HBM is qualified, the package survives heat and stress, the network can move gradients or KV cache, and the rack has enough power and cooling to run the thing without drama.

So the question is not just "who designed the chip?"

The better question is: who had to be right before this chip became useful?

<div class="brand-strip" aria-label="Visible accelerator logos">
  <span class="brand-chip brand-nvidia">NVIDIA</span>
  <span class="brand-chip brand-amd">AMD</span>
  <span class="brand-chip brand-google">Google</span>
  <span class="brand-chip brand-aws">AWS</span>
  <span class="brand-chip brand-broadcom">Broadcom</span>
</div>

I am using XPU loosely here: GPU, TPU, Trainium, inference ASIC, custom hyperscaler accelerator. The names differ. The failure modes rhyme.

<div class="xpu-flow" aria-label="XPU supply chain flow">
  <div class="flow-step flow-demand">
    <span class="flow-index">01</span>
    <div>
      <strong>Bet and demand</strong>
      <p>Someone first makes a risky technical bet. Later, demand decides whether capacity scales.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-architecture">
    <span class="flow-index">02</span>
    <div>
      <strong>Architecture</strong>
      <p>The designer chooses the boundary: GPU, TPU, ASIC, memory, fabric, and programming model.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-software">
    <span class="flow-index">03</span>
    <div>
      <strong>Software</strong>
      <p>Compilers, kernels, runtimes, and collectives decide whether the silicon is reachable.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-eda">
    <span class="flow-index">04</span>
    <div>
      <strong>EDA and IP</strong>
      <p>The design has to close timing, verify, simulate, and integrate known-good blocks.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-foundry">
    <span class="flow-index">05</span>
    <div>
      <strong>Foundry and yield</strong>
      <p>Wafers, EUV, etch, deposition, inspection, test, and binning turn masks into sellable parts.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-package">
    <span class="flow-index">06</span>
    <div>
      <strong>HBM and packaging</strong>
      <p>Compute dies, memory stacks, interposers, substrates, thermals, and assembly yield meet.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-network">
    <span class="flow-index">07</span>
    <div>
      <strong>Network, rack, power</strong>
      <p>The accelerator becomes a cluster only after it can communicate, cool, and run.</p>
    </div>
  </div>
</div>

## 1. The Unit Is the Working Cluster

A chip is the wrong unit of analysis.

The working unit is closer to this:

```
model code
  -> compiler and libraries
  -> device kernels
  -> HBM
  -> package
  -> rack fabric
  -> scale-out network
  -> power and cooling
```

If you remove any one of those arrows, the benchmark slide gets very theoretical. A model does not care that a chip has enormous FP4 throughput if the real serving path spends its time waiting on a collective, spilling memory, or crossing a slow host boundary.

This is the same lesson as the earlier hardware and software posts. The fast zone matters. The boundary matters. The annoying part is that in the supply chain, the boundary can be anywhere: inside the compiler, inside the package, inside the rack, or outside the building at the substation.

## 2. Demand Does Not Invent Everything

The line "demand builds the chip" is too clean.

CUDA is the obvious correction. NVIDIA introduced CUDA in 2006, long before the current AI boom made general GPU computing look inevitable. That was a technical bet first. The demand arrived later.

This pattern shows up a lot in semiconductors. Someone makes a bet before the spreadsheet can fully justify it: programmable shaders, general-purpose GPUs, chiplets, HBM, high-radix switching, compiler-first accelerators. Sometimes the bet dies. Sometimes it sits around looking weird for years. Then a workload arrives and suddenly the old bet becomes the new bottleneck.

So I would split demand into two different jobs.

The first job is permission to speculate. A company decides that a future workload is worth years of R&D.

The second job is permission to scale. That is where 2026 looks different. Suppliers do not add HBM lines, CoWoS capacity, optical-module capacity, or liquid-cooling manufacturing because a startup has a beautiful deck. They add capacity when downstream demand looks real enough to buy through the risk.

That is why OpenAI/Broadcom talking about 10 GW of custom accelerators matters. That is why Meta's capex guide matters. Those numbers are messages to memory vendors, package houses, ODMs, optics suppliers, utilities, and lenders.

Speculation creates the path. Demand decides how wide the path gets.

## 3. Architecture Is a Bet on Pain

An architecture is not only a performance target. It is a decision about which problems you are willing to own.

NVIDIA owns a lot of the stack on purpose: GPU, CPU attach, NVLink, networking, CUDA, libraries, collectives, serving software. The upside is a very controlled fast path. The cost is that customers live inside NVIDIA's world.

AMD is trying to make a different trade. The bet is high-memory GPUs, ROCm, open interconnect direction, and a second serious path for customers who want supply diversity and more control. That is hard because compatibility is not the same as performance. A CUDA-shaped program can run and still miss the tuned path.

Google and AWS have another advantage: they own large workloads. A TPU or Trainium system does not have to be a perfect general-purpose GPU replacement if the internal model path is known, the compiler stack is controlled, and the fleet scheduler can absorb the quirks.

Broadcom sits in a different place again. In custom silicon, the customer brings workload volume and system requirements; the silicon partner helps turn that into something that can be manufactured and deployed.

None of these choices are morally better. They move pain around. Generality creates software burden. Specialization creates workload risk. Rack-scale integration creates cooling and service risk. Giant memory systems create HBM and packaging risk.

## 4. Software Is Part of the Supply Chain

This is the easiest layer to accidentally wave away.

The software is not "on top" of the accelerator. The software is the route into it. A tensor expression has to become a graph. The graph has to become kernels. The kernels have to become instructions. The runtime has to put buffers in the right memory. The collective library has to move data along the right links. If the stack misses any of those, the hardware does not get to show off.

For a simple mental picture:

```
PyTorch / JAX / model code
        |
        v
graph capture or tracing
        |
        v
compiler or library planner
        |
        v
kernel launch + collective schedule
        |
        v
driver, queues, DMA, HBM, tensor units, network
```

The last line is where the abstraction hits metal.

On NVIDIA, this means CUDA, cuBLAS, cuDNN, TensorRT, NCCL, Triton paths, drivers, profilers, and a lot of developer habit. On AMD, it means HIP, ROCm libraries, RCCL, Triton/Inductor support, Composable Kernel, AITER, drivers, and the work of making familiar PyTorch code land on fast AMD kernels. On TPU, it means XLA, PJRT, JAX, PyTorch/XLA, Pallas, and the TPU runtime. On Trainium, it means Neuron compiler/runtime and framework integration.

This layer fails quietly. You do not always get a crash. You get 42% utilization and a week of staring at traces. One unsupported dtype, one bad layout, one unfused attention path, one collective choosing the wrong route, one host sync in the decode loop, and the expensive hardware politely waits.

So yes: kernel writers, compiler engineers, framework maintainers, library teams, profiler authors, and distributed-runtime people are part of who builds an XPU.

### A Small Ugly Example

Here is the kind of software failure I mean. The Python looks innocent:

```python
# looks like one operation in your head
y = torch.relu(x + bias)
```

If capture/fusion works, this is boring. Load `x`, load `bias`, add, clamp at zero, store `y`. One pass over memory.

If fusion misses, the machine may do something closer to this:

```text
# kernel 1
global_load_dword   v0, ...
global_load_dword   v1, ...
v_add_f32           v2, v0, v1
global_store_dword  tmp, v2

# kernel 2
global_load_dword   v3, tmp
v_max_f32           v4, v3, 0
global_store_dword  y, v4
```

The bad part is not that `v_add_f32` or `v_max_f32` is slow. The bad part is the extra trip through HBM and the kernel boundary. You wrote one expression. The device saw two launches, a temporary tensor, a store, a reload, and a bubble where useful work could have been happening.

In a hand-tuned HIP path, you try very hard to keep the value in registers:

```cpp
// sketch, not a benchmark claim
float4 xv = *reinterpret_cast<const float4*>(x + i);
float4 bv = *reinterpret_cast<const float4*>(bias + i);

xv.x = fmaxf(xv.x + bv.x, 0.0f);
xv.y = fmaxf(xv.y + bv.y, 0.0f);
xv.z = fmaxf(xv.z + bv.z, 0.0f);
xv.w = fmaxf(xv.w + bv.w, 0.0f);

*reinterpret_cast<float4*>(y + i) = xv;
```

On CDNA, the disassembly you are hoping to see is the boring one: wide/coalesced loads, vector ALU, wide store, no unnecessary round trip through memory. In real low-level work you may go even lower, using AMDGPU intrinsics or inline assembly to force a particular load/store shape (for example a `global_load_dwordx4`-style vector load) when the compiler refuses to give it to you.

That is the micro-version of the whole supply-chain argument. The XPU can be perfect on paper, but if one compiler decision inserts an extra memory trip in the hot path, the expensive package is now waiting on software.

## 5. EDA and IP Buy Back Calendar

Before the chip is a chip, it is an argument with physics.

Timing has to close. Power has to fit. The floorplan has to make sense. SerDes has to work. HBM PHYs have to train. UCIe or PCIe or CXL blocks have to behave. Firmware has to bring the thing up. Verification has to catch the bug before the package does.

This is where Cadence, Synopsys, Siemens EDA, Ansys, Arm, RISC-V IP vendors, SerDes vendors, and verification-IP vendors become part of the product.

EDA is not the same kind of constraint as HBM. It is not usually "we need 100 million more units." It is calendar risk. Miss timing, slip the tapeout. Miss a package stress issue, respin. Miss a coherency bug, enjoy the worst kind of bring-up.

Pre-validated IP is boring in the way plumbing is boring. You only notice it when it fails. Arm Neoverse CSS, hardened PHYs, verified protocol blocks, foundry-certified flows: these are all ways of buying back months.

## 6. Yield Is a Distribution, Not a Yes/No

Yield is where the spreadsheet meets dust.

A wafer does not come back as a pile of good chips and bad chips. It comes back as a map. Some dies are dead. Some pass at lower voltage. Some pass at lower frequency. Some have a broken cache slice, compute unit, memory channel, or link. Some work electrically but miss the power bin. Some are good enough for a lower SKU.

That is binning. You test the silicon, classify it, fuse off what can be fused off, and sell the part where it fits. The top bin is only one outcome. The business is the distribution.

Large accelerators make this nastier because area is expensive. A bigger die gives defects more places to land. Chiplets help because a defect kills a smaller unit, but now packaging has to assemble multiple known-good pieces into one working object. The yield of the final accelerator is a product of many yields: compute die, HBM stack, base die, interposer or bridge, organic substrate, assembly, test.

That is why KLA-style inspection and metrology are not background factory details. A particle, overlay error, film-thickness drift, or pattern-placement problem changes how many top-bin parts exist. It changes cost. It changes allocation. It changes who gets product first.

One perfect die is a demo. A healthy bin stack is a business.

## 7. HBM and Packaging Are Where the Chip Gets Heavy

Modern AI accelerators are mostly a fight over feeding math units.

HBM is not ordinary memory sitting nearby. It is stacked DRAM, TSVs, base dies, thermal paths, test time, package routing, and customer qualification. SK hynix, Samsung, and Micron are not just shipping interchangeable memory blocks. Their roadmaps are tied to accelerator roadmaps.

Then comes packaging, which sounds much calmer than it is.

In a CoWoS-style package, logic and HBM sit close enough that the accelerator can move huge amounts of data without leaving the package. The price is mechanical ugliness. Silicon, organic substrate, solder bumps, underfill, heat spreader, cold plate: these materials expand differently. The package heats, cools, bows, and gets clamped into a server. Signals still have to arrive cleanly. Power still has to arrive without too much noise. HBM still has to stay inside its thermal limits.

That is the part hidden by the word "advanced." It is not advanced like a shiny feature. It is advanced like a bridge that cannot crack when traffic and weather change at the same time. (If you have ever seen an organic substrate warp under thermal load, you understand why packaging people do not sleep normally.)

The chip is born at tapeout. The accelerator becomes real at package-out.

## 8. The Network Decides Whether the Cluster Is One Machine

One accelerator is rarely the product. The cluster is.

Inside a rack, NVIDIA's answer is NVLink/NVSwitch: keep a group of GPUs in a fast domain where collectives and model parallelism hurt less. Across racks, the story moves to InfiniBand, Spectrum-X, Ethernet, optics, congestion control, and topology.

The open-Ethernet side has Broadcom, Marvell, Cisco, Arista, UEC, UALink, SONiC, high-speed NICs, DSPs, and optical vendors. The reason this fight matters is simple: whoever controls the network controls how easily the cluster can be built, expanded, debugged, and swapped between vendors.

The model does not see "networking." It sees bubbles.

Training sees a slow all-reduce. Inference sees KV cache in the wrong place, prefill/decode imbalance, expert routing overhead, or tail latency. The cluster may have enough raw FLOPs, but the step time or token latency says otherwise.

That pushes optics into the critical path. Copper runs out of reach as bandwidth rises. 800G and 1.6T links need lasers, DSPs, silicon photonics, modules, test, and serviceability. At some point, the network bill becomes part of the accelerator bill.

## 9. The Rack and Grid Get the Last Vote

After all that, someone still has to put the machine in a building.

The rack has GPUs or XPUs, CPUs, NICs, switches, busbars, power shelves, cold plates, manifolds, CDUs, firmware, cables, leak detection, burn-in, and service procedures. Supermicro, Dell, HPE, Foxconn, Quanta, Wistron, Wiwynn, Lenovo, and the rest of the OEM/ODM world turn allocation into something a customer can actually deploy.

Then the site has to feed it. A 100 kW-class rack is not a normal server rack with better fans. It changes power distribution, cooling loops, floor planning, maintenance, and failure modes. At larger scale, the problem leaves the data hall and becomes transformers, switchgear, utility interconnects, permits, water, heat rejection, and construction schedules.

This is the point where a chip roadmap and a substation roadmap collide.

The chip team can tape out faster than the utility can energize a site. That is not a metaphor. It is one of the more boring, real constraints in AI infrastructure.

## 10. Where This Breaks

The chain is not a neat waterfall.

Software changes architecture. Yield changes SKU design. Packaging changes die partitioning. Power changes rack density. Networking changes parallelization strategy. The arrows go both ways, and they usually go both ways late in the schedule.

That is why "custom silicon will replace GPUs" is too lazy, and "CUDA makes NVIDIA unbeatable" is also too lazy. A hyperscaler can use a custom accelerator because it owns the workload, compiler integration, fleet scheduler, deployment environment, and demand. A merchant GPU has to work for messy external customers whose code paths were not all planned in advance.

There is no free layer. A custom kernel can be fast and brittle. An open interconnect can reduce lock-in and still take years to become boring. A giant package can give bandwidth and hurt yield. Liquid cooling can raise density and make field service more annoying.

Every company is choosing where to accept pain.

The bottleneck will keep moving. HBM4 one quarter. CoWoS-L or SoIC the next. Substrates after that. Then 1.6T optics, CDUs, power shelves, transformers, deployment labor, or grid interconnects.

Custom silicon grows where the buyer owns the workload. Ethernet gains where buyers want replaceability. Proprietary scale-up fabrics stay strong where the system owner can keep a tight fast domain and charge for the integrated path.

The package becomes as important as the die. The question is not only "how fast is the chip?" It is "how much memory and bandwidth can the package sustain, and how many good ones can be built?"

Power is the cleanest constraint because it is hard to hand-wave. Either the site has megawatts, cooling, switchgear, and permits, or it does not.

## Source Trail

- CUDA as early speculative software platform: [NVIDIA CUDA programming guide](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/introduction.html), [NVIDIA CUDA platform](https://developer.nvidia.com/cuda)
- Jensen Huang on downstream demand and supply-chain alignment: [Dwarkesh interview](https://www.dwarkesh.com/p/jensen-huang)
- Demand signals: [OpenAI and Broadcom 10 GW collaboration](https://investors.broadcom.com/news-releases/news-release-details/openai-and-broadcom-announce-strategic-collaboration-deploy-10), [Meta 2026 capex guidance](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx)
- Software paths: [NVIDIA NCCL](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html), [AMD RCCL](https://rocm.docs.amd.com/projects/rccl/en/latest/what-is-rccl.html), [ROCm compiler reference](https://rocm.docs.amd.com/projects/llvm-project/en/latest/reference/rocmcc.html), [Clang AMDGPU builtins](https://clang.llvm.org/docs/AMDGPUBuiltinReference.html), [Google Cloud TPU and XLA](https://docs.cloud.google.com/tpu/docs/intro-to-tpu), [AWS Neuron](https://awsdocs-neuron.readthedocs-hosted.com/)
- EDA and IP: [Cadence Q1 2026](https://investor.cadence.com/news/news-details/2026/Cadence-Reports-First-Quarter-2026-Financial-Results/default.aspx), [Synopsys 2025 10-K](https://www.sec.gov/Archives/edgar/data/883241/000088324125000028/snps-20251031.htm), [Arm Neoverse CSS](https://www.arm.com/products/cloud-datacenter/neoverse-compute-subsystems)
- Foundry, yield, and equipment: [TSMC 2025 annual report](https://investor.tsmc.com/static/annualReports/2025/english/index.html), [ASML 2025 financials](https://www.asml.com/en/investors/annual-report/2025/financials), [KLA defect inspection](https://www.kla.com/products/chip-manufacturing/defect-inspection-review)
- HBM and packaging: [Micron HBM4](https://investors.micron.com/news-releases/news-release-details/micron-high-volume-production-hbm4-designed-nvidia-vera-rubin), [SK hynix HBM4](https://news.skhynix.com/sk-hynix-completes-worlds-first-hbm4-development-and-readies-mass-production/), [Samsung and AMD HBM4](https://news.samsung.com/global/samsung-and-amd-expand-strategic-collaboration-on-next-generation-ai-memory-solutions), [TSMC CoWoS](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm), [Intel advanced packaging](https://www.intel.com/content/www/us/en/foundry/packaging.html), [Ajinomoto ABF](https://www.ajinomoto.com/innovation/our_innovation/buildupfilm)
- Networking, racks, power: [NVIDIA GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), [Broadcom Tomahawk 6](https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-6-worlds-first-1024-tbps-switch), [Marvell Teralynx](https://www.marvell.com/products/switching/teralynx.html), [IEA Energy and AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai), [Vertiv and NVIDIA 7 MW reference architecture](https://www.vertiv.com/en-us/about/news-and-insights/articles/educational-articles/vertiv-and-nvidia-collaborate-on-7mw-reference-architecture-for-nvidia-gb200-nvl72-platform/)

## TL;DR

**An XPU is not finished when the die works. It is finished when the software path, yield curve, HBM supply, package, network, rack, and power all line up well enough that real models run cheaply and reliably. The logo names the designer. The schedule tells you who else built it.**
