# BuildersPlatform dev Makefile (Windows — requires pwsh or powershell)

.PHONY: dev dev-all stop runner api frontend install build-runner

# dev — 3 separate windows (recommended, each Ctrl+C independent)
dev:
	powershell -ExecutionPolicy Bypass -File dev.ps1

# dev-all — all 3 in one terminal, interleaved output. Ctrl+C kills all.
# Requires GNU make with -j support (MSYS2/Git Bash make works).
dev-all:
	$(MAKE) -j3 runner api frontend

stop:
	powershell -ExecutionPolicy Bypass -File dev-stop.ps1

runner:
	cd backend/runner && ./server.exe

api:
	cd backend && PYTHONPATH=. api/.venv/Scripts/uvicorn.exe api.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

install:
	cd backend/api && uv sync
	cd frontend && npm install

build-runner:
	cd backend/runner && go build -o server.exe ./cmd/server
