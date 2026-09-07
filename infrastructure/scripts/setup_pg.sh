#!/bin/bash
set -x

su - postgres << 'EOF'
psql -c "CREATE USER cancercare WITH PASSWORD 'cancercare123' SUPERUSER;" || true
psql -c "CREATE DATABASE cancercare360 OWNER cancercare;" || true
EOF

sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/18/main/postgresql.conf
echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/18/main/pg_hba.conf
echo "host all all 127.0.0.1/32 trust" >> /etc/postgresql/18/main/pg_hba.conf
echo "host all all ::0/0 trust" >> /etc/postgresql/18/main/pg_hba.conf

pg_ctlcluster 18 main restart

su - postgres << 'EOF'
psql -d cancercare360 -f /mnt/d/CancerCare/infrastructure/scripts/init-db.sql
EOF

echo "SUCCESS_POSTGRES_READY"
