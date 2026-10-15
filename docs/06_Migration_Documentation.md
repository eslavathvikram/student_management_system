# 06 – Application Migration Documentation (Step 7)

**Scenario:** migrate the app + database from **Source VM** (`sms-vm-source`, local VirtualBox) to **Target VM** (`sms-aws` or `sms-gcp`, or a second VirtualBox VM).

| | Source | Target |
|---|---|---|
| Name | ‹sms-vm-source› | ‹sms-gcp› |
| IP | ‹…› | ‹…› |
| OS | Ubuntu 24.04 | Ubuntu 24.04 |

## Pre-migration: create unique data on the source
Add 2 new students through the UI (e.g. `MIG-001`, `MIG-002`) so you can prove the data moved. Record the count:
```bash
sudo mysql -N -e "SELECT COUNT(*) FROM student_db.students;"     # ‹12›
```

## Step 1 – Export / back up on the source VM
```bash
cd ~/student-management-system
bash deployment/backup.sh
```
Produces in `migration_backup/`: `student_db_<ts>.sql` (mysqldump), `app_<ts>.tar.gz` (application, no node_modules), `checksums_<ts>.txt`.

## Step 2 – Transfer to the target VM
```bash
# Source → AWS
scp -i sms-key.pem migration_backup/*_<ts>.* ubuntu@<TARGET-IP>:~/
# Source → GCP
gcloud compute scp migration_backup/*_<ts>.* sms-gcp:~/ --zone <ZONE>
# Between two VirtualBox VMs (host-only/bridged)
scp migration_backup/*_<ts>.* ubuntu@<TARGET-IP>:~/
```
Verify integrity on target: `sha256sum -c checksums_<ts>.txt`

## Step 3 – Restore on the target VM
```bash
sudo bash -c 'tar -xzf app_<ts>.tar.gz -O ./deployment/restore.sh > /tmp/restore.sh'   # or unpack manually
sudo bash /tmp/restore.sh app_<ts>.tar.gz student_db_<ts>.sql
```
Simpler alternative:
```bash
mkdir -p student-management-system && tar -xzf app_<ts>.tar.gz -C student-management-system
sudo bash student-management-system/deployment/restore.sh app_<ts>.tar.gz student_db_<ts>.sql
```
`restore.sh` installs dependencies, creates the service/firewall, then imports the SQL dump and restarts the app.

## Step 4 – Open the cloud firewall
Ensure inbound TCP 3000 is allowed (AWS Security Group / GCP firewall rule).

## Step 5 – Verify
```bash
curl http://<TARGET-IP>:3000/api/health
sudo mysql -N -e "SELECT COUNT(*) FROM student_db.students;"     # must equal source count
sudo mysql -e "SELECT student_id,name FROM student_db.students WHERE student_id LIKE 'MIG-%';"
```
| Check | Source | Target | Pass? |
|---|---|---|---|
| Row count | ‹12› | ‹12› | ‹✔› |
| `MIG-001`, `MIG-002` present | ✔ | ‹✔› | ‹✔› |
| App reachable via IP:3000 | ✔ | ‹✔› | ‹✔› |
| Add/Update/Delete works on target | – | ‹✔› | ‹✔› |

## Observations (fill in)
| Item | Value |
|---|---|
| Backup duration | ‹…s› |
| Backup size (SQL / tar.gz) | ‹…KB / …KB› |
| Transfer time | ‹…s› |
| Restore + setup time | ‹…min› |
| Downtime on source | ‹0 – source kept running› |
| Issues & fixes | ‹e.g. port 3000 blocked → added firewall rule; `.env` password mismatch → …› |

## Notes
- Cold migration (backup → copy → restore). Data written to the source after the dump is **not** carried over; stop writes (or stop `student-app`) before the final backup for consistency.
- Other approaches to mention: VM image export (OVA → cloud image import, e.g. AWS VM Import/Export), disk snapshots, managed DB migration services.
