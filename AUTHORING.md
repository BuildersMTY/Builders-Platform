# BuildersMTY — Course Authoring Guide

This document explains how to author courses for the BuildersMTY learning platform and how the platform executes them. It is the single starting point for two audiences:

- **Contributors** writing new courses or modifying existing ones
- **Infra developers** building or maintaining the platform that runs these courses

If you only need the formal schema, see `COURSES.md` (course.yaml shape) and `TESTS.md` (test types and execution model). This guide covers the same ground but with examples, philosophy, and the "why."

---

## Table of Contents

1. [What you're building](#what-youre-building)
2. [How the system works](#how-the-system-works)
3. [Repository layout](#repository-layout)
4. [Quick start: contributing a course](#quick-start)
5. [`course.yaml` — the contract](#courseyaml--the-contract)
6. [Stubs and the solution](#stubs-and-the-solution)
7. [Tests: declarative, zero test code](#tests-declarative-zero-test-code)
8. [Resources: teaching material](#resources-teaching-material)
9. [Difficulty levels](#difficulty-levels)
10. [Build and run: language defaults](#build-and-run-language-defaults)
11. [Validating your course locally](#validating-your-course-locally)
12. [Worked example: a submodule end-to-end](#worked-example)
13. [Common patterns](#common-patterns)
14. [Platform contract reference (for infra developers)](#platform-contract-reference)
15. [FAQ](#faq)

---

## What you're building

A BuildersMTY course teaches a software engineer how to build something real — an HTTP server, a Redis clone, a memory allocator, a shell — by guiding them through a sequence of small, testable implementation steps.

Each course is split into **modules**, each module into **submodules**. Every submodule asks the student to implement one concept (a function, a method, a small piece of behavior) and is gated by automated tests. When the student passes all tests in a submodule, the platform commits their work and unlocks the next one.

A good course has these properties:

- **One concept per submodule.** Not "implement the parser" — "implement the request line parser." Granularity is what makes the experience feel like progress.
- **Cumulative tests.** A submodule's tests should be passable using only the code from that submodule and everything before it. Never require code from a future submodule to pass a current test.
- **Real-world fidelity.** The student should end up with code that looks like something they'd be proud to put on GitHub. No toy abstractions, no "simplified for the course" data types.
- **Reference solution that the contributor wrote first.** Always implement the full solution before writing stubs and tests. If you can't write it cleanly, the course isn't ready.

---

## How the system works

Three pieces matter:

1. **The course repo** (this repo) — content only. Stubs, the reference solution, declarative test specs in `course.yaml`, and markdown resources. No test runners, no build scripts, no makefiles.

2. **The platform** (`builders-platform` repo) — reads this repo, dispatches tests, manages student workspaces, and renders the UI. It implements the contract described in this document.

3. **The runner image** — a per-language Docker image with the toolchain and a few baseline utilities (`bash`, `curl`, `nc`). Maintained in the platform repo.

The flow when a student presses "Run Tests":

```
student clicks "Run Tests" on submodule X
  → platform reads course.yaml for that submodule
  → fresh runner container is spun up from the pool
  → student's workspace is mounted as tmpfs
  → platform runs build_cmd (language default or override)
  → if needed, platform spawns the built binary and waits for readiness
  → for each test in tests[]:
       → dispatch by test.type to the matching handler
       → assert, stream output to the student's browser in real time
  → kill spawned binary
  → if all tests pass: commit the student's workspace and unlock next submodule
  → if any test fails: show which test failed and why; student stays on submodule
  → container is destroyed
```

**The contributor's job is to declare what to test, not how to run it.** The platform handles container management, build commands, process lifecycle, port readiness checks, and result aggregation.

---

## Repository layout

```
courses/
  {course-slug}/                 ← e.g. http-server, redis, memory-allocator
    {language}/                  ← go, c, python, rust, javascript
      course.yaml                ← the entire course definition
      src/                       ← stubs the student starts from
      solution/                  ← reference implementation, never shown to students
      resources/                 ← markdown resources (docs, specs, signatures, hints)
      tests/                     ← optional: shell scripts for `script`-type tests
      Dockerfile                 ← optional: only when introducing a new language runner
```

There is **no `makefiles/` directory**. Build and run commands come from language defaults.

The `tests/` directory only exists when the course needs `script`-type tests. The `Dockerfile` only exists when introducing a brand-new language runner; once the image is published, the Dockerfile lives in the platform repo.

---

## Quick start

1. Fork this repo.
2. Pick the course you want to contribute. If it's new, copy an existing course directory as a template (e.g. `cp -r courses/http-server/go courses/my-course/go`).
3. Implement the full reference solution in `solution/`. Make it clean and well-commented. This is the hardest step — do it first.
4. Build stubs in `src/` by stripping function bodies from your solution and replacing them with `// TODO: implement` plus a comment describing the expected behavior.
5. Write `course.yaml`: define modules, submodules, and tests. Use the language defaults — don't write makefiles.
6. Write resources in `resources/{module-id}/`: a doc/spec for the module, plus per-submodule signature and hint files.
7. If any submodule needs a `script`-type test, write the script in `tests/`.
8. Validate locally (see [Validating your course locally](#validating-your-course-locally)).
9. Open a PR. CI will run your tests against the reference solution and fail if anything is broken.

---

## `course.yaml` — the contract

`course.yaml` is the only file the platform reads to understand your course. Everything else (stubs, solution, resources, scripts) is referenced from here.

```yaml
meta:
  slug: http-server                    # unique, kebab-case, matches dir name
  title: Build Your Own HTTP Server
  description: >-
    Construct an HTTP server from scratch using only TCP sockets.
    Learn the protocol, request parsing, response writing, routing,
    static files, and middlewares.
  language: go                          # go | c | python | rust | javascript
  difficulty: intermediate              # beginner | intermediate | advanced
  runner: buildersmty/runner-go:latest  # docker image tag
  estimated_hours:
    junior: 20
    mid: 12
    senior: 6

  # Optional: override language defaults. Most courses leave these unset.
  # build_cmd: "go build -tags integration -o $BUILDERSMTY_BINARY ."
  # run_cmd:   "$BUILDERSMTY_BINARY --port 8080"
  # unit_cmd:  "go test -tags integration -run {match} -v -count=1 ."

modules:
  - id: tcp                             # short, snake_case
    title: "Module 1 — TCP Foundation"
    description: >-
      Open a TCP socket, accept concurrent connections with goroutines,
      and dispatch each connection to the configured handler.

    integration_test:                   # runs after all submodules pass
      type: script
      file: tests/tcp_handle_conn_test.sh
      timeout_ms: 5000

    submodules:
      - id: listen
        title: "TCP listener and accept loop"
        spec: >-
          Implement Server.Start: open a TCP listener on Server.Addr
          with net.Listen, defer listener.Close, and enter an infinite
          loop calling Accept. Spawn a goroutine per connection.

        stubs:
          - path: server.go             # relative to src/

        tests:
          - type: script
            file: tests/tcp_listen_test.sh
            timeout_ms: 5000

        resources:
          - title: "net.Listen and TCP accept loops"
            file: tcp/server_doc.md
            type: doc
            visible_to: [junior, mid, senior]
          - title: "Signature: Server.Start"
            file: tcp/listen_signature.md
            type: signature
            visible_to: [junior, mid, senior]
          - title: "Hint: listener and goroutines"
            file: tcp/listen_hint.md
            type: hint
            visible_to: [junior]
```

Every submodule has the same fields: `id`, `title`, `spec`, `stubs`, `tests`, `resources`. There is **no `makefile:` field** — you describe what to test, the platform decides how to run it.

For the formal schema, see `COURSES.md`. For test type details, see `TESTS.md`.

---

## Stubs and the solution

### Stubs (`src/`)

Stubs are source files with the function signatures the student must implement, empty bodies, and a clear comment describing what each function should do. The student starts from `src/` — they edit these files until all tests pass.

```go
// parseRequestLine reads the first line of an HTTP request from the reader
// (e.g. "GET /path HTTP/1.1\r\n"), trims trailing \r\n, splits by space
// into 3 parts, and returns (method, path, version).
// Return an error if the line cannot be read or doesn't have 3 parts.
func parseRequestLine(reader *bufio.Reader) (method, path, version string, err error) {
    // TODO: implement
    return "", "", "", nil
}
```

**Rules for good stubs:**

- **Always include the function signature.** The student should not have to invent parameter or return types. The signature is part of the lesson.
- **Always include a behavioral comment.** Explain what the function must do, what edge cases to handle, what to return on error. Be specific.
- **Never include the implementation.** Even partial. The TODO is the whole point.
- **Compile cleanly.** A student should be able to `go build .` (or equivalent) on a fresh checkout of `src/` and get a working binary that just doesn't do anything yet. This means stubs must return zero values, not panic.
- **Keep helper functions and pre-built infrastructure.** If part of the codebase is "given" (orchestration, type definitions, file I/O glue), implement it fully in stubs. Only the parts the student is supposed to learn should be TODOs.

### Solution (`solution/`)

The solution is a complete, clean, well-commented implementation of the entire course. It is used by:

- CI to validate that all tests defined in `course.yaml` actually pass
- Course authors as the reference when writing stubs

The solution is **never served to students by the platform.** It exists for validation and for you.

The solution should mirror the structure of `src/` exactly — same files, same function signatures, same package layout. The only difference is that bodies are filled in.

---

## Tests: declarative, zero test code

This is the most important section. **Course authors do not write test runners, helpers, harnesses, or makefiles.** You declare what to test in YAML, and the platform's tester dispatches to the right handler based on the `type` field.

There are five test types:

| Type | When to use | What the platform does |
|---|---|---|
| `unit` | Pure libraries, helpers, parsers — anything natively tested by the language's test framework | Runs the language's test runner against a named test, captures exit code |
| `stdout` | One-shot CLIs that read stdin and write stdout | Spawns the binary, pipes stdin in, captures stdout, compares |
| `http` | Long-running HTTP servers | Spawns the binary, waits for the port, sends HTTP request, validates response |
| `tcp` | Long-running servers speaking custom binary or text protocols | Spawns the binary, waits for the port, sends raw bytes, validates response |
| `script` | Anything that doesn't fit the above — repo state checks, multi-step CLI invocations, persistence tests | Spawns the binary (optional), runs an external script with env vars |

### `unit`

Use for pure-library code that's naturally tested with the language's own test framework.

```yaml
tests:
  - type: unit
    match: TestParseRequestLine
    timeout_ms: 5000
```

The student writes regular `*_test.go` (or `tests/test_*.py`, etc.) files in their workspace. The platform invokes the language's test runner with the test name interpolated. For Go, that becomes `go test -run TestParseRequestLine -v -count=1 .`.

The test files are committed as part of the stubs. They are visible to the student so they can read what's being checked — no hidden test logic.

**When to use this instead of `stdout`/`http`:** if the thing you're testing is a function, not a program. Parsers, lexers, regex engines, data structures, helper utilities.

### `stdout`

The simplest type. Spawn the program once, optionally feed stdin, compare stdout.

```yaml
tests:
  - type: stdout
    stdin: "hello world"
    expected_stdout: "hello world\n"
    timeout_ms: 3000
```

For programs whose output isn't fully deterministic, use `expected_stdout_contains`:

```yaml
tests:
  - type: stdout
    stdin: ""
    expected_stdout_contains: "listening on port"
    timeout_ms: 3000
```

Use for: compilers, interpreters, shells, CLIs that read stdin, memory allocators with stdio test harnesses.

### `http`

Spawn a long-running HTTP server, send a request, validate the response. Tests at the HTTP semantic level — status code, headers, body — without caring about byte-level formatting.

```yaml
tests:
  - type: http
    request:
      method: GET
      path: /health
      headers:
        Host: localhost
    expected:
      status: 200
      body_contains: '"status":"ok"'
      timeout_ms: 3000
```

Available assertions:

```yaml
expected:
  status: 200                          # exact HTTP status code
  body_contains: "string"              # body includes this substring
  body_equals: '{"status":"ok"}'       # exact body match
  headers:
    Content-Type: "application/json"   # header value contains this string
```

Use for: HTTP servers, REST APIs, web frameworks, reverse proxies, load balancers.

### `tcp`

Sends raw bytes over a TCP connection and validates raw response bytes. No HTTP abstraction.

```yaml
tests:
  - type: tcp
    port: 6379
    send_hex: "2b 50 49 4e 47 0d 0a"      # +PING\r\n
    expected_hex: "2b 50 4f 4e 47 0d 0a"  # +PONG\r\n
    timeout_ms: 3000
```

Plain strings work too for text-based protocols:

```yaml
tests:
  - type: tcp
    port: 6379
    send: "*1\r\n$4\r\nPING\r\n"
    expected: "+PONG\r\n"
    timeout_ms: 3000
```

Use for: Redis clones, custom binary protocols, anything where HTTP doesn't apply.

### `script`

The escape hatch. Use when the test logic can't be expressed declaratively — repo state checks, multi-step CLI invocations, filesystem inspections, concurrency tests, persistence/restart tests.

```yaml
tests:
  - type: script
    file: tests/concurrency_test.sh
    timeout_ms: 10000
```

**Default behavior:** the platform spawns the student's binary before running the script (so the script can hit it directly) and kills it when the script exits. The script gets:

| Env var | When set | Value |
|---|---|---|
| `BUILDERSMTY_WORKSPACE_DIR` | always | Path to the student's workspace (read-write tmpfs) |
| `BUILDERSMTY_BINARY` | always | Path to the built artifact (e.g. `/tmp/program`) |
| `BUILDERSMTY_PROGRAM_PID` | when platform spawned the binary | PID of the running binary |

**Manual lifecycle** for tests that need to spawn/kill/restart the binary themselves (e.g. database persistence):

```yaml
tests:
  - type: script
    file: tests/persistence_test.sh
    manages_lifecycle: true
    timeout_ms: 10000
```

When `manages_lifecycle: true`, the platform does NOT spawn the binary. The script gets `BUILDERSMTY_BINARY` and is fully responsible for spawning it (with whatever args, env vars, working directory it needs), killing it, and restarting it as many times as the test requires.

The script must exit 0 on pass and non-zero on failure. Stdout is streamed to the student in real time.

Scripts live in `tests/` and can be written in any language available in the runner image. Bash is always available; for more complex assertions, write a Go/Python script and let the runner execute it.

### Multi-test submodules

A submodule can have multiple tests. For tests that need a running program, the platform starts the program **once** at the beginning of the submodule run, executes all tests in order against the same process, and kills it at the end. This lets you write stateful sequences:

```yaml
tests:
  - type: http
    request:
      method: POST
      path: /items
      body: '{"name": "foo"}'
    expected:
      status: 201

  - type: http
    request:
      method: GET
      path: /items/foo
    expected:
      status: 200
      body_contains: '"name": "foo"'
```

Both tests hit the same process — the POST creates state, the GET reads it.

### Module integration tests

When all submodules in a module pass, the platform runs the module's `integration_test`. Same shape as a single submodule test — pick any of the five types:

```yaml
modules:
  - id: tcp
    title: "TCP Foundation"
    integration_test:
      type: http
      request:
        method: GET
        path: /
      expected:
        status: 200
    submodules:
      - ...
```

Integration tests use the same execution model and language defaults as submodule tests. No special configuration.

---

## Resources: teaching material

Resources are markdown files referenced by submodules and shown to the student in the UI sidebar. Each resource has a type and a difficulty filter.

```yaml
resources:
  - title: "HTTP/1.1 Request format (RFC 7230 §3)"
    file: parsing/request_spec.md
    type: spec
    visible_to: [junior, mid, senior]
  - title: "Signature: parseRequestLine"
    file: parsing/request_line_signature.md
    type: signature
    visible_to: [junior, mid, senior]
  - title: "Hint: ReadString and Split"
    file: parsing/request_line_hint.md
    type: hint
    visible_to: [junior]
```

### Resource types

| Type | Purpose | Typical visibility |
|---|---|---|
| `doc` | Language or stdlib documentation relevant to the submodule (e.g. how `net.Listen` works) | All levels |
| `spec` | Technical specification of the system being built — RFC, man page, protocol spec | All levels |
| `signature` | Function signatures and type definitions, plus a behavioral description | All levels |
| `hint` | Step-by-step implementation guidance with code snippets | Juniors only (most cases) |

### Visibility

The `visible_to` array filters which difficulty levels see this resource. The platform never shows hidden resources to a student at a level not in the list. A senior who enrolled at "senior" difficulty sees only `doc`, `spec`, and `signature` resources — no hints. Juniors see everything.

### How to write good resources

- **Docs** should link to or summarize the relevant language/stdlib documentation, focused on what the student needs for THIS submodule. Don't dump an entire stdlib page.
- **Specs** should be focused excerpts. If the RFC has 50 sections, pull the 2 that matter for this submodule and explain them in plain language.
- **Signatures** should contain the function signature, what each parameter is, what to return, and a short list of expected behaviors. Think "interface contract."
- **Hints** are step-by-step. They can include code snippets — even almost-complete implementations. The point of hints is to unblock juniors who would otherwise give up. A senior would never see them.

Always structure resources so a student at the target difficulty can succeed using only the resources they're allowed to see. Never put critical info in a hint that mids/seniors don't get.

---

## Difficulty levels

Every course is taken at one of three difficulty levels. The student picks at enrollment.

| Level | Who | What they see |
|---|---|---|
| `junior` | Bootcamp graduates, students, anyone new to the language or domain | All resources including hints |
| `mid` | Working engineers with 1-3 years of experience | Docs, specs, signatures. No hints. |
| `senior` | Engineers with 5+ years who want to fill a specific knowledge gap | Specs and signatures. Often no docs. |

The `estimated_hours` in `meta` should reflect realistic completion time per level. Seniors typically complete in 30-50% of the time juniors take.

The same stubs and tests are used for all levels. **The student writes the same code regardless of difficulty.** Difficulty only changes which teaching resources are visible.

---

## Build and run: language defaults

The platform builds and runs the student's project using **language defaults** baked into the runner. Contributors only override these when they have custom needs.

| Language | `build_cmd` | `run_cmd` | `unit_cmd` |
|---|---|---|---|
| `go` | `go build -o $BUILDERSMTY_BINARY .` | `$BUILDERSMTY_BINARY` | `go test -run {match} -v -count=1 .` |
| `rust` | `cargo build --release && cp target/release/* $BUILDERSMTY_BINARY` | `$BUILDERSMTY_BINARY` | `cargo test {match}` |
| `python` | (no build step) | `python main.py` | `pytest -k {match}` |
| `c` | `make` (or `cc -o $BUILDERSMTY_BINARY *.c`) | `$BUILDERSMTY_BINARY` | (no convention; use `script`) |
| `javascript` | `npm install && npm run build` | `node dist/index.js` | `vitest run -t {match}` |

`{match}` is interpolated from each `unit` test's `match` field.

### When to override

You only need overrides if:

- Your build needs custom flags or build tags (`go build -tags integration ...`)
- Your binary needs args at startup (`./server --port 8080 --config production.yaml`)
- Your test runner needs special config (`pytest --cov ...`)
- Your project structure doesn't match the language convention (multiple binaries, monorepo)

Set overrides in `meta` for course-wide defaults, or per-submodule when one specific submodule needs different behavior. Most courses set zero overrides.

```yaml
meta:
  language: go
  build_cmd: "go build -tags integration -o $BUILDERSMTY_BINARY ./cmd/server"
  run_cmd:   "$BUILDERSMTY_BINARY --config /tmp/test.yaml"
```

### The build artifact contract

After `build_cmd` runs, an executable must exist at `$BUILDERSMTY_BINARY` (the platform sets this env var, default `/tmp/program`). The platform uses this path for `http`/`tcp`/`stdout`/`script` tests. `unit` tests bypass the binary and run the language's test runner directly.

If your `build_cmd` produces a binary at a different path, copy or move it to `$BUILDERSMTY_BINARY`:

```yaml
build_cmd: "cargo build --release && cp target/release/myserver $BUILDERSMTY_BINARY"
```

---

## Validating your course locally

Before opening a PR, verify three things:

**1. Stubs compile.**

A fresh clone of `src/` should build cleanly with the language default. For Go:

```bash
cd courses/{slug}/{lang}/src && go build -o /tmp/program .
```

If this fails, the student would be blocked before even starting. Stub functions must return zero values, not panic.

**2. Solution compiles and passes every test.**

```bash
cd courses/{slug}/{lang}/solution && go build -o /tmp/program .
```

Then for each `unit` test in `course.yaml`, run the equivalent command against `solution/`. For Go and `match: TestParseHeaders`:

```bash
cd courses/{slug}/{lang}/solution && go test -run TestParseHeaders -v -count=1 .
```

For `http` tests, start the solution binary and use `curl` to verify the assertions manually:

```bash
/tmp/program &
curl -i http://localhost:8080/health
kill %1
```

For `script` tests, run the script with the env vars set:

```bash
BUILDERSMTY_BINARY=/tmp/program BUILDERSMTY_WORKSPACE_DIR=$(pwd) bash tests/path_traversal_test.sh
```

**3. `course.yaml` references resolve.**

Every `file:` and `path:` in `course.yaml` should point to a real file. CI checks this automatically; locally you can grep for paths and verify each one exists.

**4. Stubs FAIL the unit tests.**

The corollary of #2: when you run unit tests against `src/`, they should all fail. If a unit test passes against the stubs, your stubs aren't strict enough — the student would get a green check without writing any code.

CI runs all four checks on every PR and rejects courses that fail any of them.

---

## Worked example

Let's walk through one submodule end-to-end. We'll use Module 2, submodule `request-line` from the HTTP server course.

**Goal:** the student implements `parseRequestLine`, which reads the first line of an HTTP request from a buffered reader and returns the method, path, and version.

### 1. Reference solution

`solution/request.go` contains the full implementation:

```go
func parseRequestLine(reader *bufio.Reader) (method, path, version string, err error) {
    reqLine, err := reader.ReadString('\n')
    if err != nil {
        return "", "", "", fmt.Errorf("error reading request line: %w", err)
    }
    reqLine = strings.TrimRight(reqLine, "\r\n")

    parts := strings.Split(reqLine, " ")
    if len(parts) != 3 {
        return "", "", "", fmt.Errorf("invalid request line: %q", reqLine)
    }
    return parts[0], parts[1], parts[2], nil
}
```

### 2. Stub

`src/request.go` contains just the signature, the behavioral comment, and a zero-value return:

```go
// parseRequestLine reads the first line of the HTTP request from the reader
// (e.g. "GET /path HTTP/1.1\r\n"), trims the trailing \r\n, splits by space
// into exactly 3 parts, and returns (method, path, version).
// Return an error if the line cannot be read or doesn't have exactly 3 parts.
func parseRequestLine(reader *bufio.Reader) (method, path, version string, err error) {
    // TODO: implement
    return "", "", "", nil
}
```

### 3. Unit test

`src/request_test.go` is committed alongside the stubs. The student can read it.

```go
func TestParseRequestLine(t *testing.T) {
    tests := []struct {
        name              string
        input             string
        method, path, ver string
        wantErr           bool
    }{
        {"simple GET", "GET /hello HTTP/1.1\r\n", "GET", "/hello", "HTTP/1.1", false},
        {"POST", "POST /echo HTTP/1.1\r\n", "POST", "/echo", "HTTP/1.1", false},
        {"root", "GET / HTTP/1.1\r\n", "GET", "/", "HTTP/1.1", false},
        {"malformed", "INVALID\r\n", "", "", "", true},
    }
    for _, tt := range tests {
        // ... standard table-driven test
    }
}
```

### 4. course.yaml entry

```yaml
- id: request-line
  title: "Parse the request line"
  spec: >-
    Implement parseRequestLine: read the first line with reader.ReadString('\n'),
    trim \r\n with strings.TrimRight, split by space with strings.Split into
    exactly 3 parts (method, path, version). Return an error if the line
    doesn't have 3 parts.
  stubs:
    - path: request.go
  tests:
    - type: unit
      match: TestParseRequestLine
      timeout_ms: 5000
  resources:
    - title: "HTTP/1.1 Request format (RFC 7230 §3)"
      file: parsing/request_spec.md
      type: spec
      visible_to: [junior, mid, senior]
    - title: "Signature: parseRequestLine"
      file: parsing/request_line_signature.md
      type: signature
      visible_to: [junior, mid, senior]
    - title: "Hint: ReadString and Split"
      file: parsing/request_line_hint.md
      type: hint
      visible_to: [junior]
```

### 5. Resources

Three markdown files under `resources/parsing/`:

- `request_spec.md` — relevant excerpt of RFC 7230, explained in plain language. Visible to all levels.
- `request_line_signature.md` — the function signature, parameter explanations, and a list of behavioral expectations. Visible to all levels.
- `request_line_hint.md` — step-by-step walkthrough with code snippets. Visible only to juniors.

### 6. What the student sees

A junior student opens the submodule and sees:
- The spec text
- The stub file (`src/request.go`) ready to edit
- All three resources in the sidebar

They edit the stub, click "Run Tests." The platform:
1. Mounts their workspace
2. Runs `go build -o /tmp/program .` (builds, not strictly needed for unit tests but checks the file compiles)
3. Runs `go test -run TestParseRequestLine -v -count=1 .`
4. Streams output to the browser
5. If the exit code is 0: green check, commit, unlock next submodule
6. If non-zero: shows the failed assertions, student fixes and retries

A senior student sees the same submodule but only the spec and signature resources — no hint. Same code to write, less hand-holding.

---

## Common patterns

### Pattern: split a complex function into student-implemented helpers

If the original function does too much for one submodule (e.g. `ParseRequest` parses the request line, headers, AND body), split it into helper functions. Make each helper a separate submodule. The orchestrator function (`ParseRequest`) is **pre-implemented in the stub** and just calls the helpers — that way the student sees how the pieces fit together before implementing them.

### Pattern: testing parsing without a server

Parsing code is naturally tested with `unit` tests, not `http` tests. Use `type: unit` with a Go test that constructs inputs directly and checks return values. No need to start a server, no need to wait for ports. Faster, simpler, and the student sees exactly what's being tested.

### Pattern: testing security with raw TCP

Some security tests can't go through an HTTP client because the client normalizes paths. For example, testing path traversal protection: `curl http://localhost/../../etc/passwd` would get normalized client-side. Use a `script`-type test with `nc` or `/dev/tcp` to send the raw request bytes:

```bash
echo -e "GET /../../etc/passwd HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc localhost 8080
```

### Pattern: stateful tests within a submodule

Need to POST then GET to verify state is preserved? Just declare both tests in order. The platform keeps the same process alive across all tests in a submodule:

```yaml
tests:
  - type: http
    request: { method: POST, path: /items, body: '{"name":"foo"}' }
    expected: { status: 201 }
  - type: http
    request: { method: GET, path: /items/foo }
    expected: { status: 200, body_contains: '"name":"foo"' }
```

### Pattern: persistence/restart tests

When you need to kill the binary and restart it (database persistence, crash recovery), use `script` with `manages_lifecycle: true` and have the script handle the full lifecycle:

```bash
#!/bin/bash
set -e

# Phase 1: write data
$BUILDERSMTY_BINARY --data-dir /tmp/db &
PID=$!
sleep 0.5
curl -X PUT http://localhost:8080/keys/foo -d "bar"
kill $PID
wait $PID 2>/dev/null || true

# Phase 2: restart and verify data persisted
$BUILDERSMTY_BINARY --data-dir /tmp/db &
PID=$!
sleep 0.5
RESULT=$(curl -s http://localhost:8080/keys/foo)
kill $PID

[ "$RESULT" = "bar" ] || { echo "FAIL: data not persisted"; exit 1; }
echo "PASS"
```

### Pattern: progressive refinement within a module

Module 4 (Router) in the HTTP server course is split into two submodules:
1. `register` — implement Handle() and basic dispatch with 404
2. `dispatch` — add 405 Method Not Allowed and Fallback delegation

The student edits the same file (`router.go`) twice. The second submodule's tests build on the first's implementation. This is the right granularity: each submodule is one concept (basic dispatch / extended dispatch), and they compose naturally.

---

## Platform contract reference

This section is for infra developers building or maintaining the platform that runs these courses. It documents the contract the platform must implement.

### Course discovery

The platform reads `courses/*/{lang}/course.yaml` from this repo. Each `course.yaml` is a self-contained course definition. The platform should validate the schema on load and refuse to serve courses with invalid YAML.

### Schema validation

The platform must validate:

- `meta.slug` matches the directory name
- `meta.language` is one of `go | c | python | rust | javascript`
- `meta.difficulty` is one of `beginner | intermediate | advanced`
- Every `stubs[].path` resolves to a file in `src/`
- Every `resources[].file` resolves to a file in `resources/`
- Every `tests[].file` (script tests) resolves to a file in `tests/`
- Every `tests[].type` is one of `unit | stdout | http | tcp | script`
- Every test has the required fields for its type (see TESTS.md)

### Build phase

Per submodule run:

1. Spin up a runner container from the pool, image from `meta.runner`
2. Mount the student's workspace (their fork of `src/`) as a tmpfs
3. Set `BUILDERSMTY_WORKSPACE_DIR` to the workspace path
4. Set `BUILDERSMTY_BINARY` to a sensible default (e.g. `/tmp/program`)
5. Run `build_cmd` (per-submodule override → course-level override → language default)
6. If `build_cmd` exits non-zero, report build failure and stop

### Test dispatch

After a successful build, for each test in `submodule.tests[]` in order:

| Test type | Platform actions |
|---|---|
| `unit` | Run `unit_cmd` with `{match}` interpolated. Pass if exit 0. |
| `stdout` | Spawn `run_cmd` with `stdin` piped in. Capture stdout. Compare against `expected_stdout` (exact, normalized newlines) or `expected_stdout_contains`. |
| `http` | If no binary spawned yet for this submodule, spawn `run_cmd` and wait for the port to bind. Send the HTTP request. Validate `status`, `body_contains`/`body_equals`, `headers`. |
| `tcp` | If no binary spawned yet for this submodule, spawn `run_cmd` and wait for the port. Send raw bytes (`send` or `send_hex`). Validate the response bytes. |
| `script` (default) | If no binary spawned yet for this submodule, spawn `run_cmd` and wait for readiness. Run the script with env vars set (`BUILDERSMTY_BINARY`, `BUILDERSMTY_WORKSPACE_DIR`, `BUILDERSMTY_PROGRAM_PID`). Pass if exit 0. |
| `script` (`manages_lifecycle: true`) | Do NOT spawn the binary. Run the script with `BUILDERSMTY_BINARY` and `BUILDERSMTY_WORKSPACE_DIR` set (no `BUILDERSMTY_PROGRAM_PID`). |

After all tests in a submodule run, send SIGTERM to the spawned binary if any. Wait briefly, then SIGKILL.

### Lifecycle invariants

- **One binary per submodule run.** Tests within the same submodule share a process. Don't restart between tests.
- **Fresh state per submodule run.** A new container, new tmpfs, new build, new binary spawn — every time the student presses "Run Tests."
- **Readiness checks.** For `http` and `tcp` tests, wait until the port is bound before sending the first request. Reasonable timeout (5s default). For `script` tests with platform-spawned binaries, also wait for port readiness if a port is declared anywhere in the submodule's tests; otherwise apply a small fixed delay (e.g. 200ms).
- **Failure modes.** Distinguish "build failed," "binary crashed before becoming ready," "test timeout," and "test assertion failed." Show the right error to the student.

### Integration tests

When all submodules in a module pass, run the module's `integration_test`. Same dispatch model as a submodule test (one entry, one type, one assertion set). Uses the same build/run defaults. Requires a fresh binary spawn — do not reuse a process from the last submodule.

### Resource filtering

When serving resources to a student, filter by `visible_to`:

```
student difficulty = mid
  → return only resources where "mid" is in visible_to
```

A `hint` typed `[junior]` is invisible to a `mid` student even if it's the only resource in the array.

### Language defaults

The platform must ship per-language defaults for `build_cmd`, `run_cmd`, and `unit_cmd`. See the table in [Build and run](#build-and-run-language-defaults) above. These defaults are applied when a course (or submodule) doesn't override them.

Defaults are interpolated with:
- `$BUILDERSMTY_BINARY` — replaced with the actual binary path
- `{match}` — replaced with the test's `match` field (only for `unit_cmd`)

Other env vars in commands (like `$HOME`) are passed through as normal shell expansion.

### Runner image requirements

Runner images must guarantee the following are available:

- The language toolchain (`go`, `cargo`, `python`, etc.)
- `bash`
- `curl`
- `nc` (netcat)
- Standard POSIX utilities (`grep`, `sed`, `awk`, `timeout`)

Anything else is course-specific and either lives in the student's workspace or is the contributor's problem to install via a custom runner.

### Commit workflow

When a student passes all tests in a submodule, commit their workspace to their personal repo with a message like:

```
[course] Pass submodule {course-slug}/{module-id}/{submodule-id}
```

Commits are made by the platform, not the student. The student's git history reflects their progression through the course.

---

## FAQ

### Why no makefiles?

Because every makefile we wrote was either `go build && exec ./binary` or `go test -run TestX -v .`. That's not test logic — it's boilerplate. Forcing contributors to write 15 identical makefiles per course taxed authorship for no benefit. The platform knows the language; it can run the build itself.

The escape hatch is the optional `build_cmd`/`run_cmd`/`unit_cmd` overrides in `meta`. These cover the rare cases where defaults don't fit.

### Why are unit tests in the student's workspace and not hidden?

Because the test code is part of the lesson. A student should be able to read the tests, understand what behavior is being checked, and use that as a specification. Hidden tests force students to guess what's wrong, which is frustrating and unrealistic — real-world TDD means reading the tests.

This also makes it trivial for students to run tests locally before clicking "Run Tests" in the platform. They can iterate fast.

### What if my test needs external services (database, mock API)?

Use `script` type and start the dependencies in the script. For shared dependencies across many tests, consider building a custom runner image that includes them pre-started.

For mocking external HTTP APIs (like a Claude Code clone needing a mocked LLM), the runner image should include the mock server, started as part of container init. The course doesn't need to know about it.

### What if my course needs multiple processes (distributed systems)?

Use `script` type with `manages_lifecycle: true`. The script spawns however many copies of `$BUILDERSMTY_BINARY` it needs, with whatever args, on whatever ports, and tears them all down before exiting.

This is rare. Most courses don't need it.

### Can I use a different language for the test runner than the course?

Yes. `script` tests can be written in any language available in the runner image. Bash, Python, Go, even a compiled binary. The script is just an executable file.

### How do I add a new language?

1. Open a PR in the platform repo adding a `runners/{language}/Dockerfile` and the language defaults (`build_cmd`, `run_cmd`, `unit_cmd`)
2. Publish the runner image to Docker Hub under `buildersmty/runner-{language}:latest`
3. Then open a PR in this repo for your first course in that language

For the first course in a brand-new language, you can include a `Dockerfile` in the course directory while the platform runner image is being set up. Move it out once the official image is published.

### What's the difference between `unit` and `stdout` tests?

`unit` runs the language's native test framework and checks exit code. The student writes test files (`*_test.go`, `test_*.py`, etc.) and the platform invokes the test runner against a named test.

`stdout` spawns the student's binary as a one-shot CLI, optionally pipes stdin, captures stdout, and compares.

Use `unit` for libraries and helpers. Use `stdout` for CLIs that read input and print output (compilers, shells, memory allocators).

### Can the same submodule have both `unit` and `http` tests?

Yes. The platform dispatches each test by its type. `unit` tests don't need the binary spawned; `http` tests do. The platform handles both correctly within the same submodule.

### How do I version a course?

You don't, currently. Courses are updated in place via PRs. CI runs the full test suite against the reference solution to catch regressions. If you need to make a breaking change to an existing course, coordinate with the platform team — students mid-course need a migration path.

---

## Where to go next

- **Formal schema spec**: see `COURSES.md`
- **Test type spec**: see `TESTS.md`
- **An existing course as reference**: `courses/http-server/go/`
- **The platform repo (infra)**: `builders-platform` (separate repo)

If you're stuck or have questions, open an issue with the `course-authoring` label.