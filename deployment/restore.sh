#!/usr/bin/env bash
# Restores app + DB on the TARGET VM.
# Usage: sudo bash restore.sh app_YYYYMMDD_HHMMSS.tar.gz student_db_YYYYMMDD_HHMMSS.sql
set -euo pipefail
APP_TAR="$(realpath "$1")"; DB_DUMP="$(realpath "$2")"
RUN_USER="${SUDO_USER:-ubuntu}"; DEST="/home/$RUN_USER/student-management-system"
mkdir -p "$DEST" && tar -xzf "$APP_TAR" -C "$DEST" && chown -R "$RUN_USER":"$RUN_USER" "$DEST"

# Installs Node/MySQL/service. Setup seeds sample data only if the table is empty.
bash "$DEST/deployment/setup_vm.sh"

echo "==> Restoring database from dump (replaces seeded data)"
mysql student_db < "$DB_DUMP"
systemctl restart student-app
echo "Restored. Rows now in students table:"
mysql -N -e "SELECT COUNT(*) FROM student_db.students;"
