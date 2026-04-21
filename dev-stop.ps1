#!/usr/bin/env pwsh
# Kill dev services on ports 9000 (runner), 8000 (api), 3000 (frontend)

$ports = @(9000, 8000, 3000)

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) {
        Write-Host "port $port - nothing listening"
        continue
    }
    foreach ($c in $conns) {
        try {
            $proc = Get-Process -Id $c.OwningProcess -ErrorAction Stop
            Stop-Process -Id $proc.Id -Force
            Write-Host "killed $($proc.ProcessName) (pid $($proc.Id)) on port $port" -ForegroundColor Green
        } catch {
            Write-Warning "failed port $port pid $($c.OwningProcess): $_"
        }
    }
}
