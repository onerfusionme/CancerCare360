#!/bin/bash
cd /mnt/d/CancerCare/backend
node dist/src/main.js > /mnt/d/CancerCare/backend/output.log 2>&1
echo "EXIT: $?" >> /mnt/d/CancerCare/backend/output.log
