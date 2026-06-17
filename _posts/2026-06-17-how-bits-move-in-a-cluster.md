# How Bits Move in a Cluster

Three companies build the hardware that moves bits through AI clusters: NVIDIA, AMD, and Google. Each made fundamentally different bets on how chips should talk to each other.

## TPUs

### Chip
One TPU v6e chip has 32 GB HBM at 1,600 GB/s. No caches. No L1, no L2. A 128 MiB scratchpad called VMEM sits next to the compute units and the compiler schedules every byte movement ahead of time. The chip has two MXUs (256x256 systolic arrays, 918 TFLOPS bf16) and a VPU that's 30x slower for everything that isn't a matrix multiply.

### Multi-Chip
Google bakes ICI (Inter-Chip Interconnect) directly into the silicon. Each chip has 4 links to its nearest neighbors at 180 GB/s each. Four chips on one board make a tray, connected to a host CPU via PCIe at 32 GB/s per chip. 64 trays make a pod: 256 chips in a 16x16 2D torus. All ICI. This is the fast zone.

### Cross-Pod
Chips can't talk ICI to another pod. Data leaves via PCIe (32 GB/s), through the host CPU, out an ethernet NIC (25 GB/s per chip), across Google's Jupiter datacenter network, and into another pod doing the reverse. The NIC is the tightest pipe.

```
HBM        1,600 GB/s
ICI          180 GB/s
PCIe          32 GB/s
NIC           25 GB/s   <-- bottleneck
```

Training survives because gradient sync happens once per step and overlaps with compute. Inference survives because one pod = 256 chips x 32 GB = 8 TB. That fits almost any model. Never cross the pod for decode.

## AMD

### GPU
One MI455X has 432 GB HBM4 at 19,600 GB/s. 2 GCDs on TSMC 2nm + 2 MCDs on TSMC 3nm. Full cache hierarchy. 40 PFLOPS FP4, 20 PFLOPS FP8.

### Multi-GPU (Helios Rack)
AMD's Helios rack puts 72 MI455X GPUs in a single rack, connected via Infinity Fabric + UALink at 3,600 GB/s aggregate scale-up bandwidth. This is AMD's first rack-scale system and breaks the old 8-GPU-per-node wall. UALink is a new open standard that works like a switch, so AMD no longer needs point-to-point wiring between every GPU pair.

### Cross-Rack
Each GPU gets 300 GB/s scale-out bandwidth via Ultra Ethernet, using AMD's own Pollara 400G or Vulcano 800G NICs. These NICs speak Infinity Fabric natively, so PCIe is no longer in the cross-rack data path.

```
HBM                 19,600 GB/s
IF + UALink (rack)   3,600 GB/s (aggregate scale-up)
Scale-out (per GPU)    300 GB/s   <-- bottleneck
```

Training survives because gradient sync overlaps with compute. Inference survives because 72 GPUs x 432 GB = 31 TB of HBM4 in one rack. Trillion-parameter models fit without leaving the fast zone.

## NVIDIA

### GPU
One B200 has 192 GB HBM3e at 8,000 GB/s. Second-generation Transformer Engine with FP4, FP8, FP16, BF16.

### Multi-GPU (NVL72)
The GB200 NVL72 puts 72 B200 GPUs in a single rack, all connected through NVLink 5 via 9 NVLink Switch chips. Every GPU talks to every other GPU at 1,800 GB/s. 130 TB/s aggregate bisection bandwidth. The rack is one giant GPU.

The CPU is an ARM-based Grace processor connected via NVLink-C2C at 900 GB/s, not PCIe. NVIDIA makes the GPU, CPU, NIC, and switch. One company, one protocol. PCIe doesn't exist anywhere inside the rack.

### Cross-Rack
Each GPU has its own ConnectX-7 NIC at 400 Gbps (50 GB/s). Cross-rack goes through InfiniBand or Spectrum-X ethernet. Even on NVIDIA, the NIC connects to the GPU through PCIe, so cross-rack bandwidth is capped at the NIC.

```
HBM                  8,000 GB/s
NVLink (72 GPUs)     1,800 GB/s
Cross-rack NIC          50 GB/s   <-- bottleneck
```

Training survives because gradient sync overlaps with compute. Inference survives because 72 GPUs x 192 GB = 13.5 TB in one NVLink domain. Trillion-parameter models fit in a single rack.

## The Three Bets

Google makes the fast zone wide and cheap: 256 chips, 8 TB, ICI at 180 GB/s, no switch chips.

AMD makes each GPU fat and is now going rack-scale: 432 GB per GPU, 72 GPUs in Helios, Infinity Fabric + UALink, own NICs via Pollara.

NVIDIA makes the fast zone fast: 72 GPUs, 13.5 TB, NVLink at 1,800 GB/s, owns every component in the rack.

The bottleneck is always the same: getting bits off the chip. The question is how big and how fast you can make the zone where you don't have to.
