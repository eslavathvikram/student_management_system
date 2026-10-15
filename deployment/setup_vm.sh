#!/usr/bin/env bash
# One-shot setup for Ubuntu 22.04 / 24.04 (local VM, AWS EC2, GCP Compute Engine).
# Usage (from project root):  sudo bash deployment/setup_vm.sh
set -euo pipefail

DB_NAME="student_db"; DB_USER="sms_user"; DB_PASS="${DB_PASS:-ChangeMe@123}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_USER="${SUDO_USER:-ubuntu}"

echo "==> [1/7] Updating packages"
apt-get update -y && apt-get upgrade -y

echo "==> [2/7] Installing Node.js 20, MySQL, tools"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs mysql-server git unzip curl ufw

echo "==> [3/7] Starting MySQL"
systemctl enable --now mysql

echo "==> [4/7] Creating database, user, schema and sample data"
mysql < "$APP_DIR/database/schema.sql"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
          GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;"
COUNT=$(mysql -N -e "SELECT COUNT(*) FROM $DB_NAME.students;")
if [ "$COUNT" = "0" ]; then mysql < "$APP_DIR/database/sample_data.sql"; fi

echo "==> [5/7] Installing app dependencies"
cd "$APP_DIR/backend"
[ -f .env ] || sed "s/ChangeMe@123/$DB_PASS/" .env.example > .env
sudo -u "$RUN_USER" npm install --omit=dev

echo "==> [6/7] Creating systemd service"
cat > /etc/systemd/system/student-app.service <<UNIT
[Unit]
Description=Student Management System
After=network.target mysql.service

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now student-app

echo "==> [7/7] Firewall (SSH + app port 3000)"
ufw allow OpenSSH && ufw allow 3000/tcp && ufw --force enable

echo
echo "Done. Test:  curl http://localhost:3000/api/health"
echo "Open:        http://<VM-IP>:3000"
