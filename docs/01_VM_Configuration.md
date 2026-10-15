# 01 – Virtualization & VM Configuration (Step 3)

## 1. Virtualization platform
| Item | Value |
|---|---|
| Hypervisor | Oracle VirtualBox 7.x (alternative: VMware Workstation Player) |
| Host OS | ‹Windows 11 / Ubuntu› |
| Host hardware | ‹CPU model, cores, RAM› |
| Hypervisor type | Type-2 (hosted) |

Prerequisite: enable **Intel VT-x / AMD-V** in BIOS/UEFI (Task Manager → Performance → CPU → "Virtualization: Enabled").

## 2. Create the VM (VirtualBox)
1. Download Ubuntu Server 22.04/24.04 LTS ISO.
2. VirtualBox → **New** → Name `sms-vm-source`, Type Linux, Version Ubuntu (64-bit), attach ISO, tick *Skip unattended installation*.
3. Hardware: allocate resources per table below.
4. Hard disk: create a VDI, dynamically allocated.
5. Start VM → install Ubuntu Server, enable **OpenSSH server**, create user `ubuntu`.

## 3. Resource allocation
| Resource | Allocation | Reason |
|---|---|---|
| vCPU | 2 | Node.js + MySQL run concurrently |
| RAM | 2048 MB (min 1536) | MySQL needs ≈400–600 MB; Node ≈100 MB; OS ≈300 MB |
| Storage | 20 GB VDI (dynamic) | OS + packages + DB growth |
| Video | 16 MB | Headless server |
| Boot/OS | Ubuntu Server LTS | Stable, free, cloud-compatible |

## 4. Networking
| Adapter | Mode | Purpose |
|---|---|---|
| Adapter 1 | **NAT** with port forwarding | Internet access for `apt`, default |
| Adapter 2 (optional) | **Host-Only** | Host ↔ VM direct access, VM ↔ VM migration |

Port forwarding rules (NAT → Settings → Network → Advanced → Port Forwarding):
| Name | Protocol | Host Port | Guest Port |
|---|---|---|---|
| ssh | TCP | 2222 | 22 |
| app | TCP | 3000 | 3000 |

Access: `ssh -p 2222 ubuntu@127.0.0.1` and `http://localhost:3000`.
(Alternative: **Bridged Adapter** gives the VM an IP on your LAN — easiest for the migration step between two VMs.)

## 5. Verification commands (screenshot these)
```bash
lsb_release -a        # OS
nproc                 # vCPU count
free -h               # RAM
df -h /               # storage
ip -br a              # network
```
| Result | Value |
|---|---|
| OS | ‹Ubuntu 24.04 LTS› |
| vCPU | ‹2› |
| RAM | ‹1.9 GiB› |
| Disk | ‹20 GB› |
| VM IP | ‹192.168.x.x› |
