# BuildersPlatform dev Makefile

.PHONY: dev dev-all stop runner api frontend install build-runner

# dev — background processes with combined output. Ctrl+C kills all.
dev:
	./dev.sh

# dev-all — all 3 in one terminal, interleaved output. Ctrl+C kills all.
# Requires GNU make with -j support.
dev-all:
	$(MAKE) -j3 runner api frontend

stop:
	./dev-stop.sh

runner:
	cd backend/runner && ./server

api:
	cd backend && PYTHONPATH=. api/.venv/bin/uvicorn api.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

install:
	cd backend/api && uv sync
	cd frontend && npm install

build-runner:
	cd backend/runner && go build -o server ./cmd/server
