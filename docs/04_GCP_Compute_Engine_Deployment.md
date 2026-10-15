# 04 – Deployment on Google Compute Engine (Step 5, Platform 2)

## 1. Create the VM (Console → Compute Engine → VM instances → Create)
| Setting | Value |
|---|---|
| Name | `sms-gcp` |
| Region / Zone | ‹asia-south1-a (Mumbai)› |
| Machine type | `e2-small` (2 shared vCPU, 2 GB) – `e2-micro` is free-tier but 1 GB |
| Boot disk | Ubuntu 24.04 LTS, 20 GB balanced persistent disk |
| Firewall | Tick *Allow HTTP traffic* (optional) |
| Network tags | `sms-app` |

## 2. Firewall rule for port 3000
Console → VPC network → Firewall → Create rule:
| Field | Value |
|---|---|
| Name | `allow-sms-3000` |
| Direction / Action | Ingress / Allow |
| Targets | Specified target tags: `sms-app` |
| Source IPv4 ranges | `0.0.0.0/0` |
| Protocols/ports | tcp:3000 |

CLI equivalent:
```bash
gcloud compute firewall-rules create allow-sms-3000 --allow tcp:3000 --target-tags sms-app
```

## 3. Connect and deploy
```bash
# Browser SSH button, or:
gcloud compute scp student-management-system.zip sms-gcp:~/ --zone <ZONE>
gcloud compute ssh sms-gcp --zone <ZONE>
sudo apt install -y unzip && unzip student-management-system.zip && cd student-management-system
sudo bash deployment/setup_vm.sh
```

## 4. Test
`http://<EXTERNAL-IP>:3000` → CRUD operations. (The external IP is **ephemeral** unless reserved as a static IP.)

## 5. Record
| Item | Value |
|---|---|
| Zone | ‹…› |
| Instance name / ID | ‹sms-gcp› |
| External IP | ‹…› |
| Time to create → running | ‹…› |
| Time to run setup script | ‹…› |
| CRUD verified via public IP | ‹✔› |

## 6. Clean-up
Delete the VM, disk, and any reserved static IP. Check Billing → Budgets & alerts.
