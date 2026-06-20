---
layout: post
title: "Who Really Builds an XPU?"
date: 2026-06-20
author: "Jayant Lohia"
description: "An AI accelerator is not built by one company. It is built by the slowest qualified layer in the supply chain."
tags: [ai-infrastructure, supply-chain, hardware]
---

A chip announcement makes the supply chain disappear.

You see the logo. You see the HBM size. You see the rack name. You see the performance chart.

That is the clean picture.

The real picture is uglier and more useful: an XPU is not built by one company. It is built by a chain, and the chain is only as fast as the slowest qualified layer.

Use one accelerator as the microscope.

By XPU, I mean the general object: GPU, TPU, Trainium, inference ASIC, custom hyperscaler accelerator. Different names. Same physical question.

What has to be true before this thing can turn electricity into tokens?

<div class="brand-strip" aria-label="Visible accelerator logos">
  <span class="brand-chip brand-nvidia">NVIDIA</span>
  <span class="brand-chip brand-amd">AMD</span>
  <span class="brand-chip brand-google">Google</span>
  <span class="brand-chip brand-aws">AWS</span>
  <span class="brand-chip brand-broadcom">Broadcom</span>
</div>

The visible company designs the thing you can name. But before the XPU shows up in a rack, many invisible companies had to be right first.

<div class="xpu-flow" aria-label="XPU supply chain flow">
  <div class="flow-step flow-demand">
    <span class="flow-index">01</span>
    <div>
      <strong>Demand</strong>
      <p>Someone commits enough model workload and money to justify capacity.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-architecture">
    <span class="flow-index">02</span>
    <div>
      <strong>Architecture</strong>
      <p>The chip owner chooses the boundary: general GPU, TPU, ASIC, memory size, fabric, software surface.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-eda">
    <span class="flow-index">03</span>
    <div>
      <strong>EDA and IP</strong>
      <p>The design must close timing, verify, simulate, and integrate known-good blocks.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-foundry">
    <span class="flow-index">04</span>
    <div>
      <strong>Foundry and equipment</strong>
      <p>Wafers, EUV, deposition, etch, inspection, and yield turn the design into silicon.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-package">
    <span class="flow-index">05</span>
    <div>
      <strong>HBM and packaging</strong>
      <p>Compute dies, memory stacks, interposers, substrates, thermals, and yield collide.</p>
    </div>
  </div>
  <div class="flow-arrow">|</div>
  <div class="flow-step flow-network">
    <span class="flow-index">06</span>
    <div>
      <strong>Network, rack, power</strong>
      <p>The accelerator becomes useful only when it can communicate, cool, and run.</p>
    </div>
  </div>
</div>

The logo on the package tells you who designed the XPU.

The bottleneck tells you who really built it.

## The Unit Is Not the Chip

A chip by itself is not useful.

It becomes useful when model code can reach it, data can stay near it, neighboring chips can talk to it, the rack can cool it, and the building can power it.

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

Anything before that is inventory.

This changes the question. "Who makes the best chip?" is too narrow. The better question is: which layer decides whether the chip becomes a deployed computer?

## Demand Builds the First Wafer

The first builder is the customer with enough demand.

That sounds backwards. It is not.

Suppliers do not expand EUV capacity, HBM capacity, CoWoS capacity, optics capacity, or liquid-cooling capacity for a hypothetical chip. They expand when the downstream demand looks real enough to buy through the risk.

This is one reason NVIDIA's position is not just "good GPU." It has downstream demand that lets the company walk upstream and ask suppliers to commit. Jensen Huang has described this as a supply-chain advantage: suppliers invest because there is confidence that NVIDIA can consume the capacity.

The same logic explains why hyperscalers are now part of the chip supply chain. OpenAI, Meta, Amazon, Google, Microsoft, Oracle, Anthropic, and large clouds are not just customers. At this scale, they are roadmaps with balance sheets.

When OpenAI and Broadcom talk about 10 GW of custom accelerators, the number is not only a compute plan. It is a signal to fabs, packaging, memory, networking, power, and construction. When Meta guides more than $100B of annual capex, it is not only a finance line. It is a demand signal that lets suppliers decide whether new capacity is worth building.

No demand signal, no supply chain.

## Architecture Chooses the Boundary

The architecture owner decides what kind of problem the XPU is allowed to solve.

NVIDIA draws the boundary around a full accelerated-computing platform: GPU, CPU, NVLink, networking, CUDA, libraries, collectives, serving stack.

AMD draws a different boundary: high-memory GPUs, ROCm, open interconnect direction, and a credible second path for customers who care about supply diversity, economics, and control.

Google and AWS draw the boundary around owned workloads. They do not need to replace every GPU in the world. They need to make internal training and inference paths efficient enough to justify custom silicon.

Broadcom draws the boundary around custom silicon for hyperscalers. The buyer brings workload volume and system requirements. Broadcom helps turn that into a deployable accelerator path.

These are not just product choices. They are supply-chain choices.

If you choose a general GPU, you inherit a wide software burden. If you choose a custom ASIC, you inherit a narrower workload but a harder planning problem. If you choose a rack-scale system, you inherit networking, thermals, serviceability, and power delivery. If you choose enormous HBM, you inherit HBM allocation and packaging risk.

Architecture is the first strategic choice. It is not the last bottleneck.

## EDA Makes the Idea Real

Before an XPU becomes silicon, it becomes constraints.

Timing constraints. Power constraints. Floorplan constraints. Signal-integrity constraints. Package constraints. Thermal constraints. Verification constraints.

This is where Cadence, Synopsys, Siemens EDA, Ansys, Arm, RISC-V IP vendors, SerDes IP vendors, PCIe, CXL, UCIe, HBM PHYs, security blocks, firmware, and verification IP enter the story.

EDA is not a volume bottleneck like HBM.

It is a calendar bottleneck.

If the design misses timing closure, it slips. If the HBM interface does not behave, it slips. If package thermals are wrong, it slips. If verification misses a bug, the chip can come back alive but wrong, which is worse.

This is why pre-validated IP is valuable. It is not glamorous. It reduces the number of ways a multi-billion-dollar tapeout can fail.

Arm's Neoverse CSS pitch is basically this: do not spend engineering years rebuilding the boring-but-deadly part of the infrastructure chip. Use a verified subsystem and spend your risk budget on what makes the product different.

That is not commodity work. That is calendar compression.

## The Fab Prints Physics

The foundry turns the design into wafers.

TSMC is the center of gravity for leading-edge AI silicon. Samsung Foundry and Intel Foundry matter because the world wants alternatives, geographic resilience, and more advanced-node capacity. But leading-edge foundry slots are not interchangeable like screws.

A wafer start at one process is not the same as a wafer start at another process. The PDK, libraries, IP qualification, yield curve, packaging path, reliability data, and customer trust all matter.

Then there is the equipment stack underneath the foundry.

ASML makes the lithography systems that make leading-edge patterning possible. Applied Materials, Lam Research, KLA, Tokyo Electron, and others make the deposition, etch, inspection, metrology, and process-control tools that let a fab move from "we can print this" to "we can print this with yield."

That last word is everything.

One good die is a demo. High yield is a business.

The fab is strategic because it is slow to build, expensive to ramp, and painful to qualify. But for AI accelerators, wafers are no longer the whole story. The die still has to meet memory and packaging on time.

## HBM Changes the Shape of the Chip

AI accelerators are memory products pretending to be compute products.

The math units get the attention, but they are useless if bytes cannot arrive fast enough. Compute without bytes is idle math.

This is why HBM became strategic.

HBM is not just DRAM near a GPU. It is stacked memory, TSVs, base dies, thermal limits, package routing, test, qualification, and allocation to specific platforms. SK hynix, Samsung, and Micron do not just sell a bag of bits. For HBM4-class systems, the memory roadmap is tied tightly to the accelerator roadmap.

If HBM is late, the XPU is late.

If HBM bandwidth is lower than planned, the model path changes.

If thermals are worse than expected, the package changes.

If allocation goes to someone else, the architecture owner's beautiful slide becomes a supply problem.

This is the first place where the "chip company builds the chip" story really breaks. The compute die cannot become the product alone. It needs memory close enough to behave like part of the machine.

## Packaging Is Where the XPU Becomes a Product

The XPU is born at tape-out.

It becomes useful at package-out.

Advanced packaging is where logic dies, HBM stacks, interposers, organic substrates, power delivery, thermals, warpage, signal integrity, and yield all collide.

TSMC's CoWoS is famous because it is where many high-end AI accelerators become real products. CoWoS puts logic and HBM close enough to move huge amounts of data without leaving the package. TSMC's roadmap now talks about much larger CoWoS systems with more compute dies and more HBM stacks. That is the tell: scaling is moving from just "smaller transistor" to "bigger and better package."

Samsung and Intel both want advanced packaging to be part of their foundry pitch. ASE and Amkor matter because assembly and test are becoming more strategic. Substrate suppliers and ABF materials matter because the package needs a physical board-like structure that can route power and signals at insane density.

This layer is easy to underestimate because it sounds like "assembly."

It is not assembly.

It is where the accelerator becomes a physical system.

## Networking Decides Whether Many XPUs Are One Computer

One XPU is not enough.

The moment a model needs many accelerators, networking becomes part of the accelerator.

Inside the rack, NVIDIA's answer is NVLink and NVSwitch. The goal is to make 72 GPUs behave like one large fast domain. Across racks, NVIDIA pushes InfiniBand and Spectrum-X Ethernet.

The open Ethernet counterweight comes from Broadcom, Marvell, and the larger Ethernet ecosystem. Tomahawk, Jericho, Thor, Teralynx, high-speed NICs, DSPs, optics, UEC, UALink, and SONiC all matter because hyperscalers do not want every layer locked to one vendor forever.

The technical question is simple:

```
Do many XPUs act like one computer,
or do they act like expensive islands?
```

Training stresses all-reduce, reduce-scatter, all-gather, pipeline bubbles, expert routing, and failure recovery. Inference stresses KV cache placement, prefill/decode separation, routing, batching, and tail latency.

If the network is wrong, utilization falls. The chip can still be fast. The cluster is slow.

This is why optics are becoming strategic. Copper reach gets harder as speeds rise. 800G and 1.6T links, silicon photonics, co-packaged optics, lasers, DSPs, and optical module capacity start to look like the next CoWoS-like bottleneck.

The network is no longer outside the accelerator.

It is the part that decides whether the accelerator scales.

## The Rack Is Now a Product

A rack used to sound boring.

Now it is where the promises collide.

The rack has GPUs or XPUs, CPUs, NICs, switches, power shelves, busbars, cooling manifolds, cold plates, CDUs, firmware, cables, leak detection, service procedures, burn-in, and deployment support.

Supermicro, Dell, HPE, Foxconn, Quanta, Wistron, Wiwynn, Lenovo, and other OEMs and ODMs are not just putting boxes in metal frames. They are turning chip allocation into deployable machines.

That is a different skill.

The rack has to survive real operations. A cable must be reachable. A leak must be detected. A failed module must be serviceable. Firmware versions must line up. The network must come up. The power system must handle the load. The cooling loop must keep the expensive parts alive.

This is where a beautiful product announcement becomes a field engineering problem.

## Power Is the Final Foundry

The last builder is the grid.

An XPU that cannot be powered and cooled is inventory.

The numbers make this obvious. AI racks are moving into the 100 kW-plus class. Vertiv and NVIDIA have published reference architecture around multi-megawatt GB200 deployments. Schneider and Eaton are building modular liquid-cooling and power systems for AI factories. The IEA projects global data-center electricity demand to more than double by 2030, with AI as the main driver.

So the constraint moves.

At first you ask:

```
Can we get the chip?
```

Then:

```
Can we get the HBM?
Can we get the package?
Can we get the rack?
Can we get the optics?
```

And finally:

```
Can this building actually run it?
```

A chip can tape out faster than a substation can be permitted, built, and energized.

That sentence is the supply-chain problem in 2026.

## Who Captures Value?

Value goes where the bottleneck is hard to replace.

Platform owners capture value when they control both demand and the software path. This is why CUDA matters. This is why ROCm matters. This is why XLA, Neuron, and custom hyperscaler stacks matter. Software decides whether hardware lands on the fast path.

Foundries and equipment suppliers capture value because physics is slow. You cannot wish a qualified leading-edge process into existence. You cannot replace EUV, etch, deposition, inspection, metrology, and yield learning with a press release.

HBM suppliers capture value because memory is no longer a commodity add-on. It is part of the accelerator architecture.

Packaging suppliers capture value because the product boundary has moved into the package.

Networking and optics suppliers capture value because the cluster is the computer.

Power and cooling suppliers capture value when deployment, not chip supply, becomes the limiter.

The lower-margin actor can still be the schedule owner. That is the subtle point. A rack integrator may not capture NVIDIA-like gross margin, but if it cannot integrate, test, cool, and ship the rack, the cluster does not exist.

## The 2026 Read

The next XPU bottleneck is not one bottleneck.

It will rotate.

HBM4. CoWoS-L and SoIC. Advanced substrates. 800G and 1.6T optics. Liquid cooling. Power-to-rack. Deployment labor. Grid interconnects.

Custom silicon will keep growing, but mostly where the buyer owns the workload. A hyperscaler can make a custom XPU work because it owns enough software, infrastructure, and demand to amortize the pain. A startup trying to replace the general GPU has a much harder problem.

Ethernet will keep gaining importance where buyers want openness and replaceability. Proprietary scale-up fabrics will still win where the system owner can preserve a tight fast domain and charge for the whole integrated path.

Package architecture will matter as much as chip architecture. The question will not be only "how fast is the die?" It will be "how much memory and bandwidth can the package sustain, and can that package be built in volume?"

Power becomes the cleanest external constraint. It is less ambiguous than benchmarks. Either the site has megawatts, cooling, transformers, switchgear, and permits, or it does not.

## So Who Really Builds an XPU?

The logo company designs the visible object.

The demand owner justifies it.

The EDA and IP stack makes it verifiable.

The foundry and equipment stack makes it printable.

The HBM and packaging stack makes it useful.

The network, rack, power, and cooling stack makes it deployable.

A chip is a promise.

A deployed XPU is a supply chain that kept every promise in the right order.

## Source Trail

- Jensen Huang on downstream demand and supply-chain alignment: [Dwarkesh interview](https://www.dwarkesh.com/p/jensen-huang)
- OpenAI and Broadcom on 10 GW of custom accelerators: [Broadcom release](https://investors.broadcom.com/news-releases/news-release-details/openai-and-broadcom-announce-strategic-collaboration-deploy-10)
- Meta 2026 capex guidance: [Meta investor release](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx)
- TSMC annual report and technology roadmap: [TSMC 2025 annual report](https://investor.tsmc.com/static/annualReports/2025/english/index.html), [TSMC 2026 symposium](https://pr.tsmc.com/english/news/3302)
- ASML annual report and 2026 guidance: [ASML 2025 financials](https://www.asml.com/en/investors/annual-report/2025/financials), [ASML Q1 2026](https://www.asml.com/news/press-releases/2026/q1-2026-financial-results)
- EDA and IP: [Cadence Q1 2026](https://investor.cadence.com/news/news-details/2026/Cadence-Reports-First-Quarter-2026-Financial-Results/default.aspx), [Synopsys 2025 10-K](https://www.sec.gov/Archives/edgar/data/883241/000088324125000028/snps-20251031.htm), [Arm Neoverse CSS](https://www.arm.com/products/cloud-datacenter/neoverse-compute-subsystems)
- HBM: [Micron HBM4](https://investors.micron.com/news-releases/news-release-details/micron-high-volume-production-hbm4-designed-nvidia-vera-rubin), [SK hynix HBM4](https://news.skhynix.com/sk-hynix-completes-worlds-first-hbm4-development-and-readies-mass-production/), [Samsung and AMD HBM4](https://news.samsung.com/global/samsung-and-amd-expand-strategic-collaboration-on-next-generation-ai-memory-solutions)
- Packaging: [TSMC CoWoS](https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm), [Intel advanced packaging](https://www.intel.com/content/www/us/en/foundry/packaging.html), [Ajinomoto ABF](https://www.ajinomoto.com/innovation/our_innovation/buildupfilm), [Ibiden substrate investment](https://www.ibiden.com/company/2026/02/notice-regarding-capital-investment-plan-for-high-performance-ic-package-substrates.html)
- Networking and optics: [NVIDIA GB200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), [Broadcom Tomahawk 6](https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-6-worlds-first-1024-tbps-switch), [Marvell Teralynx](https://www.marvell.com/products/switching/teralynx.html)
- Power and cooling: [IEA Energy and AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai), [Vertiv and NVIDIA 7 MW reference architecture](https://www.vertiv.com/en-us/about/news-and-insights/articles/educational-articles/vertiv-and-nvidia-collaborate-on-7mw-reference-architecture-for-nvidia-gb200-nvl72-platform/)
