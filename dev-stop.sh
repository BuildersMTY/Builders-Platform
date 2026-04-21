#!/usr/bin/env bash
# Kill dev services on ports 9000 (runner), 8000 (api), 3000 (frontend)

ports=(9000 8000 3000)

for port in "${ports[@]}"; do
    pids=$(lsof -ti tcp:${port})
    if [ -z "$pids" ]; then
        echo "port $port - nothing listening"
        continue
    fi
    for pid in $pids; do
        proc_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
        if kill -9 "$pid" 2>/dev/null; then
            echo -e "\033[32mkilled $proc_name (pid $pid) on port $port\033[0m"
        else
            echo -e "\033[33mfailed to kill pid $pid on port $port\033[0m"
        fi
    done
done
