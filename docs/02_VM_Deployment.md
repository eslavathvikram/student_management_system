# 02 – Deploying the Application on the VM (Step 4)

## 1. Transfer the project to the VM
```bash
# from host (VirtualBox NAT port-forward 2222)
scp -P 2222 student-management-system.zip ubuntu@127.0.0.1:~/
ssh -p 2222 ubuntu@127.0.0.1
unzip student-management-system.zip && cd student-management-system
```

## 2. Automated install
```bash
sudo bash deployment/setup_vm.sh
```
What the script does:
1. `apt update/upgrade`
2. Installs Node.js 20, MySQL Server, git, unzip, curl, ufw
3. Starts/enables MySQL
4. Creates DB `student_db`, user `sms_user`, loads `schema.sql` + `sample_data.sql`
5. Creates `backend/.env`, runs `npm install`
6. Registers a **systemd** service `student-app` (auto-start, auto-restart)
7. Opens firewall ports 22 and 3000

## 3. Manual equivalent (for the report)
```bash
sudo apt install -y mysql-server
sudo mysql < database/schema.sql
sudo mysql -e "CREATE USER 'sms_user'@'localhost' IDENTIFIED BY 'ChangeMe@123'; GRANT ALL ON student_db.* TO 'sms_user'@'localhost';"
sudo mysql < database/sample_data.sql
cd backend && cp .env.example .env && npm install && node server.js
```

## 4. Verify
```bash
systemctl status student-app          # active (running)
systemctl status mysql
curl http://localhost:3000/api/health
cd backend && npm test                # database test: PASS lines
```
Open `http://localhost:3000` (via port-forward) and perform:
| CRUD operation | Action | Expected | Result |
|---|---|---|---|
| Create | Add student "Test Student" | Row appears in table | ‹✔› |
| Read | Search "Test" | Filtered list shown | ‹✔› |
| Update | Edit CGPA → 8.5 | Value changes | ‹✔› |
| Delete | Delete the record | Row removed | ‹✔› |

Confirm in MySQL: `sudo mysql -e "SELECT student_id,name,cgpa FROM student_db.students;"`

## 5. Useful operations
```bash
sudo journalctl -u student-app -f     # live logs
sudo systemctl restart student-app
```
