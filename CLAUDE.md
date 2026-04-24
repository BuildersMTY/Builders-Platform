# BuildersPlatform — Claude Code Handoff

Monorepo. Frontend (Next.js), backend (FastAPI + Go runner), courses content repo (external).

**This file is the session-start orientation for Claude Code working anywhere in this repo.** Subdirs have their own `CLAUDE.md` / `AGENTS.md` — read those too when working in that subdir.

---

## Current state (2026-04-24)

Just finished a major planning round. v2 architecture + 9-phase backend plan committed to `docs/superpowers/`. Phase A (auth + users) is in-progress — only the migration file has been written. Everything else in Phase A is still TODO.

### What's real vs mock

| Area | State |
|---|---|
| Phase 1 backend (courses/enroll/files/run/stream/progress/resources/admin) | Complete, E2E tested |
| Go runner (5 dispatchers) | Complete |
| Frontend Phase 1 routes (`(marketing)`, `(platform)/courses/[courseId]`, `(platform)/workspace/[courseId]/[lang]`) | Working against real API |
| Frontend v2 routes (`/courses`, `/tracks`, `/practice`, `/builds`, `/workspace-v2`, `/dashboard`) | **Mock data only** — no backend yet |
| Backend v2 (auth, tracks, practice, builds, grading, dashboard, Modal) | Not implemented |
| Auth | `user_id = "local"` hardcoded everywhere |

---

## Where to look

**Plan docs (authoritative):**
- `docs/superpowers/specs/2026-04-23-v2-architecture.md` — full v2 arch (content schemas, data model, API, runner evolution, grading, dashboard)
- `docs/superpowers/plans/2026-04-23-v2-backend-phases.md` — 9-phase execution plan (A→I) with pytest e2e requirements per phase

**Older plans (superseded for scope, but Phase 1 decisions preserved):**
- `docs/superpowers/specs/2026-04-12-buildmancer-architecture-design.md`
- `docs/superpowers/plans/2026-04-12-buildmancer-phase1.md`
- `ARCHITECTURE.md`, `PLATFORM.md`, `ROADMAP.md`, `FUNNEL.md`, `AUTHORING.md`

**Code:**
- Backend: `backend/api/`, `backend/runner/`, `backend/migrations/`
- Frontend: `frontend/src/app/`, `frontend/src/components/`
- Courses content (external repo): `_courses/` placeholder here

---

## Key decisions baked into v2 plan

1. **Four content primitives:** Track (curated paths) → Course (Phase 1 structure kept) → Submodule (workspace session). Drill (standalone practice, date-keyed daily). Build (auto-generated portfolio artifact from completed courses).
2. **Auth:** paper auth (in-memory backed, swappable via `AuthProvider` protocol). Shark integration deferred. No OAuth providers.
3. **Entitlements:** free tier = 1 course claimed on first access + daily drill only. Paid tiers = everything.
4. **Runner:** `ExecutionBackend` protocol. `GoRunnerBackend` (host-exec, Docker later). `ModalBackend` (CPU/GPU/AI tracks). Python routes based on `course.yaml backend:` field. Go dispatchers untouched.
5. **Grading:** 70% correctness (hidden tests) + 20% efficiency (vs reference solution percentile) + 10% craft (LOC + cyclomatic). Letter grade A+→C, <70 = retry. Reference solutions per-language, benchmarked in CI → `reference_metrics` table.
6. **Dashboard:** denormalized `user_activity_summary` table. Synchronous after-commit hook keeps it in sync. Single-row read per request.
7. **Workspace-v2:** click-to-run (no auto-rerun for launch). Additive SSE events: `metrics`, `byte_diff`, `resource_unlock`, `concept_unlock`, `cancelled`.
8. **Testing:** pytest, e2e tests mandatory per phase, test org: `backend/tests/{unit,integration,e2e,bench}/`.

---

## Phase A — where to resume

**Done:**
- `backend/migrations/versions/002_users_and_sessions.py` — creates `users` + `sessions` tables, seeds `local` dev user

**TODO (subagent hit usage limit mid-phase):**
1. `backend/api/auth/` package:
   - `providers.py` — `AuthProvider` Protocol + `PaperAuthProvider` (30-day tokens, handle-only login, persists to sessions table)
   - `middleware.py` — `get_current_user` FastAPI dependency, 401 on missing/invalid
   - `router.py` — `POST /api/auth/register`, `/login`, `/logout`, `GET /api/auth/me`
2. `backend/api/entitlements.py` — `check_course_access`, `check_drill_access`, `check_track_access`
3. Gate existing routers (enroll, files, run, stream, progress, resources) via auth dependency, replace `user_id = "local"` with `user.id`
4. `POST /api/admin/upgrade-tier` admin endpoint
5. Register auth router + middleware in `backend/api/main.py`
6. Tests (mandatory):
   - `backend/tests/e2e/test_phase_a_auth.py` — full register → login → enroll → free-tier-block → admin upgrade → second enroll OK flow
   - `backend/tests/unit/test_paper_auth.py`
   - `backend/tests/integration/test_entitlements.py`
   - `backend/tests/unit/test_migration_002.py` (upgrade + downgrade)
7. Run: `pytest backend/tests/unit backend/tests/integration backend/tests/e2e -v` — must be green

**Exit criteria:** paper auth works end-to-end. Free tier blocked from second course. `SharkAuthProvider` stub class exists to prove swap seam.

After Phase A is green: Phases B + C + D can run in parallel (see plan doc dependency graph).

---

## Frontend state (2026-04-23)

New mock routes scaffolded. Components under `src/components/{builds,courses,practice,tracks,workspace-v2}/`. Data is hardcoded — `handle: "avery"` appears duplicated across all four apps. TopNav is copy-pasted 3x. Consolidation needed when wiring to real API (Phase G).

Old routes still present: `(platform)/courses/[courseId]`, `(platform)/workspace/[courseId]/[lang]`. These use real Phase 1 API. Do not delete until v2 replacement ships.

`frontend/src/new_components_to_migrate/` = design prototype staging (HTML + JSX). Migration essentially done; kept as design reference.

---

## Branding (from user memory)

Dark theme. Background `#131111`. Primary red `#ff0000`. White text. Style = refined (Apple/Anthropic) + startup energy. Launch market = Monterrey students via Discord bot. Landing is Spanish-first.

---

## Conventions to respect

- **Next.js:** repo uses a non-standard Next version. `frontend/AGENTS.md` says: "This is NOT the Next.js you know. Read relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices."
- **Backend:** see `backend/STRUCTURE.md`. Python resolves all run context; Go runner is stateless. Never let Go touch the courses volume.
- **Auth during Phase 1:** `user_id = "local"` is expected until Phase A completes.
- **Tests:** pytest for backend; e2e test per phase is mandatory per plan doc.
- **Commits:** direct to main has been the pattern. No PRs for internal work so far.
