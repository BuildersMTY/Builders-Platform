## Add tmux dev session script for local development

### Context

Running the Buildmancer stack locally requires 3 services:
- Postgres (via Docker Compose)
- Go runner (`:9000`)
- Python API (`:8000`)

### Request

Create a tmux session script (`scripts/dev.sh` or similar) that:
- Starts a tmux session with named panes
- Pane 1: `docker compose up postgres`
- Pane 2: `cd backend/runner && go run cmd/server/main.go`
- Pane 3: `cd backend && uvicorn api.main:app --reload --port 8000`
- Optional pane 4: watching logs or running tests

Also investigate compatibility — user is on Windows, may need WSL for tmux.

### Priority

Nice-to-have for DX. Not blocking.
