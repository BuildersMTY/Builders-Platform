# BuildersPlatform v2 Architecture

**Date:** 2026-04-23
**Supersedes:** `specs/2026-04-12-buildmancer-architecture-design.md` (scope-expanded, Phase 1 decisions preserved)
**Status:** Draft for implementation

---

## 0. Change summary

Phase 1 scope was a Codecrafters-style clone with a single content type (`course`). v2 expands to four content primitives (`course`, `track`, `drill`, `build`), introduces paper auth with an entitlement tier, grades submissions with hidden tests, aggregates a personalized dashboard, and prepares the execution layer for a Modal backend that runs ML/GPU workloads alongside the Phase 1 Go runner.

**Phase 1 components that survive unchanged:** FastAPI service structure, Go runner, SSE contract, the five dispatchers (unit/stdout/http/tcp/script), the three existing DB tables, `course.yaml` schema (v2 adds fields, breaks none), single-VPS Docker Compose dev harness, Alembic migrations.

**Phase 1 components that gain additive fields:** `course.yaml` (backend, tiers, hidden tests, reference solutions, concepts), RunRequest (test_set, run_id), final SSE event (metrics).

**Phase 1 components replaced:** `user_id = "local"` placeholder (replaced by real `users` table with paper auth swappable for Shark).

---

## 1. Product scope

Four user-facing surfaces, four content primitives:

| Surface | Primitive | Purpose |
|---|---|---|
| `/tracks` | Track | Curated learning paths leading to certificates |
| `/courses` | Course | Structured multi-submodule projects |
| `/practice` | Drill | Standalone real-world implementation challenges (parsers, concurrent handlers, protocol fragments) |
| `/builds` | Build | Auto-generated portfolio artifacts from completed courses |

Workspace-v2 is the shared in-browser execution surface for courses and drills.

---

## 2. Content hierarchy and YAML schemas

```
Track (skills, certificate, course sequence, language enforcement per course)
  └── references Course[] (by slug)
      └── Module[]
          └── Submodule[] (one task, one test set, one workspace session)
              └── on pass → writes Progress row
                  └── on course complete → creates Build

Drill (standalone, category + difficulty, optional daily release)
  └── one test set, one workspace session, no progression state

Build (derived artifact, not authored content)
  └── grade, pass_rate, highlight_code, readme, skills, git hash
```

### 2.1 `course.yaml` v2 additions

Phase 1 schema preserved. New optional fields:

```yaml
slug: http-server
languages: [go, rust, python]
modules: [...]                     # unchanged

# NEW — execution
backend: host-exec                 # host-exec | docker | modal-cpu | modal-gpu-t4 | modal-gpu-h100
resource_tier: standard            # standard | gpu-t4 | gpu-h100
warm_container: false              # Modal keep_warm for slow cold-start courses

# NEW — grading anchors
reference_solutions:
  go: reference/http-server.go
  rust: reference/http-server.rs

# NEW — concept graph for workspace-v2
concepts:
  - id: tcp-handshake
    title: "TCP three-way handshake"
    unlocked_by: parse-request
  - id: http-parsing
    title: "HTTP request parsing"
    unlocked_by: parse-request

# NEW — submodule-level fields
submodules:
  - id: parse-request
    difficulty: 1.0                # grading weight
    visible_tests: [...]           # shown during workspace session
    hidden_tests: [...]            # run on submit, grading only
    resources: [...]               # unchanged
```

Missing `backend` defaults to `host-exec`. Missing `hidden_tests` means visible tests count for grading too (backwards compatible with Phase 1 courses).

### 2.2 `track.yaml` (new)

```yaml
slug: systems
title: "Systems"
tagline: "Build the primitives everything else depends on"
blurb: "..."
skills: [syscalls, memory, concurrency, ipc]
certificate:
  title: "Certified Systems Builder"
  required_courses: 4
courses:
  - slug: http-server
    language_enforcement: null       # null = user picks from course languages
  - slug: shell
    language_enforcement: null
  - slug: allocator
    language_enforcement: rust       # track forces Rust even if allocator exists in C
  - slug: tcp
    language_enforcement: null
order: explicit                       # explicit | any
```

`language_enforcement` covers the cross-language case: Systems track can pull `http-server` in any language, but Languages > OCaml-heavy track can force Rust for the allocator course specifically.

### 2.3 `drill.yaml` (new)

Single-file content, lighter than `course.yaml`:

```yaml
slug: pratt-parser
title: "Pratt Parser for Expressions"
category: languages                   # languages | networking | systems | databases | concurrency | bits | protocols | state-machines
difficulty: hard                      # easy | medium | hard
est_minutes: 45
languages: [go, rust]
daily_release: 2026-05-07             # optional; if set, appears as daily drill on that date

prompt: |
  Implement a Pratt parser that handles...

stubs:
  go: stubs/pratt.go
  rust: stubs/pratt.rs

reference_solutions:
  go: reference/pratt.go
  rust: reference/pratt.rs

visible_tests: [...]
hidden_tests: [...]
skills: [parsing, recursion, operator-precedence]
```

### 2.4 Build (derived, not authored)

No YAML. Generated server-side when a user submits a completed course:

```python
Build(
    user_id=user.id,
    slug=f"{course.slug}-{user.handle}-{ship_date}",
    course_slug=course.slug,
    language=language,
    shipped_on=utcnow(),
    lines=measure_loc(workspace_files),
    tests=count_tests(course),
    hash=git_commit_sha,                     # from a synthetic git repo per enrollment
    duration_hours=sum_session_time(user, course),
    blurb=course.blurb,
    grade=compute_course_grade(user, course, language),
    pass_rate=hidden_tests_passed / hidden_tests_total,
    highlight_code=extract_hero_snippet(workspace_files, course.highlight_hint),
    skills=course.skills,
    readme=render_readme_template(course, workspace_files, grade),
    featured=False,
)
```

---

## 3. Data model

### 3.1 Existing tables (Phase 1, not altered)

`enrollments`, `working_files`, `progress` kept as-is. `user_id TEXT` stays text; new `users` table uses TEXT primary key so no FK backfill needed.

### 3.2 New tables (migration 002+)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                      -- handle, e.g. "avery"
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,                        -- nullable for paper auth
  tier TEXT NOT NULL DEFAULT 'free',        -- free | builder | student
  free_course_slug TEXT,                    -- which course they claimed as their free slot
  free_course_lang TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE track_enrollments (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  track_slug TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_slug)
);

CREATE TABLE drill_attempts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  drill_slug TEXT NOT NULL,
  language TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  passed BOOLEAN NOT NULL DEFAULT false,
  runtime_ms INT,
  peak_mem_kb INT
);
CREATE INDEX drill_attempts_user_drill ON drill_attempts(user_id, drill_slug);

CREATE TABLE drill_streaks (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_drill_date DATE
);

CREATE TABLE builds (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL UNIQUE,
  course_slug TEXT NOT NULL,
  language TEXT NOT NULL,
  shipped_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  lines INT NOT NULL,
  tests INT NOT NULL,
  hash TEXT NOT NULL,
  duration_hours NUMERIC(6,2),
  blurb TEXT,
  grade TEXT NOT NULL,                      -- A+, A, A-, B+, ...
  pass_rate NUMERIC(5,2) NOT NULL,
  highlight_code JSONB NOT NULL,            -- [{ t: "...", k: "kw|str|num|def" }]
  skills TEXT[] NOT NULL,
  readme TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX builds_user_shipped ON builds(user_id, shipped_on DESC);

CREATE TABLE activity_events (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,                       -- test_pass | test_fail | sub_done | module_done | resource | build | drill
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  course_slug TEXT,
  language TEXT,
  submodule_id TEXT,
  drill_slug TEXT,
  build_id INT REFERENCES builds(id),
  payload JSONB
);
CREATE INDEX activity_events_user_time ON activity_events(user_id, occurred_at DESC);

CREATE TABLE user_activity_summary (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  active_days INT NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  enrolled_count INT NOT NULL DEFAULT 0,
  completed_count INT NOT NULL DEFAULT 0,
  builds_count INT NOT NULL DEFAULT 0,
  drills_solved INT NOT NULL DEFAULT 0,
  current_drill_streak INT NOT NULL DEFAULT 0,
  heatmap JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { "YYYY-MM-DD": count }
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE submodule_scores (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_slug TEXT NOT NULL,
  language TEXT NOT NULL,
  submodule_id TEXT NOT NULL,
  correctness NUMERIC(5,2) NOT NULL,
  efficiency NUMERIC(5,2) NOT NULL,
  craft NUMERIC(5,2) NOT NULL,
  composite NUMERIC(5,2) NOT NULL,
  letter TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug, language, submodule_id)
);

CREATE TABLE reference_metrics (
  id SERIAL PRIMARY KEY,
  content_kind TEXT NOT NULL,               -- course-submodule | drill
  content_key TEXT NOT NULL,                -- "{course_slug}:{submodule_id}" | drill_slug
  language TEXT NOT NULL,
  runtime_ms INT NOT NULL,
  peak_mem_kb INT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_kind, content_key, language)
);

CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  code TEXT NOT NULL,                       -- precision | one-shot | terse | marathon | polyglot | ...
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  context JSONB,
  UNIQUE(user_id, code)
);
```

---

## 4. Auth and entitlements

### 4.1 Paper auth (in-memory-backed; swappable interface)

Provider interface:

```python
class AuthProvider(Protocol):
    async def register(self, handle: str, display: str, email: str | None) -> User: ...
    async def login(self, handle: str) -> str:             # returns session token
    async def verify(self, token: str) -> User | None: ...
    async def logout(self, token: str) -> None: ...
```

`PaperAuthProvider` persists users + sessions in Postgres, issues 30-day opaque tokens, uses handle-only login (no password, no OAuth). Dev-only primitive. Swap target: `SharkAuthProvider` when Shark SDK DX is ready. Same interface, zero route-handler changes at swap time.

Middleware extracts `Authorization: Bearer <token>` on every request, attaches `request.state.user` or 401s on protected routes.

### 4.2 Entitlements

```python
def check_course_access(user: User, course_slug: str, language: str) -> bool:
    if user.tier in ("builder", "student"):
        return True
    # free tier: one course only, claimed on first access
    if user.free_course_slug is None:
        claim_free_course(user, course_slug, language)
        return True
    return (user.free_course_slug == course_slug
            and user.free_course_lang == language)
```

Gate applied in: enroll, run tests, save file, submit.

Free-tier access matrix:

| Content | Free tier access |
|---|---|
| One course (claimed on first access) | yes |
| Daily drill | yes |
| Non-daily drills | no |
| Tracks | browse yes, enroll no |
| Builds | view own only (they can only generate one) |

---

## 5. API surface

All paths prefixed `/api`. All require `Authorization: Bearer <token>` except auth endpoints.

### 5.1 Auth
- `POST /auth/register` — { handle, display, email? } → { token, user }
- `POST /auth/login` — { handle } → { token }
- `POST /auth/logout` — 204
- `GET /auth/me` → User

### 5.2 Tracks
- `GET /tracks` — all tracks with meta + enrollment state
- `GET /tracks/:slug` — track detail + course list
- `GET /tracks/:slug/progress` — user progress toward certificate
- `POST /tracks/:slug/enroll` — 204

### 5.3 Courses (existing endpoints retained, additions below)
- `GET /courses/:slug/:lang/score` — live grade breakdown (submodule-level)
- `POST /courses/:slug/:lang/submit` — triggers hidden test run across all submodules, computes course grade, creates Build, returns Build

### 5.4 Practice
- `GET /practice/daily` — today's drill (same for all users, date-keyed)
- `GET /practice/drills` — full catalog, with solved state per current user
- `GET /practice/drills/:slug` — detail + stub code
- `POST /practice/drills/:slug/:lang/run` — SSE stream
- `GET /practice/streak` — calendar array (last 30 days) + stats
- `GET /practice/leaderboard/weekly` — top N for current week

### 5.5 Builds
- `GET /builds` — current user's portfolio
- `GET /builds/:slug` — single build detail
- `POST /builds/:slug/share` — generates share link (stub: returns URL; share page is a future milestone)

Build creation is internal — no POST /builds endpoint for users.

### 5.6 Dashboard
- `GET /dashboard` — aggregate view (active session, enrolled courses, activity stream, heatmap, recent builds, milestone tracker)

### 5.7 Admin (existing + new)
- `POST /admin/reload-courses` (existing)
- `POST /admin/reload-tracks` (new)
- `POST /admin/reload-drills` (new)
- `POST /admin/upgrade-tier` — { user_id, tier } (dev-only tier override until payment ships)

### 5.8 Runs
- `POST /runs/:run_id/cancel` — abort an in-flight run (workspace-v2 friendly)

---

## 6. Runner evolution

### 6.1 Backend abstraction

```python
class ExecutionBackend(Protocol):
    async def run(self, req: RunRequest) -> AsyncIterator[SSEEvent]: ...

class GoRunnerBackend:         # Phase 1 host-exec and Phase 2 Docker
    mode: Literal["host-exec", "docker"]
    ...

class ModalBackend:            # new — ML / GPU / AI agents workloads
    tier: Literal["cpu", "gpu-t4", "gpu-h100"]
    ...

def select_backend(course: Course | Drill, user: User) -> ExecutionBackend:
    match course.backend:
        case "host-exec":     return go_runner_host
        case "docker":        return go_runner_docker
        case b if b.startswith("modal"): return modal_backends[b]
```

Entitlement hook: free tier restricted to `host-exec`/`docker` backends. Modal-tier courses blocked for free tier.

### 6.2 Go runner deltas (additive)

- Final SSE event now carries `metrics: { runtime_ms, peak_mem_kb }`.
- `RunRequest` gains `test_set: "visible" | "hidden"` (default `visible` for backwards compatibility).
- `RunRequest` gains optional `run_id` for cancellation correlation.
- `dispatch/` package untouched. Metrics captured at `lifecycle/` layer.

### 6.3 Modal backend (new)

- `backend/modal/` — Modal app definition
- Per-language, per-tier Modal functions (image specs in `backend/modal/images/<lang>.py`)
- Modal log stream → translation layer → SSE event shape identical to Go runner
- Secrets: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` injected as Modal secrets for AI Agents track
- `keep_warm=1` for courses where `warm_container: true` (ML inference courses with multi-GB model loads)
- Cancellation via Modal `.cancel()` call

### 6.4 SSE event types

Phase 1: `stdout`, `stderr`, `test_result`, `done`.
v2 additions: `metrics`, `byte_diff`, `resource_unlock`, `concept_unlock`, `cancelled`.

### 6.5 Cancellation

`POST /runs/:run_id/cancel` → Python marks run as cancelled in backend → Go runner receives SIGTERM on the process, or Modal call receives `.cancel()`. SSE emits final `cancelled` event, closes.

### 6.6 Drill runner

No new backend. Lighter Python wrapper around `GoRunnerBackend` (or `ModalBackend` for an ML-themed drill). Skips submodule progression, skips enrollment checks. Writes a `drill_attempts` row on every submission regardless of pass/fail.

---

## 7. Grading

### 7.1 Composite per submodule

```
correctness = hidden_tests_passed / hidden_tests_total * 100
efficiency  = percentile_vs_reference(user_runtime_ms, user_peak_mem_kb,
                                      ref_runtime_ms, ref_peak_mem_kb) * 100
craft       = clamp_0_100(loc_ratio_score + complexity_score)
composite   = 0.70 * correctness + 0.20 * efficiency + 0.10 * craft
```

Efficiency percentile: reference solution is the anchor at the 70th percentile. User runs better than reference approach the 95th percentile; worse slide toward the 30th. Extreme outliers (10x slower, 10x more memory) bottom at 0.

LOC ratio score:
- Student LOC / reference LOC in [0.5, 1.5] → 100
- Ratio > 1.5 (bloat) → linearly drops to 40 at 3.0x
- Ratio < 0.5 (golf, illegible one-liners) → drops to 60 at 0.2x

Complexity score from cyclomatic complexity per function (radon/gocyclo/clippy metric). Baseline: reference complexity. Student within 1.5x = 100; above penalizes linearly.

### 7.2 Reference solutions

Every course submodule and every drill ships `reference_solutions` per language. A CI job (`scripts/bench_references.py`) runs each reference on the clean production backend, captures runtime_ms and peak_mem_kb, writes to `reference_metrics`. Re-benched whenever a reference file changes. Student runs compared against the same-backend reference (host-exec student vs host-exec reference; Modal student vs Modal reference).

### 7.3 Letter mapping

```
97–100  A+      93–96  A      90–92  A-
87–89   B+      83–86  B      80–82  B-
75–79   C+      70–74  C      < 70   retry (no grade recorded)
```

### 7.4 Course-level grade

Weighted average of submodule composites, weighted by submodule `difficulty` (from `course.yaml`, default 1.0). Letter applied to the weighted average. Written to `builds.grade` at submit time. Per-submodule scores cached in `submodule_scores` for dashboard breakdown views.

### 7.5 Badges (separate from grade)

Evaluated on every `activity_events` insert by a background rule engine. Data-driven rules:

| Badge code | Trigger |
|---|---|
| `precision` | Five submodules at A+ |
| `one-shot` | Ten submodules passed on first test run |
| `terse` | Five submodules at < 50% LOC of reference |
| `marathon` | Seven-day drill streak |
| `polyglot` | Shipped builds in three distinct languages |
| `nightowl` | Ten submodules passed between 00:00 and 04:00 local |
| `first-ship` | First build created |

---

## 8. Dashboard aggregation

`user_activity_summary` is the sole read source for `GET /dashboard`. Updated on every `activity_events` insert via Python after-commit hook (not a DB trigger — keeps logic in app code, testable).

Read path is a single keyed row lookup: no joins, no aggregations at request time. Acceptable staleness: seconds (hook runs synchronously inside the same request that wrote the event).

Heatmap stored as JSONB map `{YYYY-MM-DD: count}`, trimmed to the last 365 days by a nightly job. Heatmap is the one hot-path JSONB update; write amplification is negligible at current scale (< 1 KB per user).

---

## 9. Workspace-v2 semantics

Same runner, richer UX surface:

- Streaming `byte_diff` events for string-compare test dispatchers — frontend renders expected-vs-actual inline diff instead of full stdout dump
- Lazy resource tabs via `GET /courses/:slug/resources/:id` (resource metadata ships with submodule, content fetched on click)
- Concept graph derived from `course.yaml concepts:` field — emitted as `concept_unlock` events during runs
- Command palette is pure frontend — no new endpoint

**Execution model decision: click-to-run only for v2 launch.** Auto-rerun-on-save shipped as a follow-up phase; requires debounce + `run_id` cancellation of in-flight runs, and would multiply Modal cost on ML tracks if a user types quickly. Workspace-v2 UI stays identical to Phase 1's run-button model.

---

## 10. Cross-content-type integration points

- Enrolling in a track auto-enrolls user in the first course of that track (with track-enforced language if specified).
- Completing a course creates a Build; Build creation emits a `build` activity event; dashboard heatmap + builds_count update.
- Drill streak resets if the user misses a calendar day in their timezone; lazy-checked on next drill submission.
- Certificate progress is computed on-demand as `builds.filter(course_slug in track.courses) / track.required_courses`.

---

## 11. Open questions (not blocking implementation)

1. **Course versioning:** tracks depend on specific course shapes. If a course adds a submodule, does that break track progress for users mid-track? Proposal: snapshot course version hash in `track_enrollments` row; flag users on outdated versions with a migration prompt. Deferred until Phase C ships.
2. **Certificate issuance:** PDF, on-chain, LinkedIn integration? Out of scope for v2 backend; frontend stubs only.
3. **Drill leaderboard fairness:** regional reset, anti-cheat, rate limits? Flag during Phase D implementation.
4. **Modal cost ceiling:** per-user monthly GPU budget, enforcement mechanism, graceful degradation when hit. Must resolve before Phase H ships to production.
5. **Community-submitted drills:** moderation, review queue, revenue share. Out of scope for v2.
6. **Payment integration:** tier upgrade flow (Stripe/MercadoPago). `users.tier` exists; upgrade mechanics TBD. Admin endpoint covers dev use.

---

## 12. Phased rollout

See companion: `plans/2026-04-23-v2-backend-phases.md`.

Summary:

```
A  auth + users + entitlements                 (blocks everything identity-dependent)
B  runner abstraction + metrics + hidden tests (blocks grading and Modal)
C  tracks catalog (read-only)                  (parallel after A)
D  practice drills                             (parallel after A + B)
E  grading + builds auto-creation              (after B)
F  dashboard aggregation                       (after A; event hooks fill in from C–E)
G  workspace-v2 SSE extensions + frontend      (after B)
H  Modal backend                               (after B; independent of E–G)
I  Docker sandbox                              (after B; any time)
```
