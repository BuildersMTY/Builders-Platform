# Buildmancer — Platform Architecture

## Overview

Buildmancer is a browser-based coding education platform where students build real projects (HTTP servers, Redis clones, memory allocators) through guided, testable submodules. Students write code in a browser editor, run declarative tests against their implementation, and progress through courses one concept at a time.

The platform is a companion product to the BuildersMTY community (buildersmty.com.mx) but operates as an independent product with its own identity and broader scope.

---

## System Topology

```
┌──────────────────────────────────────────────────────────┐
│  Docker Compose                                          │
│                                                          │
│  ┌──────────┐   HTTP/SSE    ┌─────────────┐             │
│  │ FastAPI   │─────────────→│ Go Runner   │             │
│  │ (Python)  │←─────────────│ (orchestrator)│            │
│  │ :8000     │              │ :9000       │             │
│  └────┬─────┘              └──────┬──────┘             │
│       │                           │                      │
│       │ SQL                       │ Phase 1: host exec   │
│       ▼                           │ Phase 2: docker run  │
│  ┌──────────┐                     ▼                      │
│  │ Postgres │          ┌────────────────────┐            │
│  │ :5432    │          │ Container Pool     │            │
│  └──────────┘          │ (Phase 2)         │            │
│                         │                    │            │
│  ┌──────────┐          │ runner-go  [warm]  │            │
│  │ Next.js  │          │ runner-c   [warm]  │            │
│  │ :3000    │          │ runner-py  [warm]  │            │
│  └──────────┘          └────────────────────┘            │
│                                                          │
│  /mnt/courses/ ← mounted volume (courses repo)          │
└──────────────────────────────────────────────────────────┘
```

### Service Responsibilities

- **Next.js frontend** — UI only. Code editor (CodeMirror 6), course navigation, real-time test output display, resources sidebar. Talks to FastAPI over HTTP.
- **FastAPI (Python)** — All business logic. Course loading/validation, file management, progress tracking, enrollment, locale resolution. Calls Go runner for test execution, proxies SSE stream to the browser.
- **Go Runner** — Stateless execution engine. Receives a fully resolved RunRequest (student files + test specs + build commands), builds the project, dispatches tests by type, streams results as SSE. Knows nothing about users, progress, courses, or the database.
- **Postgres** — User state: working files, progress, enrollments.
- **Courses volume** — Read-only filesystem mount. Contains course definitions (course.yaml), stubs, solutions, resources, and test scripts. The platform reads from this; it never writes to it.

### Communication Patterns

| Path | Protocol | Purpose |
|---|---|---|
| Browser → FastAPI | HTTP | API calls, autosave (debounced PATCH every 2s) |
| Browser ← FastAPI | SSE | Real-time test output streaming |
| FastAPI → Go Runner | HTTP POST | Trigger a run with a fully resolved RunRequest |
| FastAPI ← Go Runner | SSE | Streamed build/test events |
| FastAPI → Postgres | SQL | User state (via SQLModel) |
| FastAPI → Courses volume | Filesystem read | Course definitions and assets |

---

## Monorepo Structure

```
buildmancer/
  frontend/                  ← Next.js app
    ...
  backend/
    api/                     ← FastAPI app
      main.py
      routers/
        courses.py           GET /api/courses, GET /api/courses/:slug
        files.py             GET + PATCH /api/files/...
        run.py               POST /api/run/:course/:submodule
        stream.py            GET /api/stream/:run_id (SSE)
        progress.py          GET /api/progress/:course
        enroll.py            POST /api/enroll/:slug
        resources.py         GET /api/resources/:slug/:submodule
        admin.py             POST /api/admin/reload-courses
      models/                Pydantic models + SQLModel schemas
      db/                    Postgres connection, migrations
      course_loader/         Parse + validate course.yaml, locale merge
    runner/                  ← Go service
      cmd/server/main.go
      internal/
        build/               Build step execution
        dispatch/            Test dispatchers: unit, stdout, http, tcp, script
        lifecycle/           Binary process management (spawn, readiness, kill)
  docker-compose.yml         All services together
```

---

## Course Content Architecture

### Directory Layout (courses repo, mounted at /mnt/courses/)

```
courses/
  {course-slug}/
    {programming-language}/
      course.yaml              ← canonical: structure + tests + Spanish text
      course.en.yaml           ← English text overrides (optional)
      src/                     ← stubs the student starts from
      solution/                ← reference implementation (never served)
      resources/
        es/                    ← Spanish resources (default)
          {module-id}/file.md
        en/                    ← English resources (overlay)
          {module-id}/file.md
      tests/                   ← script-type test files (optional)
```

### Locale Strategy

- **Spanish is the base language.** `course.yaml` contains all structure, tests, and Spanish text.
- **English is an overlay.** `course.en.yaml` overrides text fields only (titles, descriptions, specs, resource titles). Structural fields (tests, stubs, IDs) are ignored in overlays.
- **Resources** resolve to `resources/{locale}/`. If a file is missing in the requested locale, fall back to `resources/es/`.
- **Locale is per-enrollment.** Stored in the `enrollments` table. Passed through to the course loader on every request.

### Locale Merge Logic

```
1. Parse course.yaml → base (Spanish)
2. If requested locale != "es" AND course.{locale}.yaml exists:
   - Parse overlay
   - Walk the course tree, overwrite text fields only:
     meta.title, meta.description,
     module.title, module.description,
     submodule.title, submodule.spec,
     resource.title
   - Structural fields (tests, stubs, ids) are never overwritten
3. Resolve resource file paths to resources/{locale}/
   - Missing file in locale → fall back to resources/es/
```

---

## Course Loader

Single module at `backend/api/course_loader/`. Reads the courses volume, parses YAML, validates, merges locale overlays, returns typed dataclasses.

### Interface

```python
load_course(path: Path, locale: str = "es") -> Course
load_all_courses(base_path: Path, locale: str = "es") -> list[Course]
```

### Data Model

```
Course
  meta: CourseMeta            # slug, title, description, language, difficulty,
                              # runner, estimated_hours, build_cmd, run_cmd, unit_cmd
  modules: list[Module]

Module
  id: str
  title: str
  description: str
  integration_test: TestSpec | None
  submodules: list[Submodule]

Submodule
  id: str                     # submodule id only
  full_id: str                # "{module_id}/{submodule_id}" — matches DB keys
  title: str
  spec: str
  stubs: list[StubRef]        # path relative to src/
  tests: list[TestSpec]
  resources: list[Resource]

TestSpec
  type: str                   # unit | stdout | http | tcp | script
  # type-specific fields as Optional (match, stdin, expected_stdout, request,
  # expected, send, send_hex, file, manages_lifecycle, timeout_ms, etc.)

Resource
  title: str
  file: str                   # resolved to resources/{locale}/...
  type: str                   # doc | spec | signature | hint
  visible_to: list[str]       # junior | mid | senior
```

### Validation (fail fast on load)

- `meta.slug` matches directory name
- Every `stubs[].path` resolves to a file in `src/`
- Every `resources[].file` resolves in `resources/{locale}/` (fallback `resources/es/`)
- Every `tests[].file` (script type) resolves in `tests/`
- Every test has required fields for its type
- No duplicate submodule IDs within a course

### Caching

Courses are static content. Loaded into memory at startup. Refreshed via `POST /api/admin/reload-courses`.

---

## Database Schema

```sql
CREATE TABLE enrollments (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL,           -- "local" in Phase 1, Shark ID later
    course_slug TEXT NOT NULL,
    difficulty  TEXT NOT NULL,            -- junior | mid | senior
    locale      TEXT NOT NULL DEFAULT 'es',
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_slug)
);

CREATE TABLE working_files (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL,
    course_slug TEXT NOT NULL,
    filepath    TEXT NOT NULL,            -- relative path, e.g. "server.go"
    content     TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_slug, filepath)
);

CREATE TABLE progress (
    id           SERIAL PRIMARY KEY,
    user_id      TEXT NOT NULL,
    course_slug  TEXT NOT NULL,
    submodule_id TEXT NOT NULL,           -- "{module_id}/{submodule_id}"
    passed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_slug, submodule_id)
);
```

### Design Notes

- **`working_files` keys on `(user_id, course_slug, filepath)`** — not per-submodule. One workspace per enrollment. Files accumulate and evolve as the student progresses through submodules that may edit the same file.
- **Module completion is derived**, not stored. A module is complete when all its submodules have `progress` rows.
- **`user_id` is TEXT**, not a foreign key. Phase 1 uses a hardcoded default. When Shark auth is integrated, add a `users` table and convert to real FKs.
- **No courses or modules tables.** Course structure lives in YAML. The DB only tracks user state.

---

## API Surface

### Course Browsing

```
GET /api/courses
  → list of all courses (slug, title, description, language, difficulty, estimated_hours)

GET /api/courses/{slug}
  → full course detail: modules, submodules (id, title, spec), resource metadata
  → query param: ?locale=es (default)
```

### Enrollment

```
POST /api/enroll/{slug}
  body: { "difficulty": "mid", "locale": "es" }
  → creates enrollment row
  → seeds working_files with ALL stubs from src/
  → returns enrollment confirmation
```

### Student Workspace

```
GET /api/files/{slug}/{submodule}
  → all working files relevant to the current submodule
  → reads from working_files table

PATCH /api/files/{slug}/{filepath}
  body: { "content": "..." }
  → upserts file content in working_files (autosave target, debounced 2s from frontend)
```

### Test Execution

```
POST /api/run/{slug}/{submodule}
  → loads course.yaml test specs for the submodule
  → reads ALL working_files for the enrollment (full workspace)
  → resolves build_cmd, run_cmd, unit_cmd from language defaults + overrides
  → inlines script file contents
  → POSTs RunRequest to Go runner
  → returns { "run_id": "..." }

GET /api/stream/{run_id}
  → SSE stream proxied from Go runner
```

### Progress

```
GET /api/progress/{slug}
  → list of passed submodule IDs + enrollment info
  → frontend derives: completed / current / locked states
```

### Resources

```
GET /api/resources/{slug}/{submodule}
  → reads resource markdown files from courses volume
  → filters by enrollment difficulty (visible_to)
  → returns inline markdown content:
    [{ "title": "...", "type": "spec", "content": "markdown..." }]
```

### Admin

```
POST /api/admin/reload-courses
  → clears in-memory course cache, reloads from filesystem
```

---

## Go Runner Architecture

### API

Single endpoint:

```
POST /run → SSE stream
```

### RunRequest Schema

```
RunRequest {
    run_id:    string
    language:  string                   // "go", "c", "python"
    build_cmd: string                   // fully resolved by Python
    run_cmd:   string                   // fully resolved
    unit_cmd:  string                   // with {match} placeholder
    port:      int                      // dynamically assigned by runner
    files:     map[string]string        // filepath → content (full workspace)
    tests:     []TestSpec               // ordered list, fully resolved
}

TestSpec {
    type:              string           // unit | stdout | http | tcp | script
    match:             string           // unit
    stdin:             string           // stdout
    expected_stdout:   string           // stdout
    expected_stdout_contains: string    // stdout
    request:           HTTPRequest      // http (method, path, headers, body)
    expected:          HTTPExpected     // http (status, body_contains, body_equals, headers)
    send:              string           // tcp (text)
    send_hex:          string           // tcp (hex bytes)
    expected:          string           // tcp (text)
    expected_hex:      string           // tcp (hex bytes)
    port:              int              // tcp (override)
    file_content:      string           // script (inlined by Python)
    manages_lifecycle: bool             // script
    timeout_ms:        int
}
```

### Internal Packages

```
internal/
  build/        Run build_cmd, stream output, report success/failure.
                Phase 1: exec.Command on host.
                Phase 2: docker run (swap here only).

  dispatch/     One Dispatcher per test type. Each takes a TestSpec + RunEnv,
                returns a channel of SSE Events.
    unit.go     Runs unit_cmd with {match} interpolated.
    stdout.go   Spawns binary, pipes stdin, captures/compares stdout.
    http.go     Sends HTTP request, validates status/body/headers.
    tcp.go      Sends raw bytes, validates response bytes.
    script.go   Writes inlined script to tmpdir, executes with env vars.

  lifecycle/    Binary process management. Spawn run_cmd, wait for port
                readiness (poll until bound or timeout), send SIGTERM/SIGKILL.
                Shared by http, tcp, and script (non-manages_lifecycle).
```

### Key Design Principles

1. **Python resolves everything.** The runner never reads course.yaml, never resolves file paths, never looks up language defaults. It receives a self-contained RunRequest.
2. **Script content is inlined.** Python reads script files from the courses volume and sends content in the request. Runner writes to tmpdir and executes.
3. **Dynamic port assignment.** Runner picks a free port, sets `$BUILDMANCER_PORT` in the process environment. Courses use this variable in `run_cmd` instead of hardcoded ports. In Phase 2 (Docker), each container has its own namespace so this is irrelevant, but the env var convention remains.
4. **Phase 1 → Phase 2 boundary.** Only `build/` and `lifecycle/` change when swapping from host exec to Docker. The `dispatch/` package stays identical.

### SSE Event Contract

```
event: build_start
data: {"phase": "build"}

event: build_output
data: {"line": "go build -o /tmp/program ."}

event: build_done
data: {"success": true}

event: build_failed
data: {"error": "compilation error", "output": "..."}

event: test_start
data: {"index": 0, "type": "unit", "match": "TestParseRequestLine"}

event: test_output
data: {"index": 0, "line": "=== RUN   TestParseRequestLine"}

event: test_done
data: {"index": 0, "passed": true}

event: test_failed
data: {"index": 0, "passed": false, "error": "expected 200, got 404"}

event: test_timeout
data: {"index": 0, "timeout_ms": 5000}

event: process_crashed
data: {"error": "binary exited with signal: SIGSEGV", "output": "..."}

event: system_error
data: {"error": "internal runner failure"}

event: run_complete
data: {"all_passed": true, "passed": 4, "failed": 0}
```

### Error Categories

| Event | Meaning | Student sees |
|---|---|---|
| `build_failed` | Code doesn't compile | Build errors with compiler output |
| `test_failed` | Test assertion didn't match | Which test, expected vs actual |
| `test_timeout` | Process didn't respond in time | "Timed out after Xms" |
| `process_crashed` | Binary exited/panicked before tests finished | Crash output / stack trace |
| `system_error` | Runner internal failure (not student's fault) | "Something went wrong, try again" |

---

## Run Request Lifecycle

```
Student clicks "Run Tests" on submodule X
        │
        ▼
[Next.js] POST /api/run/{course}/{submodule}
        │
        ▼
[FastAPI]
  1. Load course metadata + test specs for submodule X
  2. Read ALL working_files for (user_id, course_slug) from Postgres
  3. Resolve build_cmd, run_cmd, unit_cmd:
     per-submodule override → course-level override → language default
  4. Inline any script test file contents from courses volume
  5. Build RunRequest with fully resolved data
  6. POST RunRequest to Go Runner :9000/run
  7. Assign run_id, store SSE stream reference
  8. Return { "run_id": "..." } to browser
        │
        ▼
[Next.js] connects to GET /api/stream/{run_id}
        │
        ▼
[FastAPI] proxies SSE from Go Runner to browser
        │
        ▼
[Go Runner]
  1. Receive RunRequest
  2. Create tmpdir, materialize student files
  3. Assign dynamic port, set $BUILDMANCER_PORT
  4. Run build_cmd → stream build events
  5. If build fails → stream build_failed, done
  6. For tests needing a running binary:
     spawn run_cmd, wait for port readiness
  7. Dispatch each test in order by type
  8. Stream per-test events (start, output, done/failed/timeout)
  9. Kill spawned binary (SIGTERM → SIGKILL)
  10. Destroy tmpdir
  11. Stream run_complete
        │
        ▼
[FastAPI] receives run_complete
  - all_passed=true → insert progress row in Postgres
  - all_passed=false → no state change
        │
        ▼
[Next.js] renders events in real-time:
  - Build output panel
  - Per-test pass/fail indicators with output
  - Final summary (green/red)
```

---

## Submodule Progression Model

### States (derived, not stored)

- **Completed** — has a row in `progress` with `passed_at`
- **Current** — the first submodule (in course.yaml order) without a `progress` row
- **Locked** — everything after current

### Enrollment Seeding

When a student enrolls (`POST /api/enroll/{slug}`):

1. Create `enrollments` row with chosen difficulty and locale
2. Read ALL stub files from `courses/{slug}/{lang}/src/`
3. Insert each file into `working_files` as `(user_id, course_slug, filepath, content)`

The student starts with the full workspace pre-seeded. The frontend controls visibility (locked submodules are grayed out / inaccessible).

---

## Phase 1 Safeguards (No Docker)

Phase 1 runs student code directly on the host. Minimal protections:

- **Timeouts** — enforced per-test via `timeout_ms`. Go runner kills the process on expiry. Non-negotiable.
- **Process-level resource limits** — `ulimit` / `SysProcAttr` on spawned processes: cap memory (256MB), cap CPU time (30s), cap file writes.
- **No network isolation** — accepted risk for Phase 1 (small user base, dev VPS). Phase 2's `--network=none` fixes this.

---

## Authentication

Deferred to post-Phase 1. The platform will use Shark, a proprietary auth service, integrated via API calls when the Shark SDK has better DX.

**Phase 1:** All API endpoints operate against a hardcoded `user_id = "local"`. The schema uses TEXT for user_id so it's ready for real IDs without migration.

**Future:** Shark integration adds a `users` table, auth middleware on the API, and `user_id` becomes a real FK. Course loader, runner, and test execution are completely unaffected — auth lives entirely in the API layer.

---

## Deployment

### Phase 1: Single VPS

Docker Compose runs all services on one machine:
- FastAPI (:8000)
- Go Runner (:9000)
- Postgres (:5432)
- Next.js (:3000, dev server or built static)
- Courses directory mounted as a volume

### Future: Cloud Migration

Architecture is designed for clean separation:
- FastAPI and Go Runner communicate over HTTP/SSE — can be split to separate hosts by changing a URL
- Postgres can be swapped to a managed instance (RDS, Supabase, etc.) by changing the connection string
- Courses volume can be replaced by S3 sync, NFS mount, or any filesystem abstraction
- Go Runner + container pool can scale independently on dedicated compute
- No service has hardcoded assumptions about co-location

---

## Known Limitations and Future Work

1. **Course versioning** — courses update in place. No migration strategy for students mid-course when submodule structure changes. Acceptable for Phase 1 with a small user base.
2. **Concurrent run limiting** — no queue or rate limiting on run requests. A future version should limit concurrent runs per user and globally.
3. **Git flow (Phase 3)** — per-student repos, auto-commit on pass, portfolio generation. Not designed here; will be its own spec.
4. **Docker sandbox (Phase 2)** — container pool, resource limits, network isolation. Not designed here; will be its own spec.
5. **Discord bot integration** — student verification flow from FUNNEL.md. Separate system, interacts with Shark auth.
