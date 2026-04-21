# BuildersMTY — Courses Repository Spec

## Purpose

This repository contains all course content for the BuildersMTY learning platform. It is the single source of truth for course structure, stubs, tests, resources, and reference solutions. The platform (`builders-platform`) reads this repo to bootstrap student workspaces — it never writes here.

---

## Repository Structure

```
courses/
  {course-slug}/
    {language}/
      course.yaml       ← defines the entire course: modules, submodules, tests, resources
      src/              ← stubs: source files (and unit-test files) for the student to fill
      solution/         ← complete working reference implementation, never exposed to students
      resources/        ← markdown docs organized by module/submodule
      tests/            ← optional: shell scripts or test binaries used by `script`-type tests
      Dockerfile        ← optional: only required when introducing a new language runner
```

The `tests/` directory holds files referenced by `type: script` tests. Paths in `course.yaml` are relative to the language root (e.g. `tests/path_traversal_test.sh`).

There is **no `makefiles/` directory** in most courses. The platform builds and runs the student's project using language defaults (see TESTS.md → "Language Defaults"). Contributors only need to override these in `course.yaml` when they have custom needs.

---

## course.yaml Schema

```yaml
meta:
  slug: string # unique, kebab-case, matches directory name
  title: string
  description: string
  language: string # go | c | python | rust | javascript
  difficulty: beginner | intermediate | advanced
  runner: string # docker image, e.g. buildersmty/runner-go:latest
  estimated_hours:
    junior: int
    mid: int
    senior: int

  # Optional overrides — only set when language defaults don't fit.
  # See TESTS.md → "Language Defaults" for the per-language built-in commands.
  build_cmd: string # e.g. "go build -tags integration -o $BUILDERSMTY_BINARY ."
  run_cmd: string # e.g. "$BUILDERSMTY_BINARY --port 8080"
  unit_cmd: string # e.g. "go test -tags integration -run {match} -v ./..."

modules:
  - id: string # short, snake_case
    title: string
    description: string
    integration_test: # runs after all submodules in this module pass
      # Same shape as a single entry in `tests:` below.
      # See TESTS.md for the five supported test types and their fields.
      type: unit | stdout | http | tcp | script
      # ...type-specific fields
    submodules:
      - id: string # short, snake_case
        title: string
        spec: string # technical description of what the student must implement
        stubs:
          - path: string # relative to src/, e.g. server.go
        # Optional per-submodule overrides (rarely needed):
        # build_cmd, run_cmd, unit_cmd
        tests:
          # Each test is dispatched by `type` to the corresponding handler.
          # See TESTS.md for the full schema of each test type.
          - type: unit | stdout | http | tcp | script
            # ...type-specific fields (request/expected for http, send/expected_hex
            # for tcp, file for script, stdin/expected_stdout for stdout,
            # match for unit)
        resources:
          - title: string
            file: string # relative to resources/
            type: doc | spec | signature | hint
            visible_to:
              - junior | mid | senior
```

The full test schema (fields per type, assertions, examples, build/run defaults) lives in **TESTS.md** — this file only covers the structural shape of `course.yaml`.

---

## Stubs

Stubs are source files with function signatures and empty bodies. They define what the student must implement without revealing how. Every function the student needs to fill must be present with its correct signature and a comment describing its expected behavior.

```go
// Listen opens a TCP socket on the given port and returns a net.Listener.
// It must return an error if the port is already in use.
func Listen(port int) (net.Listener, error) {
    // TODO: implement
}
```

---

## Solution

The `solution/` directory contains a complete, clean, well-commented implementation. It is used by:

- CI to validate that all tests pass before merging a course PR
- Course authors as the reference when writing stubs and tests

The solution is never served to students by the platform. It is excluded from enrollment repo initialization.

---

## Resources

Resources are markdown files. Each resource targets a specific submodule and a specific difficulty level. The platform filters resources based on the student's enrolled difficulty.

Resource types:

- `doc` — language or stdlib documentation relevant to the submodule
- `spec` — technical specification of the system being built (RFC, man page, protocol spec)
- `signature` — function signatures and type definitions relevant to the implementation
- `hint` — step-by-step implementation guidance, junior only in most cases

---

## Build & Run

The platform builds and runs the student's project using **language defaults** — not contributor-supplied makefiles. The full per-language defaults table lives in TESTS.md → "Language Defaults".

For Go, the defaults are:

```
build_cmd:  go build -o $BUILDERSMTY_BINARY .
run_cmd:    $BUILDERSMTY_BINARY
unit_cmd:   go test -run {match} -v -count=1 .
```

After the build, an executable exists at `$BUILDERSMTY_BINARY` (default: `/tmp/program`). The platform spawns it for `http`/`tcp`/`script` tests and pipes stdin/stdout for `stdout` tests. `unit` tests bypass the binary entirely and run the language's native test runner.

**Contributors do not write build scripts, makefiles, or test runners.** They declare tests in `course.yaml` and let the platform handle execution. The only time you override a default is when you need custom build flags, env vars, or test runner config — and the override goes in `meta` (course-wide) or in the submodule (per-submodule), as a string field, not a separate file.

### Program lifecycle within a submodule

A submodule can declare multiple tests. For tests that need a running program (`http`, `tcp`, `script`), the platform starts the program **once** at the beginning of the submodule run, executes all tests in order against the same process, and kills it at the end. Tests do NOT get a fresh process per test. Contributors can rely on this for stateful assertions within a single submodule run (e.g. POST then GET).

For tests that need to control lifecycle themselves (DB persistence, crash recovery), use `type: script` with `manages_lifecycle: true` — see TESTS.md.

### Integration tests

Module-level `integration_test` entries follow the same execution model. The platform builds the project, spawns the binary if the test type needs it, and runs the assertion. No special configuration required.

---

## Runner

Each language has a Docker image pre-built with all required tooling. Images are published to Docker Hub under `buildersmty/runner-{language}` and referenced from `meta.runner` in `course.yaml`.

Runner images are maintained in the **infra repo** (`builders-platform/runners/{language}/`), not in this repo. The course only needs to reference the published image tag. A `Dockerfile` is committed inside a course directory only when introducing a new language that doesn't already have a runner image — once the image is published, the Dockerfile lives in the infra repo.

The runner is stateless — it receives the student's files via a tmpfs mount, runs the build and test commands declared in `course.yaml` (or the language defaults), returns stdout/stderr, and is returned to the pool. No state persists between runs.

The runner image must guarantee a few baseline tools are available so `script`-type tests don't need to detect them: `bash`, `curl`, `nc`, plus the language toolchain. Contributors writing scripts can assume these.

---

## Contributing a Course

1. Fork this repo
2. Copy an existing course directory as a template
3. Fill `course.yaml`, `src/`, `solution/`, `resources/` (and `tests/` if you need `script` tests)
4. Ensure `solution/` passes all tests defined in `course.yaml`
5. Open a PR — CI validates automatically

A PR must include:

- A complete `course.yaml`
- All stubs with correct signatures and TODO comments
- A working `solution/` that passes every test
- At least one resource per submodule visible to each difficulty level
- A `Dockerfile` for the runner if introducing a new language

---

## License

Content in this repository is licensed under **CC BY-NC 4.0**. Free to use, modify, and redistribute for non-commercial purposes. Commercial use requires explicit permission from BuildersMTY.
