#!/bin/bash
set -e

service postgresql start

su - postgres <<EOF
psql -c "DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cancercare') THEN
    CREATE USER cancercare WITH PASSWORD 'cancercare123' SUPERUSER;
  ELSE
    ALTER USER cancercare WITH PASSWORD 'cancercare123';
  END IF;
END
\$\$;"

psql -tc "SELECT 1 FROM pg_database WHERE datname = 'cancercare360'" | grep -q 1 || psql -c "CREATE DATABASE cancercare360 OWNER cancercare;"
EOF

sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf || true
grep -q "host all all 0.0.0.0/0 md5" /etc/postgresql/16/main/pg_hba.conf || echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf
grep -q "host all all ::0/0 md5" /etc/postgresql/16/main/pg_hba.conf || echo "host all all ::0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf

service postgresql restart

# Run init-db.sql
psql -U cancercare -d cancercare360 -h localhost -f /mnt/d/CancerCare/infrastructure/scripts/init-db.sql || true

echo "PostgreSQL setup complete!"
