---
layout: post
title: "Who Really Builds an XPU?"
date: 2026-06-20
author: "Jayant Lohia"
description: "An XPU is built by speculation, demand, software, yield, packaging, networks, racks, and power."
tags: [ai-infrastructure, supply-chain, hardware]
---

When people talk about XPUs, they usually start with FLOPs. That is already a little wrong.

FLOPs are the part of the story that fits on a slide. The harder question is: how does this die become a useful computer inside a paid-for cluster?

That question is where the logo starts to fade. NVIDIA, AMD, Google, AWS, Broadcom, Cerebras, Groq: the visible company designs the object you can name. But an XPU is really built by a chain of people who make increasingly physical promises: the compiler will lower this graph, the kernel will use the tensor units, the wafer will yield, the HBM will arrive, the package will survive heat, the network will carry collectives, the rack will cool, and the grid will feed it.

If any one of those promises breaks, the XPU is not an accelerator. It is an expensive heater with a nice spec sheet.

<div class="brand-strip" aria-label="Visible accelerator logos">
  <span class="brand-chip brand-nvidia">NVIDIA</span>
  <span class="brand-chip brand-amd">AMD</span>
  <span class="brand-chip brand-google">Google</span>
  <span class="brand-chip brand-aws">AWS</span>
  <span class="brand-chip brand-broadcom">Broadcom</span>
</div>

By XPU, I mean the general object: GPU, TPU, Trainium, inference ASIC, custom hyperscaler accelerator. Different names. Same physical question.

What has to be true before this thing turns electricity into tokens?

<div class="xpu-flow" aria-label="XPU supply chain flow">
  <div class="flow-step flow-demand">
    <span class="flow-index">01</span>
    <div>
      <strong>Speculation and demand</strong>
      <p>Someone first makes a risky bet. Later, someone commits enough workload and money to scale it.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-architecture">
    <span class="flow-index">02</span>
    <div>
      <strong>Architecture</strong>
      <p>The chip owner chooses the boundary: GPU, TPU, ASIC, memory size, fabric, software surface.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-software">
    <span class="flow-index">03</span>
    <div>
      <strong>Software</strong>
      <p>Compilers, kernels, runtimes, and collectives decide whether silicon is actually reachable.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-eda">
    <span class="flow-index">04</span>
    <div>
      <strong>EDA and IP</strong>
      <p>The design must close timing, verify, simulate, and integrate known-good blocks.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-foundry">
    <span class="flow-index">05</span>
    <div>
      <strong>Foundry and yield</strong>
      <p>Wafers, EUV, deposition, etch, inspection, binning, and yield turn design into sellable silicon.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-package">
    <span class="flow-index">06</span>
    <div>
      <strong>HBM and packaging</strong>
      <p>Compute dies, memory stacks, interposers, substrates, thermals, and assembly yield collide.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-network">
    <span class="flow-index">07</span>
    <div>
      <strong>Network, rack, power</strong>
      <p>The accelerator becomes useful only when it can communicate, cool, and run.</p>
    </div>
  </div>
</div>

The logo on the package tells you who designed the XPU. The bottleneck tells you who really built it.

## The Mechanism

### 1. The Unit Is Not the Chip

A chip by itself is not useful. It becomes useful when model code can reach it, data can stay near it, neighboring chips can talk to it, the rack can cool it, and the building can power it.

So the unit is not:

```
chip
```

The unit is:

```
powered accelerator
inside a rack
inside a cluster
running a model path
that customers actually use
```

Anything before that is inventory. This changes the question from "who makes the best chip?" to "which layer decides whether the chip becomes a deployed computer?"

### 2. Demand Is a Flywheel, Not a Starting Gun

It is tempting to make demand sound like the beginning of the story. That is too neat.

The semiconductor industry does not move only because customers already know what they want. CUDA is the obvious counterexample. NVIDIA introduced CUDA in 2006, years before deep learning became the demand monster that later made CUDA look inevitable. That was not downstream AI demand pulling a perfect product into existence. That was speculative R&D: a company betting that GPUs should become programmable computers, not just graphics engines.

So the better model is a flywheel. Speculation creates the possibility. Early weird users prove there is something there. Demand arrives later and makes the supply chain scale.

In 2026, the scaling part is brutal. Suppliers do not expand HBM, CoWoS, optics, liquid cooling, or power infrastructure for a vague dream. They expand when a buyer can credibly consume the capacity. This is why Jensen Huang talks about supply-chain alignment: not because demand invented accelerated computing, but because demand now decides who gets scarce capacity.

OpenAI and Broadcom talking about 10 GW of custom accelerators is not just a chip story. Meta guiding more than $100B of 2026 capex is not just a finance story. Those are signals to fabs, memory vendors, package houses, optics suppliers, rack builders, utilities, and lenders.

Speculation starts the curve. Demand steepens it.

### 3. Architecture Chooses the Boundary

The architecture owner decides what kind of pain the XPU is allowed to have.

NVIDIA draws the boundary around a full accelerated-computing platform: GPU, CPU, NVLink, networking, CUDA, libraries, collectives, and serving runtime. AMD draws a different boundary: high-memory GPUs, ROCm, open interconnect direction, and a credible second path for buyers who care about supply diversity, economics, and control. Google and AWS draw the boundary around owned workloads; they do not need to replace every merchant GPU in the world if they can make their own training and inference paths efficient enough.

Broadcom draws another boundary: custom silicon for hyperscalers. The buyer brings workload volume and system requirements. Broadcom helps turn that into a deployable accelerator path.

These are not just product choices. They are supply-chain choices. If you choose a general GPU, you inherit a wide software burden. If you choose a custom ASIC, you inherit a narrower workload but a harder planning problem. If you choose a rack-scale system, you inherit networking, thermals, serviceability, and power delivery. If you choose enormous HBM, you inherit HBM allocation and packaging risk.

Architecture is the first strategic choice. It is not the last bottleneck.

### 4. Software Is a Physical Layer

This is the layer people underplay.

Software is not a wrapper around the XPU. Software is the way the XPU becomes visible to the model. A tensor expression has to become a graph, a graph has to become kernels, kernels have to become device instructions, collectives have to move gradients or activations, and the runtime has to keep the device fed without forcing the host to babysit every tiny step.

The path looks roughly like this:

```
model code
   |
   v
framework graph
   |
   v
compiler / library planner
   |
   v
kernel + collective schedule
   |
   v
driver / runtime
   |
   v
streams, queues, DMA, HBM, tensor units, network
```

That last line is the giveaway. Good software is physical. It decides whether bytes sit in HBM or bounce through host memory, whether a matmul lands on tensor cores or a slower path, whether an all-reduce uses the right topology, whether a decode loop reuses KV cache, and whether a graph gets captured once or relaunched from Python like a nervous intern pressing a button.

For NVIDIA, this layer is CUDA, cuBLAS, cuDNN, TensorRT, NCCL, Triton paths, profilers, drivers, and a huge amount of developer muscle memory. For AMD, it is HIP, ROCm libraries, RCCL, Triton/Inductor support, Composable Kernel, AITER, drivers, and the work of making CUDA-shaped code land on tuned AMD paths. For Google, it is XLA, PJRT, JAX, PyTorch/XLA, Pallas, and TPU runtime machinery. For AWS, it is Neuron compiler, Neuron runtime, PyTorch/JAX/vLLM integration, and Trainium fleet operations.

If this layer is weak, the cluster does not fail dramatically. It just idles. Utilization disappears into tiny launch overheads, bad fusion, poor layout, unsupported dtypes, slow collectives, memory fragmentation, or one untuned attention kernel. The silicon still exists. The product does not.

This is why compilers, kernel engineers, collective-library teams, framework maintainers, and performance-debugging tools are part of the XPU supply chain. Not metaphorically. Literally. They decide whether the expensive physical object can be used.

### 5. EDA Makes the Idea Real

Before an XPU becomes silicon, it becomes constraints: timing, power, floorplan, signal integrity, package stress, thermal limits, verification coverage, firmware, security, and bring-up. This is where Cadence, Synopsys, Siemens EDA, Ansys, Arm, RISC-V IP vendors, SerDes IP vendors, PCIe, CXL, UCIe, and HBM PHY/controller IP enter the story.

EDA is not a volume bottleneck like HBM. It is a calendar bottleneck.

If the design misses timing closure, it slips. If the HBM interface does not behave, it slips. If package thermals are wrong, it slips. If verification misses a bug, the chip can come back alive but wrong, which is worse.

Pre-validated IP is valuable because it reduces the number of ways a multi-billion-dollar tapeout can fail. Arm's Neoverse CSS pitch is basically this: do not spend engineering years rebuilding the boring-but-deadly part of the infrastructure chip. Use a verified subsystem and spend your risk budget on what makes the product different.

That is not commodity work. That is calendar compression.

### 6. Yield Is Not Pass/Fail

Yield is not a boolean. A wafer does not come back as "good" or "bad." It comes back as a map of imperfect physical objects.

Some dies are dead. Some work at lower voltage. Some hit a lower clock. Some have a defective cache slice, compute unit, memory channel, or link. Some are perfect but cannot fit the thermal or power envelope of the top SKU. The manufacturer tests them, classifies them, fuses off broken parts when the design allows it, and sells different bins into different products.

This is the economics hiding under the spec sheet. A giant XPU die is exposed to more defect opportunities because it occupies more area. Chiplets reduce the blast radius of a single defect, but they add package complexity. A multi-die accelerator has to assemble known-good compute dies, HBM stacks, base dies, interposer or bridge routing, organic substrate, bumps, underfill, lids, and cooling hardware. The final yield is not one yield. It is a chain of yields.

That is why inspection and metrology matter so much. KLA is not just finding dust because dust is untidy. A particle, overlay error, film-thickness drift, or pattern-placement error becomes lower yield, lower bins, fewer sellable top parts, or a delayed ramp.

One perfect die is a demo. A distribution of sellable bins is a business.

### 7. HBM and Packaging Make the XPU Physical

AI accelerators are memory products pretending to be compute products. The math units get the attention, but they are useless if bytes cannot arrive fast enough.

HBM is strategic because it is not just DRAM near a GPU. It is stacked memory, TSVs, base dies, thermal limits, package routing, test, qualification, and allocation to specific platforms. SK hynix, Samsung, and Micron do not just sell a bag of bits. For HBM4-class systems, the memory roadmap is tied tightly to the accelerator roadmap.

Packaging is where those roadmaps become matter.

TSMC's CoWoS is famous because it puts logic and HBM close enough to move huge amounts of data without leaving the package. But the physical picture is not elegant. You have silicon dies, HBM stacks, interposers or bridges, an organic substrate, solder bumps, underfill, heat spreaders, cold plates, and a lot of materials that expand differently when heated. Silicon barely moves compared with organic substrate. The rack heats up, cools down, and cycles load. The package has to survive that without cracking bumps, warping the substrate, breaking signals, or cooking the memory.

This is why "advanced packaging" is a bad phrase. It sounds like a box. It is closer to a tiny city where power, heat, and traffic all fight each other.

The XPU is born at tape-out. It becomes useful at package-out.

### 8. Networking Decides Whether Many XPUs Are One Computer

One XPU is not enough. The moment a model needs many accelerators, networking becomes part of the accelerator.

Inside the rack, NVIDIA's answer is NVLink and NVSwitch. The goal is to make 72 GPUs behave like one large fast domain. Across racks, NVIDIA pushes InfiniBand and Spectrum-X Ethernet. The open Ethernet counterweight comes from Broadcom, Marvell, and the larger Ethernet ecosystem: Tomahawk, Jericho, Thor, Teralynx, high-speed NICs, DSPs, optics, UEC, UALink, and SONiC.

The technical question is simple:

```
Do many XPUs act like one computer,
or do they act like expensive islands?
```

Training stresses all-reduce, reduce-scatter, all-gather, pipeline bubbles, expert routing, and failure recovery. Inference stresses KV cache placement, prefill/decode separation, routing, batching, and tail latency. If the network is wrong, utilization falls. The chip can still be fast. The cluster is slow.

This is why optics are becoming strategic. Copper reach gets harder as speeds rise. 800G and 1.6T links, silicon photonics, co-packaged optics, lasers, DSPs, and optical module capacity start to look like the next CoWoS-like bottleneck.

The network is no longer outside the accelerator. It is the part that decides whether the accelerator scales.

### 9. The Rack and Grid Finish the Product

A rack used to sound boring. Now it is where the promises collide.

The rack has GPUs or XPUs, CPUs, NICs, switches, power shelves, busbars, cooling manifolds, cold plates, CDUs, firmware, cables, leak detection, service procedures, burn-in, and deployment support. Supermicro, Dell, HPE, Foxconn, Quanta, Wistron, Wiwynn, Lenovo, and other OEMs and ODMs are not just putting boxes in metal frames. They are turning chip allocation into deployable machines.

Then the building has to run it. AI racks are moving into the 100 kW-plus class. Vertiv and NVIDIA have published reference architecture around multi-megawatt GB200 deployments. Schneider and Eaton are building modular liquid-cooling and power systems for AI factories. The IEA projects global data-center electricity demand to more than double by 2030, with AI as the main driver.

At first you ask:

```
Can we get the chip?
```

Then the question becomes:

```
Can we get the HBM?
Can we get the package?
Can we get the rack?
Can we get the optics?
```

Finally:

```
Can this building actually run it?
```

A chip can tape out faster than a substation can be permitted, built, and energized. That sentence is the supply-chain problem in 2026.

## Where This Breaks

This story breaks if you treat the chain as a clean waterfall. It is not. Software feeds back into architecture. Yield feeds back into SKU design. Packaging feeds back into die size. Power feeds back into rack density. A custom XPU can look brilliant in a workload spreadsheet and still lose if the compiler cannot keep its units fed.

It also breaks if you assume every customer wants the same thing. A hyperscaler can make a custom accelerator work because it owns the model path, fleet, compiler integration, scheduling, and demand. A startup selling a general replacement GPU has to recreate a much wider surface area: software, libraries, developer trust, cloud supply, networking, debugging tools, and support.

There is no free layer. A custom kernel can be fast and hardware-brittle. An open interconnect can reduce lock-in and still take years to mature. A giant package can increase bandwidth and make yield harder. A liquid-cooled rack can raise density and make field service more painful.

The honest version is not "this company wins." It is: every company is choosing where to accept pain.

## Who Captures Value?

Value goes where the bottleneck is hard to replace.

Platform owners capture value when they control both demand and the software path. This is why CUDA matters. This is why ROCm matters. This is why XLA, Neuron, and custom hyperscaler stacks matter. Software decides whether hardware lands on the fast path.

Foundries and equipment suppliers capture value because physics is slow. You cannot wish a qualified leading-edge process into existence. You cannot replace EUV, etch, deposition, inspection, metrology, and yield learning with a press release.

HBM suppliers capture value because memory is no longer a commodity add-on. Packaging suppliers capture value because the product boundary has moved into the package. Networking and optics suppliers capture value because the cluster is the computer. Power and cooling suppliers capture value when deployment, not chip supply, becomes the limiter.

The lower-margin actor can still be the schedule owner. A rack integrator may not capture NVIDIA-like gross margin, but if it cannot integrate, test, cool, and ship the rack, the cluster does not exist.

## The 2026 Read

My read is that the next XPU bottleneck will rotate rather than sit in one place: HBM4, CoWoS-L and SoIC, advanced substrates, 800G and 1.6T optics, liquid cooling, power-to-rack, deployment labor, and grid interconnects.

Custom silicon will keep growing, but mostly where the buyer owns the workload. Ethernet will keep gaining importance where buyers want openness and replaceability. Proprietary scale-up fabrics will still win where the system owner can preserve a tight fast domain and charge for the whole integrated path.

Package architecture will matter as much as chip architecture. The question will not be only "how fast is the die?" It will be "how much memory and bandwidth can the package sustain, and can that package be built in volume?"

Power becomes the cleanest external constraint. It is less ambiguous than benchmarks. Either the site has megawatts, cooling, transformers, switchgear, and permits, or it does not.

## Source Trail

- CUDA as speculative software platform: [NVIDIA CUDA programming guide](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/introduction.html), [NVIDIA CUDA platform](https://developer.nvidia.com/cuda)
- Jensen Huang on downstream demand and supply-chain alignment: [Dwarkesh interview](https://www.dwarkesh.com/p/jensen-huang)
- Demand signals: [OpenAI and Broadcom 10 GW collaboration](https://investors.broadcom.com/news-releases/news-release-details/openai-and-broadcom-announce-strategic-collaboration-deploy-10), [Meta 2026 capex guidance](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx)
- Software paths: [NVIDIA NCCL](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/overview.html), [AMD RCCL](https://rocm.docs.amd.com/projects/rccl/en/latest/what-is-rccl.html), [Google Cloud TPU and XLA](https://docs.cloud.google.com/tpu/docs/intro-to-tpu), [AWS Neuron](https://awsdocs-neuron.readthedocs-hosted.com/)
- EDA and IP: [Cadence Q1 2026](https://investor.cadence.com/news/news-details/2026/Cadence-Reports-First-Quarter-2026-Financial-Results/default.aspx), [Synopsys 2025 10-K](https://www.sec.gov/Archives/edgar/data/883241/000088324125000028/snps-20251031.htm), [Arm Neoverse CSS](https://www.arm.com/products/cloud-datacenter/neoverse-compute-subsystems)
- Foundry, yield, and equipment: [TSMC 2025 annual report](https://investor.tsmc.com/static/annualReports/2025/english/index.html), [ASML 2025 financials](https://www.asml.com/en/investors/annual-report/2025/financials), [KLA defect inspection](https://www.kla.com/products/chip-manufacturing/defect-inspection-review)
- HBM and packaging: [Micron HBM4](https://investors.micron.com/news-releases/news-release-details/micron-high-volume-production-hbm4-designed-nvidia-vera-rubin), [SK hynix HBM4](https://news.skhynix.com/sk-hynix-completes-worlds-first-hbm4-development-and-readies-mass-production/), [Samsung and AMD HBM4](https://news.samsung.com/global/samsung-and-amd-expand-strategic-collaboration-on-next-generation-ai-memory-solutions), [TSMC CoWoS](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm), [Intel advanced packaging](https://www.intel.com/content/www/us/en/foundry/packaging.html), [Ajinomoto ABF](https://www.ajinomoto.com/innovation/our_innovation/buildupfilm)
- Networking, racks, power: [NVIDIA GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), [Broadcom Tomahawk 6](https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-6-worlds-first-1024-tbps-switch), [Marvell Teralynx](https://www.marvell.com/products/switching/teralynx.html), [IEA Energy and AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai), [Vertiv and NVIDIA 7 MW reference architecture](https://www.vertiv.com/en-us/about/news-and-insights/articles/educational-articles/vertiv-and-nvidia-collaborate-on-7mw-reference-architecture-for-nvidia-gb200-nvl72-platform/)

## TL;DR

**An XPU is not a chip. It is a promise stack. Speculative R&D creates the possibility, demand scales the capacity, software makes the silicon reachable, yield makes it economical, packaging makes it physical, networking makes it collective, and power makes it real. There is a lot of work left before this whole machine becomes boring. Strap in.**
