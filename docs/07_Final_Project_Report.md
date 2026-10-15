# Cloud-Based Student Management System
### Final Project Report – Cloud Computing

**Submitted by:** Eslavath Vikram  
**Institution:** Mahatma Gandhi Institute of Technology (MGIT), Hyderabad  
**Course:** Cloud Computing  **Date:** ‹date›

---

## 1. Abstract
This project develops a web-based Student Management System (SMS) supporting create, read, update and delete (CRUD) operations on student records, backed by a MySQL database. The application is deployed on a locally virtualized Ubuntu VM (VirtualBox/VMware) and on two public cloud platforms — Amazon EC2 and Google Compute Engine — and then migrated between VMs using backup and restore. The work demonstrates virtualization, IaaS deployment, resource management, networking/security configuration and cloud portability.

## 2. Objectives
1. Build a CRUD web application with a relational database.
2. Implement virtualization and configure a VM (CPU, RAM, storage, network).
3. Deploy the application on the VM and on two public clouds, verifying public-IP access.
4. Compare the clouds and document an application migration.
5. Analyse advantages, disadvantages and challenges.

## 3. System Architecture
```
 Browser ──HTTP:3000──► [ VM / EC2 / GCE instance ]
                          ├─ Node.js + Express  (REST API + static UI)
                          └─ MySQL 8            (student_db.students)
```
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (fetch API) |
| Backend | Node.js 20, Express 4, mysql2 |
| Database | MySQL 8 (table `students`) |
| Process mgmt | systemd service `student-app` |
| OS | Ubuntu Server 24.04 LTS |
| Firewall | UFW (OS level) + cloud security group / VPC firewall |

## 4. Implementation
### 4.1 Application (Step 1)
REST endpoints implement CRUD (`GET/POST/PUT/DELETE /api/students`) plus `/api/health`. The UI provides a searchable table, summary cards (total, departments, average CGPA) and an add/edit modal with server-side validation (ID format, email, phone, CGPA 0–10, year 1–4, semester 1–8). Inputs are escaped on render and queries are parameterized (protection against XSS and SQL injection).

### 4.2 Database (Step 2)
Table `students`: `id` (PK), `student_id` (UNIQUE), `name`, `department`, `email` (UNIQUE), `phone`, `year`, `semester`, `cgpa`, `attendance`, `created_at`, `updated_at`; indexes on department and name; CHECK constraints for ranges. `backend/test_db.js` verifies insert, select, update, duplicate rejection and delete. See `docs/08_API_and_Database_Testing.md`.

### 4.3 Virtualization (Step 3)
See `docs/01_VM_Configuration.md` — VirtualBox, Ubuntu Server, 2 vCPU / 2 GB RAM / 20 GB disk, NAT with port forwarding (or bridged).

### 4.4 VM Deployment (Step 4)
`deployment/setup_vm.sh` automates package installation, DB creation, service registration and firewall setup. CRUD verified through the VM-hosted app (`docs/02_VM_Deployment.md`).

### 4.5 Public cloud deployments (Step 5)
Identical deployment on AWS EC2 (`docs/03`) and Google Compute Engine (`docs/04`), each verified via public IP.

### 4.6 Comparison (Step 6)
Tabular comparison in `docs/05_Cloud_Comparison_Report.md`.

### 4.7 Migration (Step 7)
Cold migration using `mysqldump` + application archive + `scp` + `restore.sh`, validated by row counts and migrated records (`docs/06_Migration_Documentation.md`).

## 5. Results
| Test | VM | AWS EC2 | GCP |
|---|---|---|---|
| App reachable by IP | ‹✔› | ‹✔› | ‹✔› |
| CRUD working | ‹✔› | ‹✔› | ‹✔› |
| DB tests (5/5) | ‹✔› | ‹✔› | ‹✔› |
| Migration data integrity | – | ‹✔› | ‹✔› |

## 6. Advantages
### 6.1 Of virtualization
- **Hardware consolidation** – several isolated systems on one physical machine.
- **Isolation** – faults/experiments inside a VM don't affect the host.
- **Snapshots & cloning** – quick rollback and duplication for testing.
- **Portability** – VM images can be moved between hosts.
- **Cost-effective learning** – no extra hardware needed.
- **Resource flexibility** – CPU/RAM/disk adjustable per VM.

### 6.2 Of public cloud platforms
- **On-demand provisioning** – a server in about a minute.
- **Pay-as-you-go** – no upfront capex; free tiers suit students.
- **Global reach** – choose regions close to users.
- **Scalability & elasticity** – resize, autoscale, load-balance.
- **Reliability** – managed infrastructure, SLAs, snapshots.
- **Public accessibility** – static public IP / DNS makes the app internet-reachable.
- **Rich ecosystem** – monitoring, managed databases, IAM, backups.

## 7. Disadvantages & Limitations
| Area | Limitation |
|---|---|
| Local VM | Performance limited by host; nested virtualization overhead; VM unreachable from the internet without port-forwarding |
| Cloud cost | Costs continue while instances/disks/IPs exist; forgotten resources cause bills |
| Free-tier limits | Small RAM (1 GB) restricts MySQL; limited hours/regions |
| Dynamic IPs | Public IP changes on stop/start unless reserved |
| Security | Public exposure increases attack surface; misconfigured rules are risky |
| Vendor differences | Different consoles, terminology and networking models (slight lock-in of skills) |
| Single-VM design | App + DB on one VM is a single point of failure; no auto-scaling |
| Port 3000 / HTTP | No TLS in this prototype |

## 8. Challenges and Solutions
| Phase | Challenge | Solution implemented |
|---|---|---|
| **VM setup** | VT-x/AMD-V disabled → VM wouldn't start 64-bit | Enabled virtualization in BIOS; disabled conflicting Hyper-V where needed |
| | VM couldn't be reached from host | NAT port forwarding (2222→22, 3000→3000) or Bridged adapter |
| | Slow install / limited RAM | Allocated 2 GB RAM, dynamic VDI disk, headless Ubuntu Server |
| **Application deployment** | Missing dependencies / version mismatch | Scripted install (`setup_vm.sh`) with Node 20 LTS via NodeSource |
| | App stopped when SSH closed | Registered systemd service with `Restart=always` |
| **Database configuration** | MySQL root auth via socket; app login failed | Created dedicated `sms_user` with password and limited privileges |
| | MySQL killed on 1 GB instance (OOM) | Added 1 GB swap / used 2 GB instance |
| | Duplicate IDs / bad data | UNIQUE + CHECK constraints and API validation |
| **Cloud migration** | Large/inconsistent dumps | `--single-transaction`; exclude `node_modules`; SHA-256 checksums |
| | Target environment differences (paths, users) | `restore.sh` rebuilds service for the current user; same OS on both ends |
| | Data written during migration lost | Stop writes (or service) before final backup |
| **Security & networking** | Site unreachable on public IP although app running | Opened port 3000 in **both** the cloud firewall (SG / VPC rule) and UFW |
| | SSH key permission errors (`.pem`) | `chmod 400`; used browser SSH/`gcloud` on GCP |
| | Wide-open SSH | Restricted port 22 to own IP; password auth off; MySQL bound to localhost only |
| | Public IP changing | Reserve Elastic IP / static IP, or note the new IP after restart |

> Replace/trim rows with the challenges **you actually met** — evaluators value genuine observations.

## 9. Security Considerations
- MySQL listens on localhost only; the DB port is never exposed.
- Least-privilege DB user; password supplied via `.env` (not in source control).
- Parameterized SQL; HTML-escaped output.
- Firewalls at two levels (UFW + cloud). Recommended next steps: HTTPS (Nginx + Let's Encrypt), authentication/roles, rate limiting.

## 10. Future Enhancements
Authentication (admin/teacher roles), attendance & marks modules, Docker/Docker-Compose packaging, managed database (RDS / Cloud SQL), load balancer + autoscaling, CI/CD pipeline, HTTPS and a domain name, monitoring and automated backups.

## 11. Conclusion
The project delivered a working CRUD Student Management System and showed it running on a local VM and on two public clouds with only environment-level configuration changes — highlighting the portability of IaaS. Virtualization made safe, repeatable experimentation possible; public clouds added global accessibility, elasticity and pay-as-you-go economics, at the cost of added networking/security responsibility and cost control. The documented migration confirmed that application and data can be moved between VMs reliably using backups and scripted restoration.

## 12. References
- Oracle VirtualBox documentation – virtualbox.org/manual
- AWS EC2 User Guide – docs.aws.amazon.com/ec2
- Google Compute Engine documentation – cloud.google.com/compute/docs
- Node.js, Express, MySQL 8 reference manuals
- NIST SP 800-145 – *The NIST Definition of Cloud Computing*
