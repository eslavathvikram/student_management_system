# 05 – Comparison of AWS EC2 vs Google Compute Engine (Step 6)

Same application, same OS (Ubuntu 24.04), same setup script on both. Cells marked ‹…› should be replaced with **your measured values**.

| Criteria | Amazon EC2 (AWS) | Google Compute Engine (GCP) |
|---|---|---|
| **Deployment process** | Launch Instance wizard → key pair → SG → SSH with `.pem` → run script | Create instance → firewall rule + tag → browser SSH/`gcloud` → run script |
| **VM creation time** | ‹e.g. ~1 min to "running"› | ‹e.g. ~30–60 s› |
| **Setup effort** | ~‹n› steps; manual key-pair handling | ~‹n› steps; browser SSH needs no key handling |
| **Instance type used** | t3.micro | e2-small |
| **vCPU** | 2 | 2 (shared-core) |
| **RAM** | 1 GiB (needed swap) | 2 GB |
| **Storage** | 20 GiB EBS gp3 | 20 GB balanced persistent disk |
| **OS image** | Ubuntu 24.04 LTS AMI | Ubuntu 24.04 LTS image |
| **Public IP** | Auto-assigned, changes on stop/start unless Elastic IP | Ephemeral external IP, changes on stop/start unless static IP reserved |
| **Networking model** | VPC + Subnet + Security Group (stateful, attached to instance) | VPC (global) + firewall rules applied via tags/service accounts |
| **Security settings** | Security Group, key pair auth, IAM roles | Firewall rules, OS Login/SSH keys, IAM, Shielded VM by default |
| **Ease of management** | Mature, many options → steeper learning curve | Cleaner console, simple SSH-in-browser, project-based organisation |
| **Backup / snapshots** | EBS snapshots, AMI images | Persistent-disk snapshots, machine images |
| **Monitoring** | CloudWatch | Cloud Monitoring / Logging |
| **Performance** (measure: `ab -n 500 -c 20 http://IP:3000/api/students`) | ‹req/s, avg latency› | ‹req/s, avg latency› |
| **Scalability** | Auto Scaling Groups + ELB; wide instance catalogue | Managed Instance Groups + Load Balancing; custom machine types |
| **Cost (approx.)** | Pay-per-second on-demand; free tier for new accounts (12 months, limited hours) | Pay-per-second; always-free e2-micro (region-limited) + trial credits |
| **Cost for this project** | ‹₹/$ actually incurred› | ‹₹/$ actually incurred› |
| **Documentation / community** | Very large | Large, clear tutorials |

> Prices and free-tier terms change often — confirm on the official AWS and GCP pricing pages and quote the date you checked.

## Measuring performance (optional but strengthens the report)
```bash
sudo apt install -y apache2-utils
ab -n 500 -c 20 http://<PUBLIC-IP>:3000/api/students
```
Record *Requests per second* and *Time per request* from each cloud (run from the same client location).

## Conclusion
Both platforms ran the identical application with no code change, showing the portability of VM-based (IaaS) deployments.
AWS offers the broadest service catalogue and market share; GCP offered a simpler console, ‹more RAM at the same tier›, and quick browser SSH.
For a small student workload, either is sufficient; the choice depends on free-tier credits, familiarity, and ecosystem. ‹Add your own observation.›
