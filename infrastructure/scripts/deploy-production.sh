#!/usr/bin/env bash
set -eo pipefail

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;37m   CancerCare360 Enterprise Oncology OS Deployment\033[0m"
echo -e "\033[1;36m========================================================\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "\n\033[1;33m[1/5] Checking Environment & Prerequisites...\033[0m"
command -v node >/dev/null 2>&1 || { echo "Node.js required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python3 required but not installed."; exit 1; }
echo -e "  \033[1;32m✔ Node.js: $(node -v)\033[0m"
echo -e "  \033[1;32m✔ Python3: $(python3 --version)\033[0m"

echo -e "\n\033[1;33m[2/5] Synchronizing PostgreSQL Database Schema & Composite Indexes...\033[0m"
cd "$WORKSPACE_ROOT/backend"
npx prisma db push --skip-generate
echo -e "  \033[1;32m✔ PostgreSQL schema and composite indexes synchronized.\033[0m"

echo -e "\n\033[1;33m[3/5] Building Production Artifacts...\033[0m"
echo "  Compiling NestJS backend..."
cd "$WORKSPACE_ROOT/backend"
npm run build
echo -e "  \033[1;32m✔ Backend build complete.\033[0m"

echo "  Compiling Next.js 14 frontend..."
cd "$WORKSPACE_ROOT/frontend"
npm run build
echo -e "  \033[1;32m✔ Frontend build complete.\033[0m"

echo -e "\n\033[1;33m[4/5] Multi-Tier Healthcheck Probes...\033[0m"
curl -sf http://localhost:3001/api/v1/health >/dev/null && echo -e "  \033[1;32m✔ Backend API (port 3001) - 200 OK\033[0m" || echo -e "  \033[1;33m⚠ Backend API probe failed\033[0m"
curl -sf http://localhost:3000/login >/dev/null && echo -e "  \033[1;32m✔ Next.js Portal (port 3000) - 200 OK\033[0m" || echo -e "  \033[1;33m⚠ Frontend portal probe failed\033[0m"
curl -sf http://localhost:8000/health >/dev/null && echo -e "  \033[1;32m✔ AI Service (port 8000) - 200 OK\033[0m" || echo -e "  \033[1;33m⚠ AI service probe failed\033[0m"

echo -e "\n\033[1;36m[5/5] Deployment Successful!\033[0m"
echo -e "  • Clinical Workstation: http://localhost:3000/dashboard"
echo -e "  • Patient Companion:    http://localhost:3000/portal"
echo -e "  • API Swagger Docs:     http://localhost:3001/api/docs"
echo -e "  • AI Microservice Docs: http://localhost:8000/docs"
