# Screenshot Checklist (Deliverables 4 & 5)

Save images in this folder using the suggested names. Use the full window (include URL bar / terminal prompt showing the host).

## A. Application & database (local)
- [ ] `01_ui_list.png` – main page with student table
- [ ] `02_ui_add.png` – Add Student form / success
- [ ] `03_ui_update.png` – Update form and updated row
- [ ] `04_ui_delete.png` – deletion confirmation / row gone
- [ ] `05_db_test.png` – `npm test` output (5 PASS)
- [ ] `06_mysql_table.png` – `DESCRIBE students;` and `SELECT * …`

## B. Virtualization (Step 3)
- [ ] `10_vbox_manager.png` – VirtualBox/VMware with VM listed
- [ ] `11_vm_settings_system.png` – CPU/RAM allocation
- [ ] `12_vm_settings_storage.png` – disk size
- [ ] `13_vm_settings_network.png` – NAT/port forwarding or bridged
- [ ] `14_ubuntu_login.png` – Ubuntu running
- [ ] `15_vm_specs.png` – `lsb_release -a; nproc; free -h; df -h; ip -br a`

## C. Deployment on VM (Step 4)
- [ ] `20_setup_script.png` – setup script finishing
- [ ] `21_services_active.png` – `systemctl status student-app mysql`
- [ ] `22_vm_app_browser.png` – app in browser through the VM, CRUD done

## D. AWS EC2 (Step 5)
- [ ] `30_aws_launch_config.png` – instance type/AMI/storage
- [ ] `31_aws_security_group.png` – inbound rules
- [ ] `32_aws_instance_running.png` – instance list with public IP
- [ ] `33_aws_ssh_setup.png` – terminal on EC2 running setup
- [ ] `34_aws_app_public_ip.png` – browser at `http://<public-ip>:3000` (IP visible)

## E. GCP Compute Engine (Step 5)
- [ ] `40_gcp_create_vm.png` – machine type/image/disk
- [ ] `41_gcp_firewall.png` – firewall rule tcp:3000
- [ ] `42_gcp_instance_running.png` – VM list with external IP
- [ ] `43_gcp_ssh_setup.png` – SSH session running setup
- [ ] `44_gcp_app_public_ip.png` – browser at `http://<external-ip>:3000`

## F. Migration (Step 7)
- [ ] `50_backup_created.png` – `backup.sh` output + `ls -lh migration_backup`
- [ ] `51_transfer.png` – scp output + checksum verify
- [ ] `52_restore.png` – restore output
- [ ] `53_target_app.png` – target app showing migrated MIG-001/002 records
- [ ] `54_row_count_compare.png` – row counts on both VMs

## G. Performance (optional)
- [ ] `60_ab_aws.png`, `61_ab_gcp.png`

> Hide/blur private keys, billing details and account IDs. Terminate cloud resources after capturing evidence.
