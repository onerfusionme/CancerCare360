#!/bin/bash
# Restore PostgreSQL Database for CancerCare360 Disaster Recovery

set -euo pipefail

# Configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"postgres"}
DB_NAME=${DB_NAME:-"cancercare"}
MAINTENANCE_DB=${MAINTENANCE_DB:-"postgres"}
BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
    echo "[ERROR] Please specify a backup file to restore."
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file ${BACKUP_FILE} not found."
    exit 1
fi

# Validate backup
echo "[INFO] Validating backup archive integrity..."
if ! gzip -t "${BACKUP_FILE}"; then
    echo "[ERROR] Backup file is corrupt or not a valid gzip archive."
    exit 1
fi

echo "[WARNING] This operation will DROP and RECREATE the database '${DB_NAME}'."
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "[INFO] Restore cancelled."
    exit 1
fi

echo "[INFO] Starting database restore at $(date)"

# Drop and Recreate database
echo "[INFO] Dropping existing database (if any)..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${MAINTENANCE_DB}" -c "DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE);"

echo "[INFO] Recreating database..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${MAINTENANCE_DB}" -c "CREATE DATABASE ${DB_NAME};"

# Restore
echo "[INFO] Restoring database from ${BACKUP_FILE}..."
if zcat "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"; then
    echo "[INFO] Database restore completed successfully."
else
    echo "[ERROR] Database restore failed!"
    exit 1
fi

echo "[INFO] Restore process finished successfully."
