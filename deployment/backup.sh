#!/usr/bin/env bash
# Backs up the database + application into ./migration_backup/  (run on SOURCE VM)
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$APP_DIR/migration_backup"; STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$OUT"
echo "==> Dumping database"
mysqldump --single-transaction --routines --triggers student_db > "$OUT/student_db_$STAMP.sql"
echo "==> Archiving application (without node_modules)"
tar --exclude='node_modules' --exclude='migration_backup' -czf "$OUT/app_$STAMP.tar.gz" -C "$APP_DIR" .
sha256sum "$OUT"/*_$STAMP.* > "$OUT/checksums_$STAMP.txt"
ls -lh "$OUT"
echo "Backup complete. Transfer with:  scp $OUT/*_$STAMP.* user@TARGET_IP:~/"
