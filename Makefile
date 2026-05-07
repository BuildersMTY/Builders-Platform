# BuildersPlatform dev Makefile

.PHONY: dev dev-all stop runner api frontend shark all install build-runner

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

# shark — download and run the SharkAuth binary on :8080
shark:
	@sh -c 'if [ ! -f bin/shark ]; then \
		mkdir -p bin && \
		curl -fsSL https://github.com/shark-auth/shark/releases/latest/download/shark_linux_x86_64.tar.gz -o bin/shark.tar.gz && \
		tar -xzf bin/shark.tar.gz -C bin && \
		rm bin/shark.tar.gz && \
		chmod +x bin/shark; \
	fi; \
	bin/shark serve --no-prompt'

install:
	cd backend/api && uv sync
	cd frontend && npm install

build-runner:
	cd backend/runner && go build -o server ./cmd/server
