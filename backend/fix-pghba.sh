#!/bin/bash
# Fix pg_hba.conf to use trust for all connections
PG_HBA="/etc/postgresql/18/main/pg_hba.conf"

# Backup original
sudo cp $PG_HBA ${PG_HBA}.bak

# Create new pg_hba.conf with trust for all connections
sudo tee $PG_HBA > /dev/null << 'EOF'
# Trust all connections for development
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    all             all             0.0.0.0/0               trust
host    all             all             ::0/0                   trust
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
EOF

# Reload PostgreSQL to apply changes
sudo -u postgres pg_ctlcluster 18 main reload
echo "PG_HBA FIXED AND RELOADED"
