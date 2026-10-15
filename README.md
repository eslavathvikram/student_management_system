# Cloud-Based Student Management System

A web-based Student Management System (Node.js + Express + MySQL) deployed on a local VirtualBox/VMware VM
and on two public clouds (**AWS EC2** and **Google Compute Engine**), with a documented migration between VMs.

## Folder structure
```
student-management-system/
├── backend/            Express REST API + DB connection + DB test script
├── frontend/public/    HTML/CSS/JS user interface (served by Express)
├── database/           schema.sql, sample_data.sql
├── deployment/         setup_vm.sh, backup.sh, restore.sh, nginx_optional.conf
└── docs/
    ├── 01_VM_Configuration.md          (Step 3 + Deliverable 3)
    ├── 02_VM_Deployment.md             (Step 4)
    ├── 03_AWS_EC2_Deployment.md        (Step 5)
    ├── 04_GCP_Compute_Engine_Deployment.md (Step 5)
    ├── 05_Cloud_Comparison_Report.md   (Step 6 + Deliverable 6)
    ├── 06_Migration_Documentation.md   (Step 7 + Deliverable 7)
    ├── 07_Final_Project_Report.md      (Step 8 + Deliverable 8)
    ├── 08_API_and_Database_Testing.md  (Step 2)
    └── screenshots/SCREENSHOT_CHECKLIST.md   (Deliverables 4 & 5)
```

## Quick start (any Ubuntu 22.04/24.04 VM)
```bash
unzip student-management-system.zip && cd student-management-system
sudo bash deployment/setup_vm.sh        # installs Node, MySQL, DB, systemd service, firewall
curl http://localhost:3000/api/health   # {"status":"ok","db":"connected",...}
```
Open `http://<VM-IP>:3000` in a browser.

## Run locally (without a VM)
```bash
# MySQL is used when available. Without MySQL, the app initializes a local SQLite
# database at database/student_db.sqlite and seeds the sample students.
cd backend && cp .env.example .env && npm install && npm start
```

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students?q=term` | List / search students |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Add student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/health` | App + DB health (shows which host served the request) |

## Before you submit
Screenshots and measured values (IPs, timings, costs) can only come from **your** VMs. Follow
`docs/screenshots/SCREENSHOT_CHECKLIST.md`, then fill the `‹…›` placeholders in the docs.
Change the default DB password `ChangeMe@123` (`DB_PASS=yourpass sudo -E bash deployment/setup_vm.sh`).
