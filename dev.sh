#!/usr/bin/env bash
# Dev launcher - runner (9000), api (8000), frontend (3000)
# Usage: ./dev.sh

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

runner_bin="$root/backend/runner/server"
uvicorn_bin="$root/backend/api/.venv/bin/uvicorn"

if [ ! -f "$runner_bin" ]; then
    echo "Warning: runner not built at $runner_bin - run: make build-runner"
fi
if [ ! -f "$uvicorn_bin" ]; then
    echo "Warning: api venv missing - run: make install"
fi
if [ ! -d "$root/frontend/node_modules" ]; then
    echo "Warning: frontend deps missing - run: make install"
fi

# Handle cleanup on Ctrl+C
trap 'echo -e "\nStopping all services..."; kill 0' SIGINT

echo "launching 3 services..."
echo -e "\033[32m  runner    http://localhost:9000\033[0m"
echo -e "\033[32m  api       http://localhost:8000\033[0m"
echo -e "\033[32m  frontend  http://localhost:3000\033[0m\n"

# Run all in background and wait
(cd "$root/backend/runner" && ./server) &
(cd "$root/backend" && PYTHONPATH=. "$uvicorn_bin" api.main:app --reload --port 8000) &
(cd "$root/frontend" && npm run dev) &

wait
