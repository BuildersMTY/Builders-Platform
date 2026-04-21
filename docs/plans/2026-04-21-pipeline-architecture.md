# Buildmancer — Pipeline, Runner, and Git-Flow Architecture Plan

**Date:** 2026-04-21
**Branch:** main
**Author:** plan-eng-review synthesis
**Status:** REVISED with UX-reviewer inputs (workspace + course/contributor/git)
**Horizon:** 6-week GTM window (matches approved design doc)

Related docs:
- `.gstack/projects/BuildersMTY-Builders-Platform/raul-main-design-20260421-095545.md` (strategy)
- `COURSES.md`, `AUTHORING.md`, `PLATFORM.md`, `ROADMAP.md` (contracts)
- `FUNNEL.md` (auth / student verification)

---

## 1. Goals and Non-Goals

### Goals

1. **Ship a sandboxed execution pipeline** safe enough to expose to strangers by design-doc Phase-2 beta (week 3, 5-10 LATAM strangers).
2. **Introduce an executor abstraction** so Docker and Modal are drop-ins, not rewrites.
3. **Deliver the full git flow** promised in `PLATFORM.md`: per-student repo, commit on every pass, push to GitHub with a proud-of-it README on completion. Customizable where it matters (identity, repo name, visibility, final polish), opinionated where it doesn't (commit cadence, message shape).
4. **Fix the three latent bugs** blocking non-Go courses, re-runs, and disconnect-resilient progress.
5. **Ship a contributor validation CLI** so authoring a course doesn't require pushing to CI to see if YAML is correct.
6. **Keep the pipeline boring.** One YAML model, five test types, one executor interface, one API surface. No new abstractions unless they unlock nanoGPT or kill a whole class of bug.
7. **Course structure additions — not rewrite — to support ML/GPU courses.** Extend YAML, don't replace it.

### Non-Goals (this plan)

- Stripe billing integration (separate plan).
- Multi-user auth hardening (`default_user_id="local"` stays until Stripe lands).
- Certificate generation (post-Phase 3).
- Warm container pool (defer until measured cold-start pain).
- Bidirectional git sync (students pushing from laptop back into web editor). Out of scope for v1.
- Course versioning / migrations for existing students.
- i18n for languages beyond `es` / `en`.

---

## 2. Guiding Principles

1. **Boring by default.** Docker, not bespoke sandbox. FastAPI + Go, not a rewrite. Postgres, not Redis-for-state. Three innovation tokens go to: executor interface, Modal integration, stub/solution single-source tooling. Everything else stays proven.
2. **One change type per commit.** Refactor before behavior change. Make the change easy, then make the easy change.
3. **Own the failure mode.** Every new code path names one realistic prod failure in its design note and states where the test lives.
4. **Beginner rails, not beginner ceilings.** The third-semester CS student at UANL should sail through. The senior should not be patronized. Difficulty is a resource filter, not a code fork.
5. **Customization where it's the user's.** Student names their repo, sets visibility, keeps or edits the auto-README. Commit messages default to a deterministic shape but expose a template.
6. **No silent fallbacks.** If a course YAML is invalid, log and skip. If a runner executor is unavailable, fail loud. If a student hits a rate limit, say so.

---

## 3. Current State — Verified

Delivered:

- FastAPI course loader with Pydantic models, locale overlay, resource file validation.
- Postgres schema: `enrollments`, `working_files`, `progress` via SQLModel.
- REST endpoints: `/api/courses`, `/api/enroll`, `/api/files`, `/api/progress`, `/api/resources`, `/api/admin`.
- Run handshake: `POST /api/run/{slug}/{lang}/{sub}` stages a `pending_runs` dict, `GET /api/stream/{run_id}` consumes and proxies SSE.
- Go runner at `:9000` with `/run` SSE endpoint, five dispatchers (unit, stdout, http, tcp, script), process lifecycle with graceful SIGTERM + hard kill fallback, port readiness wait, script inlining.
- Next.js workspace UI.

Not delivered (referenced by docs as existing or "shipped"):

- Docker sandbox around student code. Runner shells out on host with full parent env.
- Executor abstraction. All five dispatchers call `exec.CommandContext` directly.
- Git flow: per-student bare repo, commit-on-pass, final GitHub push.
- Modal integration.
- CI that validates course PRs.
- `buildmancer validate` CLI for local authoring.
- Stub/solution drift protection.

Known bugs identified during review:

- **unit_cmd propagation broken.** `run.py` resolves `unit_cmd` from language defaults but Go's `UnitDispatcher` never receives it, always falls back to `go test ...` regardless of language. All pytest/cargo/vitest courses would fail.
- **Progress row crashes on re-run.** `UniqueConstraint(user_id, course_slug, language, submodule_id)` + naked `db.add(Progress(...))` = IntegrityError on resubmit.
- **Progress writes only when SSE stream is consumed client-side.** Tab close before stream ends = lost progress.
- **`bufio.Scanner` default 64KB.** A single long build-output line silently truncates.
- **`pending_runs` in-memory dict.** Breaks with more than one API worker. Hidden because Uvicorn default is single-worker.
- **Script-test `file_content` inlined in JSON** works but grows large with more scripts; courses_path is already mounted read-only into the runner, so inlining is unnecessary once Docker lands.

---

## 4. Target Architecture

```
 ┌────────┐    SSE     ┌───────────────┐   SSE   ┌──────────────────┐
 │ browser│◀──────────▶│ FastAPI /api  │◀───────▶│ Go runner :9000  │
 └────────┘            │  streaming    │  HTTP   │  handler.HandleRun│
                       │  single POST  │         │       │           │
                       └────┬──────────┘         │       ▼           │
                            │                    │  Executor iface   │
                   Postgres │                    │  ├ LocalExec      │
                            │                    │  ├ DockerExec     │
                     ┌──────▼──────┐             │  └ ModalExec      │
                     │ enrollments │             │       │           │
                     │ working_files│            │       ▼           │
                     │ progress    │             │  Dispatchers      │
                     │ git_repos   │  (new)      │  (unit stdout     │
                     └──────┬──────┘             │   http tcp script │
                            │                    │   eval [new])     │
                            ▼                    └──────┬────────────┘
                      Per-student bare repos            │
                      ./repos/{user_id}/{slug}-{lang}.git
                            │
                            │  on course completion
                            ▼
                      GitHub push via student OAuth
                      (student-chosen repo name, visibility, README)
```

Key invariants:

- **One executor per run, chosen by `course.meta.runner`.** Scheme prefix (`local://`, `docker://buildersmty/runner-go:latest`, `modal://gpu-a10g`) decides. No runtime hopping.
- **Dispatchers talk to the executor, not to the OS.** `env.Exec(...)`, `env.Spawn(...)`, never `exec.CommandContext`.
- **Runner is stateless.** Every `/run` creates a fresh Env, destroys it at exit.
- **Progress is written server-side** immediately on `run_complete` with `all_passed=true`, regardless of client connection state.
- **Commits happen on the backend**, not the client. The student sees them in their repo view after the fact.

---

## 5. Execution Plan — Phases

Phases mirror design-doc GTM weeks. Each phase has an ordered task list with owner (CC), estimated effort, and dependencies.

### Phase 0 — Stability Fixes (bundle into first PR)

Goal: close the three bugs that would embarrass us on the first Phase-1 smoke test. These are small, independent, and land together. Ship before any further feature work.

| # | Task | Effort (CC) | File |
|---|------|-------------|------|
| 0.1 | Fix `unit_cmd` propagation. Inject `BUILDMANCER_UNIT_CMD` into env list in `handler.HandleRun` before calling dispatchers. Add regression test: pytest course triggers `pytest -k ...`, not `go test`. | 20 min | `backend/runner/internal/handler/run.go`, `unit_test.go` |
| 0.2 | Progress INSERT-OR-IGNORE. Use `on_conflict_do_nothing` in `stream.py`. Regression test: POST same passing submodule twice, single row. | 20 min | `backend/api/routers/stream.py`, `tests/api/test_run.py` |
| 0.3 | Scanner buffer bump to 1 MB across `build.go`, `unit.go`, `stdout.go`, `script.go`. Regression test: simulate long build output. | 15 min | four `.go` files |
| 0.4 | Merge run+stream into single SSE POST endpoint. `POST /api/run/{slug}/{lang}/{sub}` returns `EventSourceResponse` directly, drops `pending_runs`. Progress committed server-side on `run_complete`. | 1.5 h | `backend/api/routers/run.py`, `stream.py` (delete), `main.py`, frontend SSE client. |
| 0.5 | Per-user concurrent-run cap (semaphore, max 1 active run per user_id, return 429 otherwise). | 30 min | `backend/api/routers/run.py` |

**Phase 0 ships as one PR.** No new features, just correctness + resilience.

### Phase 1 — Executor Abstraction (no behavior change)

Goal: prepare the runner for Docker + Modal without flipping the default. LocalExec is still what runs. Dispatchers stop touching `os/exec`.

| # | Task | Effort (CC) | Notes |
|---|------|-------------|-------|
| 1.1 | Define `Executor` interface in `backend/runner/internal/executor/executor.go`: `Prepare`, `Build`, `Spawn`, `Exec`, `Cleanup`. Include `Env` struct with workspace, env vars, port. | 45 min | Types only, no implementation. |
| 1.2 | Implement `LocalExec` matching current behavior. Wraps `exec.CommandContext("bash", "-c", ...)`, tmpdir-based workspace, current env inheritance. | 1 h | |
| 1.3 | Refactor each dispatcher to call `env.Spawn` / `env.Exec` instead of `exec.Command`. Keep signatures identical, keep SSE events identical. One commit per dispatcher so diffs stay tiny. | 2 h | 5 dispatchers |
| 1.4 | `handler.HandleRun` picks executor from runner-URL scheme (`local://` default, scheme parsed from `req.Runner`). Falls back to LocalExec with warning if unknown. | 30 min | |
| 1.5 | Update runner tests to stub Executor, not OS. Adds an `ExecutorMock` used by handler_test. | 1 h | |

**Phase 1 ships after Phase 0 merges.** Zero functional change — passes old tests plus new Executor interface tests.

### Phase 2 — Sandbox via DockerExec

Goal: Phase-1 smoke test (5 friends free) runs inside Docker. Strangers beta (Phase 2 of design doc) requires this merged.

| # | Task | Effort (CC) | Notes |
|---|------|-------------|-------|
| 2.1 | Build per-language runner images in `backend/runner/images/{go,c,python,rust,javascript}/Dockerfile`. Each has toolchain + bash + curl + nc. Publish to `buildersmty/runner-{lang}:latest`. | 2 h | GitHub Actions build-and-push workflow |
| 2.2 | Implement `DockerExec`. `Prepare` = `docker create` with `--memory=256m --cpus=0.5 --network=none --read-only --tmpfs /workspace:rw,exec,size=128m --init`. `Exec` = `docker exec`. `Spawn` = `docker exec -d` with port-forward via `-p`. `Cleanup` = `docker kill && docker rm`. | 3 h | Windows dev path uses Docker Desktop; runner container itself runs on host so docker-in-docker is avoided by mounting host Docker socket read-only. Document trade-off. |
| 2.3 | `meta.runner` in course.yaml becomes the image tag. Already exists in schema. Add scheme parsing — `docker://buildersmty/runner-go:latest` default. | 30 min | |
| 2.4 | Resource-limit regression tests: OOM, forkbomb, egress-to-internet. All should be contained. Each as a `script` test run in a throwaway course, asserting specific failure. | 2 h | Security smoke suite |
| 2.5 | Flip default on dev + prod. Keep `local://` as an explicit opt-in for fast local iteration when developing a course. | 15 min | Document in AUTHORING.md |
| 2.6 | Warm container policy decision (keep NONE for v1 — measure cold start with Go/Python first; only add a pool if the median run exceeds 2 s or the user complains). | — | Defer |

**Phase 2 ships before Phase-1 smoke-test (week 2 of GTM).**

### Phase 3 — Git Flow with Customization

Goal: `PLATFORM.md` promise delivered. Student ends the course with a repo they'd put on their CV.

#### 3.1 Repo lifecycle

On `POST /api/enroll`:
- Initialize a bare repo at `./repos/{user_id}/{slug}-{lang}.git`.
- Seed from `_courses/{slug}/{lang}/src/` as the initial commit with message `Initial stubs — {course title}`.
- Create branch `main` (not `student/*` — this repo is the student's, eventually pushed as their own).
- Persist metadata in a new `git_repos` table: `(user_id, course_slug, language, repo_path, github_url, github_repo_name, github_visibility, student_commit_name, student_commit_email, created_at)`.

On `run_complete` with `all_passed=true`:
- Read `working_files` for the enrollment.
- Apply to a fresh worktree in `./repos/{user_id}/{slug}-{lang}.worktree`.
- Commit with default message template: `pass({module_id}): {submodule_title}` — a Conventional-Commits style that beginners read as normal English. Override at student level via `student_commit_template`.
- Author fields: `student_commit_name` (default `Buildmancer Student`) and `student_commit_email` (default `student@buildmancer.local`). Customizable per enrollment in Settings.
- On failure: no commit. Just a progress row.

On final submodule pass (all progress rows present):
- Generate a README.md (see 3.3).
- Commit with message `ship: complete {course title}`.
- Tag `v1.0-{difficulty}`.
- Expose a "Push to GitHub" CTA in the UI.

#### 3.2 GitHub push

- Student connects GitHub in Settings (OAuth, scope `repo`).
- On click "Push to GitHub":
  - Ask: repo name (default `{slug}-{lang}`), visibility (default public), description (pre-filled with course title + Buildmancer link).
  - Create the repo via GitHub API.
  - Push all branches and tags.
  - Update `git_repos.github_url` and `github_repo_name`.
  - Return the GitHub link. Show a "Copy for LinkedIn" action.

#### 3.3 Repo-as-portfolio — auto-generated README (P0, underspecified in ROADMAP)

Agent-B calls this out as the single most underrated feature: every student repo with a "Built on Buildmancer" badge + backlink is organic distribution. Treat as top priority, not polish.

Content driven by `meta.portfolio` block (Section 6.1). Template at `backend/api/git/templates/README.md.j2`:

The README is the CV artifact. Quality matters. Template at `backend/api/git/templates/README.md.j2`:

```
# {course.title} — {language}

Completed on Buildmancer: https://buildmancer.com/c/{slug}

## What I built

{course.description}

{badges: language, LOC, tier, "Built on Buildmancer"}

## Architecture

{meta.portfolio.architecture_md content, verbatim, with ASCII diagrams}

## Modules

{for each module}
### {module.title}
{meta.portfolio.module_summaries[module.id] OR module.description}

Submodules completed:
{for each submodule}
- `{module.id}/{submodule.id}` — {submodule.title}  (passed {passed_at})
{end}
{end}

## Stats

- Time to completion: {duration}
- Difficulty: {difficulty}
- Total runs: {run_count}
- Lines written: {diff_stats}

## Stack

- Language: {language}
- Difficulty: {difficulty}

## Run locally

{language-specific build+run snippet}

## Credits

Built through Buildmancer's {course.title} course.
Course content: BuildersMTY, CC BY-NC 4.0.
```

The student can edit the README in the graduation modal (9.4) before pushing.

Also generated at completion:
- `ARCHITECTURE.md` from `meta.portfolio.architecture_md` (author-provided, copied verbatim)
- `LICENSE` from `meta.portfolio.license` (default MIT; inherited by student repo)
- CV snippet (rendered in UI only, not committed): 3-line markdown block the student pastes into LinkedIn

**Commit author identity:** the student's GitHub OAuth `name <email>`. Committer (metadata, separate from author): `Buildmancer <noreply@buildmancer.mx>` with a `Course: http-server@v1.2.0` trailer so artifacts are inspectable but authorship is real. A recruiter grepping `git log --author` sees the student, not a bot.

#### 3.4 Customization surface

Exposed to the student in Settings (per enrollment + global defaults):

| Setting | Default | Scope |
|---------|---------|-------|
| Commit name | `Buildmancer Student` | global |
| Commit email | `student@buildmancer.local` | global |
| Commit message template | YAML `submodule.commit_message` OR `feat({module_id}): {submodule_title}` | per enrollment |
| Branching at graduation | direct-to-main | per enrollment (alt: `self-pr-per-module`) |
| Commit granularity at push | per-submodule (keep) | per enrollment (alt: per-module squash, single-commit) |
| Auto-push on complete | `false` | per enrollment |
| Final repo name | `{slug}-{lang}` | per enrollment |
| Repo visibility | `public` | per enrollment |
| Regenerate README on edit | `true` | per enrollment |

Not exposed:
- Working branch name. Stays `course/{slug}` internally until graduation.
- Commit author identity (hardcoded to GitHub OAuth once connected — a student editing this would defeat the portfolio purpose).
- Committer trailer (platform-side metadata for audit/versioning).

#### 3.5 Tasks

| # | Task | Effort (CC) | Notes |
|---|------|-------------|-------|
| 3.1 | Go vs Python decision for the git driver. **Pick Python** — `pygit2` or `dulwich`, all existing git calls already in API layer, keeps runner pure-exec. Alternative shells out to `git` CLI (simpler, slower, fine at our scale). **Rec: `git` CLI via subprocess for v1**, swap to `pygit2` only if measured pain. | — | Decision |
| 3.2 | `git_repos` migration + SQLModel. | 30 min | Alembic revision 002 |
| 3.3 | `api/git/repo.py` module: `init_repo`, `commit_pass`, `generate_readme`, `finalize`. Uses subprocess git. Writes to `settings.repos_path`. | 2 h | |
| 3.4 | Hook into enroll flow. | 20 min | `routers/enroll.py` |
| 3.5 | Hook into stream/run completion path. | 20 min | `routers/run.py` |
| 3.6 | README Jinja2 template with per-language "run locally" snippet. | 1 h | |
| 3.7 | Settings routes + UI. | 2 h | `routers/settings.py` + frontend |
| 3.8 | GitHub OAuth app + push flow. | 3 h | Use existing OAuth scaffolding if any; else vendor authlib |
| 3.9 | Graduation modal (Section 9.4) with full customization surface. | 3 h | Workspace success-overlay extension |
| 3.10 | `meta.portfolio` Pydantic model + loader + validator. Jinja2 README template with badges, module summaries, stats block. | 2 h | Consumed by 3.6 |
| 3.11 | `self-pr-per-module` branching strategy (optional at graduation). Creates N PRs on student GitHub, one per module, pre-filled with module summary. Student self-merges via Buildmancer UI calling GitHub API. | 3 h | Defer to Phase 3.5 if time-crunched |

**Phase 3 ships weeks 3-4.** Can overlap with Phase 2 tail.

### Phase 4 — Modal Exec + Eval Test Type

Goal: nanoGPT course is authorable and runnable within the existing five-type test model plus one new `eval` type.

#### 4.1 Extensions to YAML (additive, no breaking change)

```yaml
meta:
  runner: modal://gpu-a10g  # new scheme
  resources:                # new (optional)
    gpu: a10g
    cpu: 4
    memory_gb: 16
    timeout_s: 1800
  datasets:                 # new (optional) — mounted read-only
    - name: tinystories
      source: modal-volume://buildmancer-datasets/tinystories
      mount: /data/tinystories

modules:
  - id: train
    submodules:
      - id: train-tiny
        tests:
          - type: eval     # NEW sixth test type
            match: TestTrainLossBelow
            expected:
              loss_lt: 3.0
              perplexity_lt: 25
            timeout_ms: 600000
```

The `eval` type is a `unit` test on steroids: runs the student's training, parses final metrics (contract: student writes a `metrics.json` to workspace root), asserts thresholds. No binary to spawn. Existing five types still cover every CPU course unchanged.

#### 4.2 ModalExec

- `Prepare`: instantiate a Modal `App` with a `Function` that runs with the requested GPU + resources, mounts dataset volumes.
- `Exec`: call the Function with the workspace tarball; receive stdout, metrics, exit. Stream back via SSE.
- `Spawn`: same as Exec but long-running with checkpoint streaming. For nanoGPT, training progress lines (`step 1000 / 5000, loss 3.41`) stream through as `test_output` events.
- `Cleanup`: nothing (Modal autoscales down).

#### 4.3 Cost guardrails

- Per-user monthly GPU budget (default 50 mxn-equivalent; configurable by admin). Hard stop on overage, user sees "out of GPU budget, try again {next_month}" message.
- Per-run cost estimate before click — "~2 mxn, ~8 min". Design-doc success criterion requires under 5 mxn per run, this is how we prove it.
- Admin dashboard: cost per course, cost per user, cost per run. Defer until Modal ships; log the events from day one.

#### 4.4 Tasks

| # | Task | Effort (CC) |
|---|------|-------------|
| 4.1 | YAML schema extensions (Pydantic models, loader, validator). | 1 h |
| 4.2 | `eval` dispatcher on the Go side. Reads `metrics.json` from workspace, asserts thresholds. | 2 h |
| 4.3 | ModalExec implementation. Depends on a Modal account and verified pricing. | 1 day |
| 4.5 | Cost logging + per-user budget enforcement (middleware on `/api/run`). | 3 h |
| 4.6 | AUTHORING.md update — `eval` type, Modal meta, dataset mounts. | 1 h |
| 4.7 | Pilot: port half of nanoGPT (Karpathy video chunks 1-3) to the new YAML. Prove the model works end-to-end. | 1 day |

**Phase 4 targets weeks 5-6** per design doc GTM plan.

### Phase 5 — Contributor DX: Validator CLI + CI

Goal: zero pain for the first external contributor. Can run locally in under 10 seconds, same checks CI runs.

#### 5.1 `buildmancer` CLI (expanded per Agent-B)

A Python CLI at `backend/api/cli/main.py`, installed as `buildmancer` console script. Multi-command, scaffold + validate + test + drift:

```
buildmancer new-course <slug> --lang go
    scaffolds courses/<slug>/go/{course.yaml, src/, solution/, resources/, tests/}
    with minimal working example

buildmancer new-submodule <slug>/<lang> --module <id> --id <id>
    appends stub submodule entry to course.yaml + placeholder files

buildmancer validate <slug>/<lang>
    ✓ course.yaml parses
    ✓ every stubs[].path, resources[].file, tests[].file exists
    ✓ every resource has a stable id, unique per submodule
    ✓ difficulty visible_to coverage (at least one resource per level per submodule)
    ✓ stubs compile
    ✓ solution compiles
    ✓ solution passes every test (via LocalExec)
    ✓ stubs FAIL every unit test (no accidentally-passing tests)

buildmancer test <slug>/<lang>/<submodule>
    run the full dispatch pipeline against solution/ locally — same code path CI uses

buildmancer stub-diff <slug>/<lang>
    show drift between src/ and solution/ function signatures (AST-based, per language)
    exits non-zero on any signature mismatch
```

All commands fail loud with line numbers and non-zero exit. CI calls `validate` + `test` + `stub-diff`.

#### 5.2 Stub/solution drift protection

Three levels, ship v1 immediately, v2 when contributor pain measurable:

- **V1 (ship with Phase 5):** `buildmancer stub-diff` — AST-based signature diff. Starts Go (tree-sitter-go), adds Python + JS next. CI check fails PR on any mismatch.
- **V2 (defer to ~5 courses):** `@stub` markers in `solution/`. Author annotates functions in the canonical `solution/` tree; a codegen command produces `src/` with bodies replaced by `// TODO: implement` + zero-return. Commit both trees so repo stays browsable. Command: `buildmancer stubgen <slug>/<lang>`.
- **V3 (defer indefinitely):** fully single-source with marker blocks `// BUILDMANCER:SOLUTION_BEGIN/END`. Only if v1+v2 pain persists.

#### 5.3 Resource shorthand (P2, Phase 5 nice-to-have)

Per Agent-B: cut YAML verbosity. Optional `resources_dir:` at submodule level (defaults to `resources/{module.id}/{submodule.id}/`) + shorthand form:

```yaml
resources: [spec.md, signature.md, hint.md]   # type inferred from filename, visible_to from convention
```

Long form still valid; shorthand compiles to long form at load time. Cuts ~40% of YAML lines on a typical course. Loader change ~30 lines.

#### 5.4 Tasks

| # | Task | Effort (CC) |
|---|------|-------------|
| 5.1 | CLI scaffolding (click or typer), `validate` with structural checks. | 2 h |
| 5.2 | `test` command via LocalExec client. | 2 h |
| 5.3 | `stub-diff` signature AST check — Go first, Python + JS next. | 4 h |
| 5.4 | `new-course` / `new-submodule` scaffolders with minimal working template. | 2 h |
| 5.5 | Resource shorthand loader support + shorthand→longhand compilation. | 1 h |
| 5.6 | GitHub Actions workflow: validate + test + stub-diff on every PR. | 1 h |
| 5.7 | AUTHORING.md rewrite: "Validating your course locally" references CLI; add `AUTHORING-ML.md` appendix (Phase 4 parallel). | 1 h |

**Phase 5 ships weeks 3-4** in parallel with Phase 3.

---

## 6. Course Structure — Redesign or Extend?

**Verdict: extend, don't rewrite.** Both UX reviewers converge here. The five-type test model + `script + manages_lifecycle` survives. What's missing is a resource/runtime declaration layer, a non-gated submodule kind, a commit/portfolio contract, and pedagogical metadata. Additive, backward-compatible. Existing courses ignore all new fields.

### 6.1 Complete YAML delta

Consolidated from both reviewer recs. All fields are optional unless noted.

```yaml
meta:
  # Existing fields unchanged.
  runner: docker://buildersmty/runner-go:latest

  runtime:                                       # NEW — executor declaration
    target: local | docker | modal               # default docker; local for fast dev
    modal:                                       # required when target=modal
      gpu: T4 | A10G | A100 | H100
      timeout_s: 600
      volume: modal-volume://nanogpt-openwebtext-10k
      image: buildersmty/runner-modal-pytorch:latest

  portfolio:                                     # NEW — repo-as-CV contract
    readme_tagline: "A from-scratch HTTP/1.1 server in Go"
    architecture_md: portfolio/architecture.md   # author-written, copied into student repo
    badges: [language, lines-of-code, tier]
    license: MIT                                 # inherited by student repo
    module_summaries:                            # per-module blurbs rendered in README
      tcp: "TCP listener + goroutine-per-connection"
      parsing: "Byte-level HTTP/1.1 request parsing"
      # ...

  warmup:                                        # NEW — pre-module-0 onramp
    title: "Antes de empezar"
    resources:
      - title: "What is an HTTP server, really?"
        file: warmup/intro.md
        visible_to: [junior, mid]

modules:
  - id: tcp
    submodules:
      - id: listen
        kind: exercise | reading | guided-prompt # NEW — default exercise
        warmup: true                             # NEW — flags "onramp" submodule (special UI)
        estimated_minutes:                       # NEW — per-level, per-submodule
          junior: 15
          mid: 8
          senior: 3
        commit_message: "feat(tcp): implement listener with goroutine-per-connection"   # NEW
        commit_body: |                           # NEW, optional
          Opens a TCP socket on the configured port and spawns a goroutine per
          accepted connection. See RFC 793 §3.4.
        artifacts:                               # NEW — paths persisted into next submodule (Modal volume, or student repo locally)
          - checkpoints/ckpt.pt
          - logs/loss.jsonl
        tests:
          - type: eval                           # NEW sixth type — alias of script with structured asserts
            file: tests/check_val_loss.py
            assert:
              val_loss_lt: 3.5
              tokens_trained_gt: 500000
            timeout_ms: 600000
        resources:
          - id: tcp-listen-spec                  # NEW — stable id (not title match)
            title: "TCP listener and accept loops"
            file: tcp/server_doc.md
            type: doc
            visible_to: [junior, mid, senior]
```

### 6.2 Semantics per new field

- **`meta.runtime.target`**: consumed by `handler.HandleRun` to pick executor. Overrides legacy `meta.runner` scheme parsing. When `local`, fast dev iteration. When `modal`, Go runner calls Modal REST; contributor never touches Modal SDK.
- **`meta.portfolio`**: feeds the README/ARCHITECTURE generator (Phase 3.3). Every field has a sensible default if omitted; explicit authoring raises quality. `module_summaries` is what a recruiter reads on GitHub.
- **`meta.warmup`**: one-shot content shown on first entry to the course, skippable.
- **`submodule.kind: reading`**: no tests. UI renders spec + resources + "Mark read to continue" button. Progress row written on mark.
- **`submodule.kind: guided-prompt`**: reserve the field, defer implementation. No UI yet.
- **`submodule.warmup: true`**: UI shows celebration overlay for this student's first-ever green test on this course. Distinct from regular success overlay.
- **`submodule.estimated_minutes`**: rendered as ambient badge in workspace; drives "you're in the hard part, pace yourself" hints.
- **`submodule.commit_message` / `commit_body`**: used by git flow (Phase 3) as the default commit when the submodule passes. Student can edit before final push (Section 3.4 customization). Replaces ROADMAP's lifeless `[course] Pass {id}`.
- **`submodule.artifacts`**: list of paths persisted across submodule boundary. LocalExec: copied into the next run's tmpfs. DockerExec: volume-mounted. ModalExec: written to student's scoped Modal volume. The checkpoint story nanoGPT needs.
- **`submodule.tests[].type: eval`**: thin alias over `script` with declarative assertions. Internally dispatched by Go `EvalDispatcher` (new in Phase 4), which runs the script and parses a required `result.json` (or inline assert map). UI renders `val_loss: 3.42 (threshold < 3.5) — PASS` instead of binary green/red.
- **`resources[].id`**: stable id referenced by the frontend `ResourceTab` lookup (fixes `resource-tab.tsx:28-43` fragility). Schema validator requires unique-per-submodule. Falls back to title match for pre-v2 courses.

### 6.3 What we rejected

- Difficulty-varying stubs (per-level `src/`). AUTHORING.md is correct — same code path is the lesson. Difficulty is a resource filter, not a code fork.
- A fourth hierarchical level (course → milestone → module → submodule). A "milestone" is just a module with `integration_test`. No new depth.
- Course versioning. Single plan scope cap.
- Multi-file diff gates as first-class test type. `type: script` already covers them.

---

## 7. Beginner Rails

"Crazy simple to sail for a beginner" means: the platform never leaves the student stuck without a next action. Rails, ordered by impact per Agent-A's P0/P1 priorities:

1. **Difficulty-aware resource staging** *(P0, ~1 evening)*. Thread `enrollment.difficulty` into `getResourceStage(type, difficulty, explicitStage)` in `workspace-provider.tsx:47-69`. Junior gets hints at stage-1 (after first run). Mid gets hints at stage-2 (after first fail). Senior never gets hints. The whole "beginner-friendly but not dumbed-down" wedge lives here — today it's literally not wired.
2. **Ambient difficulty indicator** in ContextBar. Mono tag `JUNIOR` / `MID` / `SENIOR` near the progress bar. Student needs to know what mode they're in.
3. **First-run coach-marks** *(P0, 2 evenings)*. 4 inline callouts anchored to real chrome, localStorage-gated, skippable, dismissed on first green test: (a) "Tu tarea: lee el brief arriba", (b) "Archivo activo: `server.go` — completa el stub", (c) "Presiona `RUN` o Ctrl+Enter", (d) "Los recursos se desbloquean si los necesitas". No modal overlay — inline.
4. **Open current submodule's first stub, not `files[0]`**. One-line fix in `workspace-provider.tsx:153-161` — prefer `activeSubmodule?.stubs[0]?.path` when setting active file on mount.
5. **Auto-open the stage-0 doc as a tab** next to the stub on first entry to a submodule the student has never run. Codecrafters opens the README alongside; same pattern.
6. **Warmup block per course** and **submodule `warmup: true`** (see Section 6). First-ever-green celebration distinct from routine success.
7. **Stuck-state rail** *(P1)*. When `failedRuns >= 3` on the current submodule, inline banner in `test-output.tsx`: "¿Atorado? Revisa `hint` en recursos" linking to the hint resource. Triggers the hint resource to unlock immediately regardless of stage timer.
8. **Per-submodule `estimated_minutes`** rendered as a mono badge in the task-brief. Sets expectation: a 3-minute submodule shouldn't trigger frustration after 5 minutes.
9. **Test-output summarization.** On failed run, synthesize one-line cause above raw stream ("Your request returned 500, expected 200."). Spanish by default.
10. **Run-count badge per submodule.** "15 runs to green" as retention metric, neutral framing, not punitive.
11. **Explicit "I'm stuck" button** that records a support event during Phase-1 smoke test (founder reads daily). Sunset after Phase-2.

Rails 1-4 are P0. Land in Phase 3-adjacent UX pass. Rails 5-9 land in Phase 4. Rails 10-11 Phase-1-beta optional.

---

## 8. Data Model Changes

New table `git_repos`:

```sql
CREATE TABLE git_repos (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  language TEXT NOT NULL,
  repo_path TEXT NOT NULL,
  github_url TEXT,
  github_repo_name TEXT,
  github_visibility TEXT DEFAULT 'public',
  student_commit_name TEXT DEFAULT 'Buildmancer Student',
  student_commit_email TEXT DEFAULT 'student@buildmancer.local',
  commit_template TEXT DEFAULT 'pass({module_id}): {submodule_title}',
  created_at TIMESTAMPTZ DEFAULT now(),
  finalized_at TIMESTAMPTZ,
  UNIQUE (user_id, course_slug, language)
);
```

Altered `enrollments`: no change (git state keyed to enrollment via `(user_id, course_slug, language)` foreign key in practice).

New table `run_costs` (Phase 4 only):

```sql
CREATE TABLE run_costs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  executor TEXT NOT NULL,   -- 'local' | 'docker' | 'modal'
  gpu_type TEXT,
  duration_s REAL,
  cost_mxn REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_run_costs_user_month ON run_costs(user_id, date_trunc('month', created_at));
```

---

## 9. UI/UX Deliverables

Synthesized from two plan-design-review agents (workspace flow + course/contributor/git UX). Both converge on **polish, not redesign** — the architecture is right, the wiring is incomplete.

### 9.1 Workspace correctness fixes (P1, ship with Phase 0)

| # | Fix | File:line |
|---|-----|-----------|
| 9.1.1 | `ResourceTab` stable-id lookup, not title match | `resource-tab.tsx:28-43`, plus loader + schema `resources[].id` |
| 9.1.2 | Editor state cache key by filepath, not first-200-chars | `editor.tsx:177-191` |
| 9.1.3 | `Ctrl+K` kbd real onClick, not synthetic KeyboardEvent | `context-bar.tsx:80-84` |
| 9.1.4 | Test-output auto-run gated on user intent, not mount | `test-output.tsx:46-51` |
| 9.1.5 | Debounce Ctrl+Enter while status=running | `test-output.tsx:66-69` + disabled state on run button |
| 9.1.6 | Spanish captions on `IconRail` (module/archivos/docs/correr) | `icon-rail.tsx` |
| 9.1.7 | `STAGE_DEFAULTS` default unknown types to 99, not 0 | `workspace-provider.tsx:47-52` |

### 9.2 Workspace beginner rails (P0, ship with Phase 3)

- Difficulty-aware `getResourceStage` + ambient `DIFFICULTY` tag in ContextBar (rails 1-2).
- First-run coach-marks + prefocus first stub + auto-open stage-0 doc (rails 3-5).
- Stuck-state banner at `failedRuns >= 3` (rail 7).
- Warmup module rendering in `module-list.tsx` + distinct celebration overlay variant for `submodule.warmup: true` first-ever-green.

### 9.3 Git visibility scaffolding (P1, ship with Phase 3)

Scaffolding lands first as empty hooks, fills in as backend emits metadata. Three surfaces:

- **Success overlay / SuccessCTA**: one new line "Commit creado: `feat(tcp): implement listener...`" with a small GitHub icon and the course-author-written commit message from YAML. Links to a tiny repo view modal.
- **ContextBar**: persistent `⇧ N commits` indicator with tooltip "N submódulos commiteados a tu repo". Click opens repo view.
- **Repo view modal** (new component, lazy-loaded): shows commit log for the enrollment's bare repo, linear timeline, one entry per passed submodule. Pre-final-push: "Push to GitHub cuando termines." Post-push: live link.

No chrome in icon-rail — avoid bloat.

### 9.4 Graduation flow (P0, ship with Phase 3)

When final submodule passes, `success-overlay.tsx` extension opens a graduation modal with:

- Repo name (default from `meta.slug + language`, editable)
- Visibility (public default, private option)
- README preview — rendered from `meta.portfolio` template, editable as commit
- Commit granularity: per-submodule (default) | per-module (squash) | single-commit
- "Review my commits" view — student can rewrite any of the N messages before push
- Branching choice: direct-to-main (default) | self-PR-per-module (ships later, Phase 3.5)
- CV snippet generator: 3-line markdown, copy-to-clipboard, Buildmancer-branded with backlink

### 9.5 Settings page (P1, ship with Phase 3)

Global defaults (per user) + per-enrollment overrides. Fields per Section 3.4 table. GitHub OAuth "Connect" button at top. Commit author name/email default to GitHub OAuth identity once connected — not a bot identity. This is the single biggest change from the ROADMAP draft: commits are authored as the student, not as platform-bot.

### 9.6 Cost-before-run indicator (Phase 4)

For submodules where `meta.runtime.target: modal`:

- Run button shows inline estimate: "~2 mxn · ~8 min". Pulled from `meta.runtime.modal.timeout_s` × per-GPU-per-sec cost table.
- Monthly budget meter in ContextBar: "GPU: 14/50 mxn este mes".
- Overage blocks the run, does not silently charge: 429-style toast "Sin presupuesto GPU — intenta el próximo mes" with link to cost history.

---

## 10. CI / Deployment Changes

- GitHub Actions: validate-courses.yml triggers on PRs touching `courses/**`. Runs `buildmancer validate` against changed courses only.
- build-runner-images.yml: triggers on pushes to `backend/runner/images/**` or tagged releases. Builds and pushes the five runner images.
- deploy.yml: unchanged except Phase 3 adds `REPOS_PATH` env + a persistent volume in docker-compose and prod equivalent. Backups: nightly tar of `./repos/` to S3-compatible object store. Loss of a student's repo pre-push would be catastrophic — the full git history IS their portfolio.

---

## 11. Parallelization

| Lane | Phases | Owner | Notes |
|------|--------|-------|-------|
| A | 0.1 → 0.2 → 0.3 → 0.4 → 0.5 | CC | Sequential; all touch API+runner surface. Single PR bundled. |
| B | 1 → 2 → 4 | CC | Sequential; executor → Docker → Modal. |
| C | 3 | CC | Starts after Phase 0 merges. Touches API + DB + frontend. Parallel with B. |
| D | 5 | CC | Independent module. Parallel with B and C. |

Critical path: A → B (through Phase 2) for the Phase-1 smoke test. Phase 3 and Phase 5 can land in parallel with B. Phase 4 starts after Phase 2 + 3 merge.

---

## 12. Success Criteria (maps to design-doc 6-week targets)

- **Week 2:** Phase 0 + Phase 1 + Phase 2 merged. Redis-in-Go runs in Docker with resource limits. Zero host-exec paths remain outside explicit `local://`.
- **Week 3:** Phase 3 merged. A single student enroll → pass → push-to-GitHub flow works end-to-end. Student's GitHub has a new public repo with a Buildmancer-generated README.
- **Week 4:** Phase 5 merged. A second person (CS friend or founder wearing contributor hat) authors a tiny course using `buildmancer validate`. Time-to-first-green < 30 minutes for a simple stdout test course.
- **Week 5:** Phase 4 partial — YAML extensions + LocalExec + DockerExec extended for new types. Dry-run on fake eval test works.
- **Week 6:** ModalExec working. One nanoGPT submodule runs end-to-end on a real GPU. Measured per-run cost logged; fails plan if >5 mxn.

Kill-switch: if Phase 2 Docker sandbox doesn't land by end of week 2, defer Phase-1 smoke test by one week. Zero-stranger-traffic until sandbox is real.

---

## 13. Failure Modes (new code only, from this plan)

| Path | Failure | Test | Error surface |
|------|---------|------|---------------|
| Phase 0.4 merged endpoint | Client drops mid-stream | New test in `test_run.py`, asserts Progress row. | Server-side commit regardless. |
| Phase 1 Executor | Unknown scheme in `meta.runner` | Unit test with bad scheme. | 400 from API with explicit message. |
| Phase 2 Docker | Runner host has no Docker | Detect on startup, fail loud. | Admin sees error log + health check red. |
| Phase 2 Docker | Container hangs | Already covered by per-test timeouts + WaitDelay. | test_timeout event to student. |
| Phase 3 git commit | Working tree dirty or repo missing | Unit test with pre-corrupted repo. | Progress row still written, git failure logged, admin alerted. Student sees "Commit pending — retrying" badge. |
| Phase 3 GitHub push | OAuth token expired | Retry with re-auth prompt. | Modal with "Reconnect GitHub" button. |
| Phase 4 Modal | Budget exceeded | Rate-limit middleware test. | 429 with "Out of GPU budget this month" message. |
| Phase 4 eval | `metrics.json` missing | Dispatcher test. | Explicit "Your code did not write metrics.json — see docs" error. |
| Phase 5 validate | Non-Go signature check | Python / JS AST tests. | CLI exits non-zero with line numbers. |

---

## 14. Out-of-Plan Risks and Mitigations

1. **Modal pricing shift.** If per-run > 5 mxn at measurement, design-doc kill-switch activates at week 3 (pivot to Approach C — cohort model). Plan assumes measurement happens week 5; do an earlier spike in week 2 with a dummy training run to de-risk.
2. **Docker-in-Docker on dev machines** (Windows specifically — user is on Linux today but contributors will be cross-platform). Mitigation: document "runner requires Docker on host; in dev, runner service runs on host, not inside a container." Re-architect only if multiple contributors hit it.
3. **GitHub API rate limits** during batch enrollments. Unlikely at our scale. Budget when we hit >100 concurrent users.
4. **Scope creep on the README template.** Every additional field is a maintenance burden. The template committed at Phase 3 is the template. Changes require a separate plan.

---

## 15. Open Questions (revisit after UX inputs)

- Does the workspace need a dedicated "repo view" tab, or is the GitHub link at completion enough?
- Are module `integration_test` failures differentiated enough from submodule failures in the UI? (Might matter for ML courses where integration tests are the long-running ones.)
- Should `type: eval` support streaming intermediate metrics (loss-per-step during training)? Likely yes for nanoGPT — design this into the ModalExec contract now.
- Commit message per-language opinions? Spanish courses may default to Spanish commit text. Reasonable, and fits positioning.
- Student import flow: if a student already has partial work, can they import from GitHub? Defer until demanded.

---

## 16. Explicit Dependencies

- Modal account with GPU quota confirmed (before Phase 4).
- GitHub OAuth app registered under `buildersmty` org (before Phase 3.8).
- docker-compose volume for `./repos/` persistent storage (before Phase 3 ships).
- Sentry or equivalent error tracking — recommended before Phase 2 strangers-beta. Out of this plan's scope but flagged.

---

*End of plan. Section 9 and parts of Section 7 will be revised with UX-reviewer inputs before any implementation starts.*
