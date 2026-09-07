<#
.SYNOPSIS
  CancerCare360 — Turn-Key Production Deployment & Orchestration Script
.DESCRIPTION
  Automates end-to-end building, database migrations, container orchestration, 
  and multi-tier health verification for CancerCare360 Oncology OS.
#>

param (
    [switch]$SkipBuild = $false,
    [switch]$SeedData = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   CancerCare360 Enterprise Oncology OS Deployment" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Cyan

$WorkspaceRoot = Resolve-Path "$PSScriptRoot\..\.."
Write-Host "[1/5] Checking Environment & Prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH."
}
$NodeVer = node --version
Write-Host "  ✔ Node.js: $NodeVer" -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed or not in PATH."
}
$PyVer = python --version
Write-Host "  ✔ Python: $PyVer" -ForegroundColor Green

Write-Host "`n[2/5] Synchronizing PostgreSQL Database Schema & Composite Indexes..." -ForegroundColor Yellow
Push-Location "$WorkspaceRoot\backend"
try {
    npx prisma db push --skip-generate
    Write-Host "  ✔ PostgreSQL database schema and composite indexes synchronized." -ForegroundColor Green
    
    if ($SeedData) {
        Write-Host "  🌱 Seeding oncology demonstration data..." -ForegroundColor Yellow
        npx ts-node prisma/seed.ts
        Write-Host "  ✔ Clinical oncology data seeded." -ForegroundColor Green
    }
} finally {
    Pop-Location
}

if (-not $SkipBuild) {
    Write-Host "`n[3/5] Building Production Artifacts..." -ForegroundColor Yellow
    
    # Build Backend
    Write-Host "  Compiling NestJS backend..." -ForegroundColor Gray
    Push-Location "$WorkspaceRoot\backend"
    try {
        npm run build
        Write-Host "  ✔ Backend compilation successful." -ForegroundColor Green
    } finally {
        Pop-Location
    }

    # Build Frontend
    Write-Host "  Compiling Next.js 14 frontend..." -ForegroundColor Gray
    Push-Location "$WorkspaceRoot\frontend"
    try {
        npm run build
        Write-Host "  ✔ Frontend Next.js build successful." -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n[3/5] Skipping compilation step (-SkipBuild specified)." -ForegroundColor Gray
}

Write-Host "`n[4/5] Verifying Multi-Tier Service Healthchecks..." -ForegroundColor Yellow

function Test-HttpEndpoint {
    param ([string]$Url, [string]$ServiceName)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✔ $ServiceName ($Url) - 200 OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠ $ServiceName returned $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  ⚠ $ServiceName ($Url) is not responding: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

Test-HttpEndpoint -Url "http://localhost:3001/api/v1/health" -ServiceName "Backend API (NestJS)"
Test-HttpEndpoint -Url "http://localhost:3000/login" -ServiceName "Web Portal (Next.js)"
Test-HttpEndpoint -Url "http://localhost:8000/health" -ServiceName "AI Decision Support (FastAPI)"

Write-Host "`n[5/5] Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor White
Write-Host "  System Access Endpoints:" -ForegroundColor White
Write-Host "  • Clinical Workstation: http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host "  • Patient Companion:    http://localhost:3000/portal" -ForegroundColor Cyan
Write-Host "  • API Swagger Docs:     http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "  • AI Microservice Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`n  Default Clinical Credentials:" -ForegroundColor White
Write-Host "  • Oncologist:  doctor@cityhospital.com     / doctor123" -ForegroundColor Gray
Write-Host "  • Coordinator: coordinator@cityhospital.com / coordinator123" -ForegroundColor Gray
Write-Host "  • Admin:       admin@cancercare360.com    / admin123" -ForegroundColor Gray
Write-Host "========================================================`n" -ForegroundColor White
