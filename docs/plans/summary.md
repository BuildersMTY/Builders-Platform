# Buildmancer Pipeline & Sustainability Summary

Buildmancer is a sandboxed execution platform designed to turn student code into production-grade portfolios.

## Technical Architecture

Buildmancer uses a decoupled, three-tier architecture designed for low latency and high security:

- **Frontend (Next.js)**: A polished workspace UI with a custom monaco-based editor, real-time SSE test streaming, and a difficulty-aware resource staging system.
- **API (FastAPI)**: Orchestrates the state (Postgres/SQLModel), manages student enrollments, and proxies execution requests to the Runner. It handles the Git logic (initializing repos, committing logic) to keep the runner stateless.
- **Stateless Runner (Go)**: A high-performance execution engine that exposes a `/run` SSE endpoint. It uses an **Executor Interface** to swap between:
  - `LocalExec`: Runs directly on the host (for development).
  - `DockerExec`: Runs in a resource-constrained, network-isolated container.
  - `ModalExec`: Offloads to GPU-enabled functions for ML workloads.

## Key Features

### 1. The Git-Flow Engine

The platform treats every student as a software contributor.

- **Seeding**: Enrollments start with a `git init` from course stubs.
- **Pass-to-Commit**: Every time a submodule passes, the API automatically commits the student's work.
- **Graduation**: Users end the course by pushing a fully-formed repository to GitHub, complete with a professional, auto-generated README that highlights their accomplishments.

### 2. Multi-Type Test Dispatcher

The runner supports six specialized test types to cover everything from systems programming to AI:

- `stdout`: Exact match or regex check of process output.
- `unit`: Integration with native test runners (Pytest, Vitest, Go Test, etc.).
- `http/tcp`: Verification of network server behavior by pinging exposed ports.
- `script`: Arbitrary bash/python checks for complex logic.
- `eval` (NEW): Metric-based assertions (e.g., "Loss < 3.0") for ML training runs.

### 3. Beginner-Friendly Rails

To ensure a high completion rate, the workspace implements:

- **Difficulty-Aware Hints**: Hints unlock at different times based on whether the student is a Junior, Mid, or Senior.
- **Coach-Marks**: Visual cues that guide first-time users through the "Brief -> Code -> Run" loop.
- **Stuck-State Detection**: If a student fails multiple times, the platform proactively suggests relevant documentation or hints.

## Current Roadmap

- **Phase 0-2**: Stability and Docker Sandboxing (Weeks 1-2).
- **Phase 3**: Git-Flow and GitHub Integration (Weeks 3-4).
- **Phase 4**: Modal GPU Support and Cost Guardrails (Weeks 5-6).
