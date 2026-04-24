# BuildersPlatform v2 Backend Phased Plan

**Date:** 2026-04-23
**Companion to:** `specs/2026-04-23-v2-architecture.md`
**Status:** Draft for execution

Nine phases, each atomic-shippable. Phase A is sequential (blocks everything identity-dependent). Phase B unblocks grading and the Modal backend. C, D, E, F, G, H are largely parallelizable after A + B. I is independent of the v2 content work and slots in whenever capacity allows.

---

## Dependency graph

```
A ──┬──► B ──┬──► E ──► F (needs event emissions from C, D, E)
    │        │
    │        └──► G
    │        │
    │        └──► H
    │
    ├──► C
    │
    └──► D

I is backend-only (Docker sandbox), independent after B.
```

---

## Phase A — Auth, users, entitlements

**Goal:** Replace `user_id = "local"` with real identity. Ship paper auth with a swap seam for Shark.

**Deliverables:**
- Migration `002_users_and_sessions.py` — `users`, `sessions` tables
- `backend/api/auth/` package:
  - `providers.py` — `AuthProvider` protocol + `PaperAuthProvider` implementation
  - `middleware.py` — bearer-token extraction → `request.state.user`
  - `router.py` — `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- `backend/api/entitlements.py` — `check_course_access`, `check_drill_access`, `check_track_access`
- Gate applied to every existing enroll/save/run endpoint (existing 8 routers updated)
- Dev-data migration: existing `user_id = "local"` rows reassigned to a seeded `local` user row on first migration run
- Admin endpoint `POST /admin/upgrade-tier` for tier overrides (until payments ship)

**Exit criteria:**
- New user registers via paper auth, logs in, receives token
- Token required on all protected routes
- User enrolls in one free course; second enroll 403s unless tier upgraded via admin
- `PaperAuthProvider` replaceable with a stub `SharkAuthProvider` without touching any route

**Effort:** 2 days

---

## Phase B — Runner abstraction, metrics, hidden tests

**Goal:** Prepare the runner for multi-backend routing and make grading possible.

**Deliverables:**
- Python: `ExecutionBackend` protocol in `backend/api/runner/backend.py`
- `GoRunnerBackend` wraps existing Go runner invocations
- Go runner change: emit `metrics: { runtime_ms, peak_mem_kb }` in the final SSE event (captured in `lifecycle/` package — `dispatch/` untouched)
- Go runner change: accept `test_set: "visible" | "hidden"` in `RunRequest`; default `visible`
- `course.yaml` schema update — add `backend`, `resource_tier`, `warm_container`, `reference_solutions`, per-submodule `visible_tests` / `hidden_tests` / `difficulty`. All optional with Phase-1-compatible defaults.
- Course loader validation of new fields (and graceful defaults for legacy course files)
- `reference_metrics` table + `scripts/bench_references.py` CI job
- `POST /runs/:run_id/cancel` endpoint (stub for now; real cancellation wired in Phase G when workspace-v2 needs it)

**Exit criteria:**
- Phase 1 courses (with no new fields) run unchanged through `GoRunnerBackend`
- Every test run records metrics in the final SSE event and in a DB row
- Hidden tests can be declared on a submodule and are not returned in `GET /courses/:slug/submodules/:id` responses
- CI bench job populates `reference_metrics` for every reference file in the courses repo

**Effort:** 3 days

---

## Phase C — Tracks catalog

**Goal:** Tracks visible in API, enrollable, progress computable. No new course content — tracks curate existing courses.

**Deliverables:**
- `backend/api/track_loader/` — `track.yaml` schema + loader (mirrors `course_loader` pattern)
- Track in-memory cache with `POST /admin/reload-tracks` refresh
- Migration `003_tracks.py` — `track_enrollments`
- Endpoints: `GET /tracks`, `GET /tracks/:slug`, `GET /tracks/:slug/progress`, `POST /tracks/:slug/enroll`
- Track progress computed on-demand: `builds.filter(course_slug in track.courses) / track.required_courses`
- Seed tracks for launch (in `builders-courses` repo under `tracks/`):
  - Systems (http-server, shell, allocator, tcp)
  - Networking (tcp, dns, quic-fragment, load-balancer)
  - Languages (lox-interpreter, pratt-parser, ts-transpiler)
- Entitlement gate: free tier can browse tracks, cannot enroll

**Exit criteria:**
- Frontend `/tracks` route hits real API, displays 3 seeded tracks
- Authenticated paid user enrolls in Systems track, sees course list with enforced languages where applicable
- Track progress bar accurately reflects any existing course completions in `builds`

**Effort:** 2 days

---

## Phase D — Practice drills

**Goal:** Standalone drills content, execution, streaks, leaderboard.

**Deliverables:**
- `backend/api/drill_loader/` — `drill.yaml` schema + loader
- Drill in-memory cache with `POST /admin/reload-drills` refresh
- Migration `004_practice.py` — `drill_attempts`, `drill_streaks`
- Endpoints:
  - `GET /practice/daily`
  - `GET /practice/drills`
  - `GET /practice/drills/:slug`
  - `POST /practice/drills/:slug/:lang/run`
  - `GET /practice/streak`
  - `GET /practice/leaderboard/weekly`
- Drill runner: thin Python wrapper around `GoRunnerBackend`; writes `drill_attempts` row on every submission; no enrollment; no workspace file persistence (ephemeral per run)
- Streak computation: lazy, evaluated on read of `/practice/streak`; advances on first-of-day pass; breaks if calendar gap in user's timezone
- Weekly leaderboard: materialized view refreshed every 5 min via cron, keyed on current ISO week, ranks by (drills_solved_this_week, current_streak, avg_time)
- Seed 15 drills across categories: parsers (3), concurrency (3), bit tricks (2), protocols (3), state machines (2), databases (2)
- Entitlement gate: free tier gets daily drill only; non-daily drills 403 on non-paid tiers

**Exit criteria:**
- User solves today's daily drill, streak increments, appears on weekly leaderboard within 5 minutes
- Drill catalog paginates with filter + sort
- Drill attempt records metrics (reused Phase B work)

**Effort:** 4 days

---

## Phase E — Grading + builds auto-creation

**Goal:** Submitting a completed course produces a graded Build record.

**Deliverables:**
- Migration `005_grading_and_builds.py` — `submodule_scores`, `builds`, `badges`
- `backend/api/grading.py`:
  - `compute_submodule_score(user, course_slug, language, submodule_id)` — correctness + efficiency + craft
  - `compute_course_grade(user, course_slug, language)` — difficulty-weighted average → letter
  - `run_hidden_test_suite(user, course, submodule)` — invokes backend with `test_set: hidden`
- `backend/api/builds.py`:
  - LOC counter (language-aware: strips comments, blank lines)
  - Highlight snippet extractor (reads `course.yaml highlight_hint:` — a function name or file path — extracts its body)
  - README template renderer (Jinja2 template per course; grade, tests, skills, hash interpolated)
  - Git hash capture (synthetic git repo per enrollment; commit sha on submit)
- Endpoint: `POST /courses/:slug/:lang/submit` — runs hidden tests across all submodules, computes grade, generates Build, returns Build
- Endpoints: `GET /builds`, `GET /builds/:slug`, `POST /builds/:slug/share` (share is a stub URL for now)
- Badge engine: rule set as data in `backend/api/badges/rules.py`, evaluated on every `activity_events` insert
- Submission replay: submit is idempotent within 24h (returns same Build); after 24h a re-submit creates a new Build with version suffix

**Exit criteria:**
- User completes all submodules of http-server, clicks submit, receives a letter grade within 30 seconds (hidden tests run server-side)
- Build appears in `/builds` with highlight_code, skills, grade, README, git hash
- Badges awarded where rules trigger (first-ship guaranteed)
- Grade breakdown visible via `GET /courses/:slug/:lang/score`

**Effort:** 4 days

---

## Phase F — Dashboard aggregation

**Goal:** `/courses` landing page (the dashboard) driven by real denormalized data, not mock.

**Deliverables:**
- Migration `006_activity.py` — `activity_events`, `user_activity_summary`
- Event emitter integrated at every significant action (enroll, pass, complete, submit, drill solve, resource open)
- Summary updater: Python after-commit hook on the same transaction that writes the event — refreshes `user_activity_summary` synchronously
- Heatmap JSONB update inline in the hook; nightly trim job keeps only last 365 days
- Endpoint: `GET /dashboard` reads `user_activity_summary` + `builds` (last 5) + `activity_events` (last 20) + active session resolver
- Active-session resolver: picks the most recent `test_*` event's course+language and surfaces live state
- Milestone tracker: for each enrolled track, builds completed / required
- Enrolled courses hydration: joins `enrollments` with latest `progress` row per course for "next_task" + percent complete

**Exit criteria:**
- Fresh user sees empty dashboard; completes one drill; dashboard reflects it on next refresh (< 2s staleness)
- Heatmap cell for today lights up after first activity
- Active session surfaces the most-recent course + its live pass/fail counts
- No query in `GET /dashboard` takes > 50ms on seeded test data (10 courses, 50 builds, 500 events)

**Effort:** 3 days

---

## Phase G — Workspace-v2 SSE extensions + frontend wiring

**Goal:** Workspace-v2 frontend stops consuming mock data; real runner events flow end-to-end.

**Deliverables:**
- SSE event types: `byte_diff`, `resource_unlock`, `concept_unlock`
- Go runner emits `byte_diff` for unit/stdout dispatchers when a string comparison fails (inline diff payload)
- `course.yaml` optional `concepts:` field populated for http-server as reference implementation
- Concept unlock computed: on any test pass, check `concepts[].unlocked_by` and emit `concept_unlock` for newly satisfied nodes
- Real cancellation wired in `POST /runs/:run_id/cancel` (Phase B stub becomes real)
- Frontend `src/components/workspace-v2/*` rewired to real endpoints:
  - Course + submodule load from `/courses/:slug`
  - File tree + stubs from `/courses/:slug/submodules/:id/files`
  - Save on edit → `/files/:path` (debounced 1.5s like Phase 1)
  - Run click → SSE stream from `/courses/:slug/submodules/:id/run`
  - Resource drawer → `/courses/:slug/resources/:id` lazy fetch
- Click-to-run only (no auto-rerun) for this phase

**Exit criteria:**
- Workspace-v2 loads http-server course, shows real file tree, edits persist on refresh
- Run click executes tests on real backend, streams live pass/fail, shows byte-diff for failing comparisons
- Submodule pass transitions UI state and writes `progress` row
- Concept graph highlights newly unlocked nodes as tests pass

**Effort:** 3 days (backend additions small; majority is frontend integration)

---

## Phase H — Modal backend

**Goal:** ML Systems and AI Agents tracks execute on Modal instead of the Go runner.

**Deliverables:**
- `backend/modal/` package:
  - `app.py` — Modal app definition
  - `images/python_cpu.py`, `images/python_gpu_t4.py`, `images/python_gpu_h100.py` — image specs
  - `functions.py` — per-tier Modal functions wrapping course execution
  - `log_translator.py` — Modal log stream → SSE event shape
  - `backend.py` — `ModalBackend` implementing `ExecutionBackend` protocol
- `keep_warm=1` applied to Modal functions where any course declares `warm_container: true`
- Secrets: `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` via Modal secret named `buildmancer-ai-keys`
- Cancellation via Modal `.cancel()` on function call handle
- Entitlement gate: Modal backends blocked for free tier (checked in `select_backend`)
- Seed content:
  - ML Systems track with 1 launch course: "mini-vllm" (vector-batched inference loop, Python + T4 GPU)
  - AI Agents track with 1 launch course: "tool-use-harness" (Python + CPU)
- Cost ceiling enforcement: `users.tier = 'builder'` capped at 10 GPU-minutes/day; soft-block with clear error message on overage

**Exit criteria:**
- Paid user enrolls in mini-vllm, hits run, test executes on Modal T4 GPU, SSE streams identically to Go-runner runs
- Warm container masks cold start (first run < 10s on a warm function; subsequent runs < 2s)
- Modal secret inject works: AI Agents course can call Anthropic API via env var
- Cost ceiling blocks overage user with helpful error

**Effort:** 5 days

---

## Phase I — Docker sandbox (Phase 2 of the original roadmap)

**Goal:** CPU courses run in isolated containers; host is protected from student code.

**Deliverables:**
- `GoRunnerBackend` gains `docker` mode (anticipated in original arch doc at `ARCHITECTURE.md:387`)
- Per-language Docker images with toolchains pre-installed (go, rust-cargo, python, node, c-gcc)
- Resource limits: 512 MB RAM, 1 CPU, 30-second wall clock default (overridable per course)
- Network egress deny by default; per-course allowlist in `course.yaml network_allowlist:` field
- Migrate production courses to `backend: docker` in YAML (dev stays `host-exec` for iteration speed)
- Health check: Go runner detects stuck containers and force-kills after grace period

**Exit criteria:**
- http-server course runs in Docker container in production
- Attempt to `rm -rf /` from student code does not affect host
- Network-unrestricted course (e.g. a course that tests against real HTTP APIs) works via explicit allowlist
- Container cold start adds < 500ms vs host-exec baseline

**Effort:** 4 days

---

## Total effort and staffing

~30 days for a single developer sequentially.

With two developers, parallelizable after A: ~18 days.
With three developers: ~14 days, constrained mainly by F (dashboard needs C + D + E events to test).

---

## Recommended ship order

1. **A** — blocking, must complete first
2. **B** + **C** + **D** in parallel (3 devs or sequential)
3. **E** — depends on B (hidden tests + metrics)
4. **F** — depends on event emissions from C, D, E
5. **G** — depends on B + E
6. **H** — depends on B; independent of E, F, G; can start as soon as B lands
7. **I** — any time after B; lowest priority for v2 launch (Phase 1 runs on host-exec acceptably for closed beta)

**Launch gate for closed beta:** A + B + C + D + E + F + G. H and I are post-launch.

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Course YAML schema changes break existing Phase 1 courses | All new fields optional with defaults that reproduce Phase 1 behavior; validation in loader rejects malformed additions but accepts minimal legacy files |
| Hidden test leakage via SSE output | Hidden test run suppresses `stdout` / `stderr` events server-side; only `metrics` + final `done` with pass/fail counts reach the client |
| Modal cost spike from runaway student code | Per-user daily GPU-minute cap; wall-clock timeout on every Modal call; monitoring alert at 80% cap |
| Paper auth tokens leak in logs | Token transport in `Authorization` header only, never URL params; structured logger strips `Authorization` by default |
| Dashboard denormalization drift | Nightly reconciliation job recomputes `user_activity_summary` from events and flags discrepancies; fix forward on mismatch |
| Grading non-determinism across backend tiers | Reference metrics captured per backend; student compared against same-backend reference only |
| Leaderboard gaming via concurrent submissions | Drill attempts rate-limited to 1/minute per user per drill |
| Course versioning breaks track enrollees mid-track | Snapshot course version hash in `track_enrollments.course_versions_at_enroll` JSONB; migration prompt when user's version lags production (deferred to post-launch) |

---

## Validation strategy per phase

**Test framework: pytest.** All backend tests live under `backend/tests/` and run via `pytest`. No phase is marked complete without passing e2e coverage across every major component it touches.

Each phase ships with:
- Alembic migration + downgrade tested via pytest fixture (`backend/tests/conftest.py` spins an ephemeral Postgres per test module)
- Router-level integration tests for every new endpoint
- **End-to-end tests across major components** — mandatory. An e2e test exercises the full path: HTTP → FastAPI router → entitlement middleware → DB writes → execution backend (Go runner or Modal) → SSE stream back → DB state verification. One e2e test per user-facing feature minimum.
- Reference metric benchmarks (Phase B+) run under pytest as a separate marker (`@pytest.mark.bench`) so CI can gate slow tests behind a flag
- Manual smoke test in workspace-v2 frontend against real endpoints before declaring done

### Required e2e coverage per phase

| Phase | E2E tests required |
|---|---|
| A | register → login → enroll (free tier claim) → second enroll blocked → admin upgrade → second enroll passes |
| B | legacy course runs through `GoRunnerBackend` unchanged, metrics captured; hidden tests declared + run separately; reference bench populates `reference_metrics` |
| C | load tracks → enroll → progress reflects existing builds → cert progress bar advances after a new build |
| D | solve daily drill → streak increments → leaderboard reflects within 5 min; non-daily drill 403s for free tier |
| E | complete all submodules → submit → hidden tests run → grade computed → build row created with all fields populated → badges evaluated |
| F | fresh user → activity event emission → `user_activity_summary` updated same-transaction → dashboard read reflects it |
| G | workspace-v2 loads real course → edit + save persists → run streams SSE → byte_diff emitted on failure → concept_unlock emitted on pass → progress row written |
| H | Modal backend: paid user enrolls → run executes on Modal → logs translated to SSE → metrics captured → warm container masks cold start; free tier blocked from Modal backends; cost cap enforcement |
| I | Docker: `rm -rf /` in student code does not affect host; network egress deny default; allowlist works; container wall-clock timeout fires |

### Test organization

```
backend/tests/
├── conftest.py              # ephemeral Postgres, test client, seeded user factories
├── unit/                    # pure-function tests (grading math, LOC counter, heatmap ops)
├── integration/             # single-router + DB tests
├── e2e/                     # full-stack HTTP → runner → DB flows, one file per phase
│   ├── test_phase_a_auth.py
│   ├── test_phase_b_runner.py
│   ├── test_phase_c_tracks.py
│   ├── test_phase_d_practice.py
│   ├── test_phase_e_grading.py
│   ├── test_phase_f_dashboard.py
│   ├── test_phase_g_workspace_v2.py
│   ├── test_phase_h_modal.py
│   └── test_phase_i_docker.py
└── bench/                   # reference solution benchmarks (marker-gated)
```

CI runs `pytest backend/tests/unit backend/tests/integration backend/tests/e2e` on every PR. Bench suite runs nightly.
