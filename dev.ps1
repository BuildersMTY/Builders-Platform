#!/usr/bin/env pwsh
# Dev launcher - runner (9000), api (8000), frontend (3000)
# Usage: .\dev.ps1

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

if (Get-Command pwsh -ErrorAction SilentlyContinue) {
    $shell = 'pwsh'
} else {
    $shell = 'powershell'
}

function Start-Service-Tab {
    param([string]$Title, [string]$WorkDir, [string]$Cmd)
    $full = "`$host.ui.RawUI.WindowTitle='$Title'; Set-Location '$WorkDir'; Write-Host '[$Title] starting...' -ForegroundColor Cyan; $Cmd"
    Start-Process $shell -ArgumentList '-NoExit','-NoLogo','-Command',$full | Out-Null
}

$runnerDir = Join-Path $root 'backend\runner'
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'

$runnerBin = Join-Path $runnerDir 'server.exe'
$uvicornBin = Join-Path $root 'backend\api\.venv\Scripts\uvicorn.exe'

if (-not (Test-Path $runnerBin))  { Write-Warning "runner not built at $runnerBin - run: cd backend/runner; go build -o server.exe ./cmd/server" }
if (-not (Test-Path $uvicornBin)) { Write-Warning "api venv missing - run: cd backend/api; uv sync" }
if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) { Write-Warning "frontend deps missing - run: cd frontend; npm install" }

Start-Service-Tab 'runner'   $runnerDir  '.\server.exe'
Start-Service-Tab 'api'      $backendDir "`$env:PYTHONPATH='.'; .\api\.venv\Scripts\uvicorn.exe api.main:app --reload --port 8000"
Start-Service-Tab 'frontend' $frontendDir 'npm run dev'

Write-Host ""
Write-Host "launched 3 windows:" -ForegroundColor Green
Write-Host "  runner    http://localhost:9000"
Write-Host "  api       http://localhost:8000"
Write-Host "  frontend  http://localhost:3000"
Write-Host ""
Write-Host "stop all:  .\dev-stop.ps1" -ForegroundColor Yellow
