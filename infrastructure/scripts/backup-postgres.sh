#!/bin/bash
# Backup PostgreSQL Database for CancerCare360

set -euo pipefail

# Configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
DB_NAME=${DB_NAME:-"cancercare"}
BACKUP_DIR=${BACKUP_DIR:-"/var/backups/postgres"}
RETENTION_DAYS=${RETENTION_DAYS:-30}
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cancercare_${DATE}.sql.gz"

# S3/MinIO Configuration (Optional)
S3_ENABLED=${S3_ENABLED:-"false"}
S3_BUCKET=${S3_BUCKET:-"s3://cancercare-backups"}
S3_ENDPOINT=${S3_ENDPOINT:-"https://minio.cancercare360.com"}

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting database backup at $(date)"

# Perform pg_dump
if PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"; then
    echo "[INFO] Backup completed successfully: ${BACKUP_FILE}"
else
    echo "[ERROR] Database backup failed!"
    exit 1
fi

# Cleanup old backups
echo "[INFO] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "cancercare_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm {} \;

# Upload to S3/MinIO
if [ "${S3_ENABLED}" = "true" ]; then
    echo "[INFO] Uploading backup to S3/MinIO..."
    if aws --endpoint-url="${S3_ENDPOINT}" s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/" --sse aws:kms; then
        echo "[INFO] Upload completed."
    else
        echo "[ERROR] S3 Upload failed!"
        exit 1
    fi
fi

echo "[INFO] Backup process finished successfully."
