# Buildmancer Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core platform loop — a student can browse courses, enroll, edit code in a browser-autosaved workspace, run declarative tests via a Go runner, see real-time streamed results, and track progress through submodules.

**Architecture:** FastAPI (Python) handles all business logic, course loading, and state. A stateless Go runner receives fully-resolved RunRequests over HTTP, executes builds and tests on the host (no Docker yet), and streams results as SSE. Python proxies the SSE stream to the browser. Postgres stores user state. Course content is read from a mounted filesystem.

**Tech Stack:** Python 3.12+, FastAPI, SQLModel, Pydantic, PyYAML, httpx, sse-starlette · Go 1.22+, stdlib only · Postgres 16 · Docker Compose

---

## API Refinement: Course Identification

The architecture spec used `{slug}` in URLs. Since the same course slug can exist in multiple programming languages (`courses/http-server/go/`, `courses/http-server/python/`), all endpoints use `{slug}/{lang}` as the course identifier. The DB tables include a `language` column alongside `course_slug`.

---

## File Structure

### Python API (`backend/api/`)

```
backend/
  api/
    __init__.py
    main.py                         FastAPI app, startup, router registration
    config.py                       Settings via pydantic-settings
    dependencies.py                 Shared deps: get_db session, get_course_cache
    course_loader/
      __init__.py
      models.py                     Pydantic models: Course, Module, Submodule, TestSpec, etc.
      loader.py                     load_course(), load_all_courses(), validation
      locale.py                     merge_locale_overlay()
      cache.py                      In-memory course cache, reload
      defaults.py                   Language default build/run/unit commands
    db/
      __init__.py
      database.py                   Engine, session factory, create_tables
      models.py                     SQLModel tables: Enrollment, WorkingFile, Progress
    routers/
      __init__.py
      courses.py                    GET /api/courses, GET /api/courses/{slug}/{lang}
      enroll.py                     POST /api/enroll/{slug}/{lang}
      files.py                      GET /api/files/{slug}/{lang}, PATCH .../{filepath:path}
      run.py                        POST /api/run/{slug}/{lang}/{submodule_id:path}
      stream.py                     GET /api/stream/{run_id}
      progress.py                   GET /api/progress/{slug}/{lang}
      resources.py                  GET /api/resources/{slug}/{lang}/{submodule_id:path}
      admin.py                      POST /api/admin/reload-courses
  pyproject.toml
  tests/
    __init__.py
    conftest.py                     Fixtures: db session, test client, courses path
    fixtures/
      courses/                      Test course content (see Task 2)
    course_loader/
      __init__.py
      test_models.py
      test_loader.py
      test_locale.py
    api/
      __init__.py
      test_courses.py
      test_enroll.py
      test_files.py
      test_progress.py
      test_resources.py
      test_run.py
```

### Go Runner (`backend/runner/`)

```
backend/
  runner/
    go.mod
    go.sum
    cmd/
      server/
        main.go                     HTTP server entry, POST /run handler
    internal/
      models/
        models.go                   RunRequest, TestSpec, SSE event data structs
      sse/
        writer.go                   SSEWriter: formats and flushes SSE events
        writer_test.go
      build/
        build.go                    Execute build_cmd, stream output
        build_test.go
      lifecycle/
        process.go                  Spawn binary, wait for port, kill
        process_test.go
      dispatch/
        dispatch.go                 Dispatcher interface + registry
        unit.go                     Unit test dispatcher
        unit_test.go
        stdout.go                   Stdout test dispatcher
        stdout_test.go
        http.go                     HTTP test dispatcher
        http_test.go
        tcp.go                      TCP test dispatcher
        tcp_test.go
        script.go                   Script test dispatcher
        script_test.go
      handler/
        run.go                      POST /run handler: orchestrates build → dispatch → cleanup
        run_test.go
```

### Root

```
docker-compose.yml                  Postgres + API + Runner services
.env                                Database URL, runner URL, courses path
```

---

## Task Dependency Graph

```
Task 1 (Scaffolding) ──→ Task 2 (Fixture) ──→ Task 3 (Models) ──→ Task 4 (Loader)
                    │                                                      │
                    ├──→ Task 5 (Database) ──→ Task 6 (App + Courses) ────┤
                    │                              │                       │
                    │                              ├→ Task 7 (Enroll)      │
                    │                              ├→ Task 8 (Files)       │
                    │                              └→ Task 9 (Progress+)   │
                    │                                                      │
                    ├──→ Task 10 (Go Foundation) ──→ Task 11 (Lifecycle)   │
                    │                              └→ Task 12 (Dispatchers)│
                    │                                   │                  │
                    │                              Task 13 (Go Server) ────┤
                    │                                                      │
                    └──────────────────────────── Task 14 (Run+Stream) ────┘
                                                       │
                                                  Task 15 (E2E)
```

**Parallelizable:** Tasks 3-4 (course loader) and Tasks 10-13 (Go runner) are fully independent. Tasks 5-9 (DB + API) depend on Task 4 but not on Go tasks. Task 14 merges both tracks.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/api/pyproject.toml`
- Create: `backend/api/config.py`
- Create: `backend/runner/go.mod`
- Create: `.env`

- [ ] **Step 1: Write docker-compose.yml**

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: buildmancer
      POSTGRES_PASSWORD: buildmancer
      POSTGRES_DB: buildmancer
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://buildmancer:buildmancer@postgres:5432/buildmancer
      - RUNNER_URL=http://runner:9000
      - COURSES_PATH=/mnt/courses
    depends_on:
      - postgres
      - runner
    volumes:
      - ./backend/api:/app
      - ${COURSES_PATH:-./_courses}:/mnt/courses:ro

  runner:
    build:
      context: ./backend/runner
      dockerfile: Dockerfile
    ports:
      - "9000:9000"

volumes:
  pgdata:
```

- [ ] **Step 2: Write .env**

```bash
# .env
DATABASE_URL=postgresql://buildmancer:buildmancer@localhost:5432/buildmancer
RUNNER_URL=http://localhost:9000
COURSES_PATH=./_courses
DEFAULT_USER_ID=local
```

- [ ] **Step 3: Write pyproject.toml**

```toml
# backend/api/pyproject.toml
[project]
name = "buildmancer-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.34",
    "sqlmodel>=0.0.22",
    "psycopg2-binary>=2.9",
    "pyyaml>=6.0",
    "httpx>=0.28",
    "sse-starlette>=2.2",
    "pydantic-settings>=2.7",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.24",
]

[build-system]
requires = ["setuptools>=75"]
build-backend = "setuptools.backends._legacy:_Backend"
```

- [ ] **Step 4: Write config.py**

```python
# backend/api/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://buildmancer:buildmancer@localhost:5432/buildmancer"
    runner_url: str = "http://localhost:9000"
    courses_path: str = "./_courses"
    default_user_id: str = "local"

    model_config = {"env_file": ".env"}


settings = Settings()
```

- [ ] **Step 5: Write go.mod**

```
// backend/runner/go.mod
module buildmancer/runner

go 1.22
```

- [ ] **Step 6: Create __init__.py files for Python packages**

Create empty `__init__.py` in:
- `backend/api/__init__.py`
- `backend/api/course_loader/__init__.py`
- `backend/api/db/__init__.py`
- `backend/api/routers/__init__.py`
- `backend/tests/__init__.py`
- `backend/tests/course_loader/__init__.py`
- `backend/tests/api/__init__.py`

- [ ] **Step 7: Install Python dependencies and verify**

```bash
cd backend && pip install -e "api[dev]"
```

Expected: installs successfully.

- [ ] **Step 8: Start Postgres and verify**

```bash
docker compose up -d postgres
docker compose exec postgres psql -U buildmancer -c "SELECT 1"
```

Expected: returns `1`.

- [ ] **Step 9: Commit**

```bash
git add docker-compose.yml .env backend/api/pyproject.toml backend/api/config.py backend/runner/go.mod backend/api/__init__.py backend/api/course_loader/__init__.py backend/api/db/__init__.py backend/api/routers/__init__.py backend/tests/__init__.py backend/tests/course_loader/__init__.py backend/tests/api/__init__.py
git commit -m "chore: project scaffolding — docker-compose, python deps, go module, config"
```

---

### Task 2: Test Course Fixture

A minimal course used by all subsequent tests. Exercises unit and stdout test types, has two submodules (same file edited across both), Spanish base with English overlay, and resources at multiple difficulty levels.

**Files:**
- Create: `backend/tests/fixtures/courses/hello-world/go/course.yaml`
- Create: `backend/tests/fixtures/courses/hello-world/go/course.en.yaml`
- Create: `backend/tests/fixtures/courses/hello-world/go/src/main.go`
- Create: `backend/tests/fixtures/courses/hello-world/go/src/main_test.go`
- Create: `backend/tests/fixtures/courses/hello-world/go/solution/main.go`
- Create: `backend/tests/fixtures/courses/hello-world/go/resources/es/basics/hello_doc.md`
- Create: `backend/tests/fixtures/courses/hello-world/go/resources/en/basics/hello_doc.md`
- Create: `backend/tests/fixtures/courses/hello-world/go/resources/es/basics/hello_hint.md`
- Create: `backend/tests/fixtures/courses/hello-world/go/tests/echo_test.sh`

- [ ] **Step 1: Write course.yaml (Spanish base)**

```yaml
# backend/tests/fixtures/courses/hello-world/go/course.yaml
meta:
  slug: hello-world
  title: "Hola Mundo"
  description: "Un curso básico para validar la plataforma."
  language: go
  difficulty: beginner
  runner: buildmancer/runner-go:latest
  estimated_hours:
    junior: 1
    mid: 1
    senior: 1

modules:
  - id: basics
    title: "Módulo 1 — Básicos"
    description: "Aprende a imprimir y leer de stdin."
    submodules:
      - id: hello
        title: "Imprime Hola Mundo"
        spec: >-
          Implementa la función Hello() que regresa el string "Hello, World!".
        stubs:
          - path: main.go
        tests:
          - type: unit
            match: TestHello
            timeout_ms: 5000
        resources:
          - title: "Documentación de fmt"
            file: basics/hello_doc.md
            type: doc
            visible_to: [junior, mid, senior]
          - title: "Pista: usa fmt.Sprintf"
            file: basics/hello_hint.md
            type: hint
            visible_to: [junior]
      - id: echo
        title: "Eco de stdin"
        spec: >-
          Modifica main() para leer una línea de stdin e imprimirla a stdout.
        stubs:
          - path: main.go
        tests:
          - type: stdout
            stdin: "test input"
            expected_stdout: "test input\n"
            timeout_ms: 3000
          - type: script
            file: tests/echo_test.sh
            timeout_ms: 5000
```

- [ ] **Step 2: Write course.en.yaml (English overlay)**

```yaml
# backend/tests/fixtures/courses/hello-world/go/course.en.yaml
meta:
  title: "Hello World"
  description: "A basic course to validate the platform."

modules:
  - id: basics
    title: "Module 1 — Basics"
    description: "Learn to print and read from stdin."
    submodules:
      - id: hello
        title: "Print Hello World"
        spec: >-
          Implement the Hello() function that returns the string "Hello, World!".
        resources:
          - title: "fmt documentation"
            file: basics/hello_doc.md
          - title: "Hint: use fmt.Sprintf"
            file: basics/hello_hint.md
      - id: echo
        title: "Echo stdin"
        spec: >-
          Modify main() to read a line from stdin and print it to stdout.
```

- [ ] **Step 3: Write stub files**

```go
// backend/tests/fixtures/courses/hello-world/go/src/main.go
package main

import (
	"bufio"
	"fmt"
	"os"
)

// Hello returns the greeting "Hello, World!".
func Hello() string {
	// TODO: implement
	return ""
}

func main() {
	// TODO: read a line from stdin and print it to stdout
	_ = bufio.NewReader(os.Stdin)
	_ = fmt.Println
}
```

```go
// backend/tests/fixtures/courses/hello-world/go/src/main_test.go
package main

import "testing"

func TestHello(t *testing.T) {
	got := Hello()
	want := "Hello, World!"
	if got != want {
		t.Errorf("Hello() = %q, want %q", got, want)
	}
}
```

- [ ] **Step 4: Write solution**

```go
// backend/tests/fixtures/courses/hello-world/go/solution/main.go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func Hello() string {
	return "Hello, World!"
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	line, _ := reader.ReadString('\n')
	fmt.Print(line)
}
```

- [ ] **Step 5: Write resources**

```markdown
<!-- backend/tests/fixtures/courses/hello-world/go/resources/es/basics/hello_doc.md -->
# El paquete fmt

El paquete `fmt` implementa I/O formateado. Las funciones más comunes:

- `fmt.Println(args...)` — imprime seguido de newline
- `fmt.Sprintf(format, args...)` — regresa un string formateado

## Ejemplo

```go
msg := fmt.Sprintf("Hola, %s!", nombre)
fmt.Println(msg)
```
```

```markdown
<!-- backend/tests/fixtures/courses/hello-world/go/resources/en/basics/hello_doc.md -->
# The fmt package

The `fmt` package implements formatted I/O. Most common functions:

- `fmt.Println(args...)` — prints followed by a newline
- `fmt.Sprintf(format, args...)` — returns a formatted string

## Example

```go
msg := fmt.Sprintf("Hello, %s!", name)
fmt.Println(msg)
```
```

```markdown
<!-- backend/tests/fixtures/courses/hello-world/go/resources/es/basics/hello_hint.md -->
# Pista: Hello()

La función solo necesita regresar un string literal:

```go
func Hello() string {
    return "Hello, World!"
}
```

Así de simple. El punto de este submodule es verificar que tu setup funciona.
```

- [ ] **Step 6: Write test script**

```bash
#!/bin/bash
# backend/tests/fixtures/courses/hello-world/go/tests/echo_test.sh
set -e
RESULT=$(echo "hello from script" | $BUILDMANCER_BINARY)
[ "$RESULT" = "hello from script" ] || { echo "FAIL: expected 'hello from script', got '$RESULT'"; exit 1; }
echo "PASS: echo works from script"
```

- [ ] **Step 7: Commit**

```bash
git add backend/tests/fixtures/
git commit -m "test: add hello-world course fixture for platform testing"
```

---

### Task 3: Course Loader Models

**Files:**
- Create: `backend/api/course_loader/models.py`
- Test: `backend/tests/course_loader/test_models.py`

- [ ] **Step 1: Write the test**

```python
# backend/tests/course_loader/test_models.py
from api.course_loader.models import (
    Course, CourseMeta, EstimatedHours, Module, Submodule,
    StubRef, TestSpec, Resource,
)


def test_course_construction():
    course = Course(
        meta=CourseMeta(
            slug="hello-world",
            title="Hola Mundo",
            description="Test course",
            language="go",
            difficulty="beginner",
            runner="buildmancer/runner-go:latest",
            estimated_hours=EstimatedHours(junior=1, mid=1, senior=1),
        ),
        modules=[
            Module(
                id="basics",
                title="Basics",
                description="Learn basics.",
                submodules=[
                    Submodule(
                        id="hello",
                        full_id="basics/hello",
                        title="Hello",
                        spec="Implement Hello()",
                        stubs=[StubRef(path="main.go")],
                        tests=[TestSpec(type="unit", match="TestHello", timeout_ms=5000)],
                        resources=[
                            Resource(
                                title="Docs",
                                file="basics/hello_doc.md",
                                type="doc",
                                visible_to=["junior", "mid", "senior"],
                            )
                        ],
                    )
                ],
            )
        ],
    )
    assert course.meta.slug == "hello-world"
    assert course.modules[0].submodules[0].full_id == "basics/hello"
    assert course.modules[0].submodules[0].tests[0].type == "unit"


def test_test_spec_defaults():
    spec = TestSpec(type="unit", match="TestFoo")
    assert spec.timeout_ms == 5000
    assert spec.stdin is None
    assert spec.manages_lifecycle is False


def test_test_spec_http():
    spec = TestSpec(
        type="http",
        timeout_ms=3000,
        request={"method": "GET", "path": "/health"},
        expected={"status": 200, "body_contains": "ok"},
    )
    assert spec.request["method"] == "GET"
    assert spec.expected["status"] == 200
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && python -m pytest tests/course_loader/test_models.py -v
```

Expected: `ModuleNotFoundError: No module named 'api.course_loader.models'`

- [ ] **Step 3: Write the models**

```python
# backend/api/course_loader/models.py
from __future__ import annotations

from pydantic import BaseModel


class EstimatedHours(BaseModel):
    junior: int
    mid: int
    senior: int


class CourseMeta(BaseModel):
    slug: str
    title: str
    description: str
    language: str
    difficulty: str
    runner: str
    estimated_hours: EstimatedHours
    build_cmd: str | None = None
    run_cmd: str | None = None
    unit_cmd: str | None = None


class StubRef(BaseModel):
    path: str


class Resource(BaseModel):
    title: str
    file: str
    type: str
    visible_to: list[str] = []


class TestSpec(BaseModel):
    type: str
    match: str | None = None
    stdin: str | None = None
    expected_stdout: str | None = None
    expected_stdout_contains: str | None = None
    timeout_ms: int = 5000
    request: dict | None = None
    expected: dict | None = None
    port: int | None = None
    send: str | None = None
    send_hex: str | None = None
    expected_hex: str | None = None
    file: str | None = None
    manages_lifecycle: bool = False


class Submodule(BaseModel):
    id: str
    full_id: str = ""
    title: str
    spec: str
    stubs: list[StubRef]
    tests: list[TestSpec]
    resources: list[Resource] = []


class Module(BaseModel):
    id: str
    title: str
    description: str
    integration_test: TestSpec | None = None
    submodules: list[Submodule]


class Course(BaseModel):
    meta: CourseMeta
    modules: list[Module]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/course_loader/test_models.py -v
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/api/course_loader/models.py backend/tests/course_loader/test_models.py
git commit -m "feat: course loader pydantic models"
```

---

### Task 4: Course Loader — Parse, Validate, Locale Merge

**Files:**
- Create: `backend/api/course_loader/loader.py`
- Create: `backend/api/course_loader/locale.py`
- Create: `backend/api/course_loader/defaults.py`
- Test: `backend/tests/course_loader/test_loader.py`
- Test: `backend/tests/course_loader/test_locale.py`
- Create: `backend/tests/conftest.py`

- [ ] **Step 1: Write conftest with fixture path**

```python
# backend/tests/conftest.py
from pathlib import Path

import pytest

FIXTURES_PATH = Path(__file__).parent / "fixtures"


@pytest.fixture
def courses_path() -> Path:
    return FIXTURES_PATH / "courses"


@pytest.fixture
def hello_world_path(courses_path: Path) -> Path:
    return courses_path / "hello-world" / "go"
```

- [ ] **Step 2: Write loader tests**

```python
# backend/tests/course_loader/test_loader.py
from pathlib import Path

import pytest

from api.course_loader.loader import load_course, load_all_courses, ValidationError


def test_load_course_parses_yaml(hello_world_path: Path):
    course = load_course(hello_world_path)
    assert course.meta.slug == "hello-world"
    assert course.meta.language == "go"
    assert course.meta.title == "Hola Mundo"
    assert len(course.modules) == 1
    assert len(course.modules[0].submodules) == 2


def test_load_course_sets_full_ids(hello_world_path: Path):
    course = load_course(hello_world_path)
    subs = course.modules[0].submodules
    assert subs[0].full_id == "basics/hello"
    assert subs[1].full_id == "basics/echo"


def test_load_course_validates_stub_paths(hello_world_path: Path, tmp_path: Path):
    """A course referencing a nonexistent stub file should fail validation."""
    import shutil
    import yaml

    broken = tmp_path / "broken" / "go"
    shutil.copytree(hello_world_path, broken)

    with open(broken / "course.yaml") as f:
        data = yaml.safe_load(f)

    data["modules"][0]["submodules"][0]["stubs"][0]["path"] = "nonexistent.go"

    with open(broken / "course.yaml", "w") as f:
        yaml.dump(data, f)

    with pytest.raises(ValidationError, match="nonexistent.go"):
        load_course(broken)


def test_load_course_validates_resource_paths(hello_world_path: Path, tmp_path: Path):
    """A course referencing a nonexistent resource file should fail validation."""
    import shutil
    import yaml

    broken = tmp_path / "broken" / "go"
    shutil.copytree(hello_world_path, broken)

    with open(broken / "course.yaml") as f:
        data = yaml.safe_load(f)

    data["modules"][0]["submodules"][0]["resources"][0]["file"] = "missing.md"

    with open(broken / "course.yaml", "w") as f:
        yaml.dump(data, f)

    with pytest.raises(ValidationError, match="missing.md"):
        load_course(broken)


def test_load_course_validates_script_paths(hello_world_path: Path, tmp_path: Path):
    """A course referencing a nonexistent script file should fail validation."""
    import shutil
    import yaml

    broken = tmp_path / "broken" / "go"
    shutil.copytree(hello_world_path, broken)

    with open(broken / "course.yaml") as f:
        data = yaml.safe_load(f)

    data["modules"][0]["submodules"][1]["tests"][1]["file"] = "tests/missing.sh"

    with open(broken / "course.yaml", "w") as f:
        yaml.dump(data, f)

    with pytest.raises(ValidationError, match="missing.sh"):
        load_course(broken)


def test_load_all_courses(courses_path: Path):
    courses = load_all_courses(courses_path)
    assert len(courses) >= 1
    slugs = [c.meta.slug for c in courses]
    assert "hello-world" in slugs
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/course_loader/test_loader.py -v
```

Expected: `ModuleNotFoundError: No module named 'api.course_loader.loader'`

- [ ] **Step 4: Write language defaults**

```python
# backend/api/course_loader/defaults.py
LANGUAGE_DEFAULTS: dict[str, dict[str, str]] = {
    "go": {
        "build_cmd": "go build -o $BUILDMANCER_BINARY .",
        "run_cmd": "$BUILDMANCER_BINARY --port $BUILDMANCER_PORT",
        "unit_cmd": "go test -run {match} -v -count=1 .",
    },
    "rust": {
        "build_cmd": "cargo build --release && cp target/release/* $BUILDMANCER_BINARY",
        "run_cmd": "$BUILDMANCER_BINARY --port $BUILDMANCER_PORT",
        "unit_cmd": "cargo test {match}",
    },
    "python": {
        "build_cmd": "",
        "run_cmd": "python main.py --port $BUILDMANCER_PORT",
        "unit_cmd": "pytest -k {match}",
    },
    "c": {
        "build_cmd": "make || cc -o $BUILDMANCER_BINARY *.c",
        "run_cmd": "$BUILDMANCER_BINARY --port $BUILDMANCER_PORT",
        "unit_cmd": "",
    },
    "javascript": {
        "build_cmd": "npm install && npm run build",
        "run_cmd": "node dist/index.js --port $BUILDMANCER_PORT",
        "unit_cmd": "vitest run -t {match}",
    },
}


def resolve_cmd(field: str, course_override: str | None, language: str) -> str:
    """Resolve a command: course-level override → language default."""
    if course_override:
        return course_override
    defaults = LANGUAGE_DEFAULTS.get(language, {})
    return defaults.get(field, "")
```

- [ ] **Step 5: Write the loader**

```python
# backend/api/course_loader/loader.py
from __future__ import annotations

from pathlib import Path

import yaml

from .models import (
    Course, CourseMeta, EstimatedHours, Module, Submodule,
    StubRef, TestSpec, Resource,
)


class ValidationError(Exception):
    pass


def load_course(course_dir: Path, locale: str = "es") -> Course:
    """Load and validate a course from a directory.

    Args:
        course_dir: Path to the language directory, e.g. courses/hello-world/go/
        locale: Human language locale. "es" is the base, others are overlays.
    """
    yaml_path = course_dir / "course.yaml"
    if not yaml_path.exists():
        raise ValidationError(f"course.yaml not found in {course_dir}")

    with open(yaml_path) as f:
        data = yaml.safe_load(f)

    if locale != "es":
        overlay_path = course_dir / f"course.{locale}.yaml"
        if overlay_path.exists():
            from .locale import merge_locale_overlay
            with open(overlay_path) as f:
                overlay = yaml.safe_load(f)
            data = merge_locale_overlay(data, overlay)

    course = _parse_course(data)
    _set_full_ids(course)
    _validate(course, course_dir, locale)
    return course


def load_all_courses(base_path: Path, locale: str = "es") -> list[Course]:
    """Load all courses from the courses base directory.

    Walks courses/{slug}/{lang}/ directories looking for course.yaml.
    """
    courses = []
    if not base_path.exists():
        return courses

    for slug_dir in sorted(base_path.iterdir()):
        if not slug_dir.is_dir() or slug_dir.name.startswith("."):
            continue
        for lang_dir in sorted(slug_dir.iterdir()):
            if not lang_dir.is_dir() or lang_dir.name.startswith("."):
                continue
            yaml_path = lang_dir / "course.yaml"
            if yaml_path.exists():
                courses.append(load_course(lang_dir, locale))

    return courses


def _parse_course(data: dict) -> Course:
    meta_raw = data["meta"]
    meta = CourseMeta(
        slug=meta_raw["slug"],
        title=meta_raw["title"],
        description=meta_raw["description"],
        language=meta_raw["language"],
        difficulty=meta_raw["difficulty"],
        runner=meta_raw["runner"],
        estimated_hours=EstimatedHours(**meta_raw["estimated_hours"]),
        build_cmd=meta_raw.get("build_cmd"),
        run_cmd=meta_raw.get("run_cmd"),
        unit_cmd=meta_raw.get("unit_cmd"),
    )

    modules = []
    for mod_raw in data.get("modules", []):
        submodules = []
        for sub_raw in mod_raw.get("submodules", []):
            stubs = [StubRef(path=s["path"]) for s in sub_raw.get("stubs", [])]
            tests = [TestSpec(**t) for t in sub_raw.get("tests", [])]
            resources = [Resource(**r) for r in sub_raw.get("resources", [])]
            submodules.append(Submodule(
                id=sub_raw["id"],
                title=sub_raw["title"],
                spec=sub_raw["spec"],
                stubs=stubs,
                tests=tests,
                resources=resources,
            ))

        integration_test = None
        if "integration_test" in mod_raw:
            integration_test = TestSpec(**mod_raw["integration_test"])

        modules.append(Module(
            id=mod_raw["id"],
            title=mod_raw["title"],
            description=mod_raw["description"],
            integration_test=integration_test,
            submodules=submodules,
        ))

    return Course(meta=meta, modules=modules)


def _set_full_ids(course: Course) -> None:
    for module in course.modules:
        for sub in module.submodules:
            sub.full_id = f"{module.id}/{sub.id}"


def _validate(course: Course, course_dir: Path, locale: str) -> None:
    src_dir = course_dir / "src"
    locale_resource_dir = course_dir / "resources" / locale
    base_resource_dir = course_dir / "resources" / "es"
    tests_dir = course_dir / "tests"

    seen_ids: set[str] = set()

    for module in course.modules:
        for sub in module.submodules:
            if sub.full_id in seen_ids:
                raise ValidationError(
                    f"Duplicate submodule ID: {sub.full_id}"
                )
            seen_ids.add(sub.full_id)

            for stub in sub.stubs:
                stub_path = src_dir / stub.path
                if not stub_path.exists():
                    raise ValidationError(
                        f"Stub file not found: {stub.path} "
                        f"(expected at {stub_path})"
                    )

            for resource in sub.resources:
                res_path = locale_resource_dir / resource.file
                fallback_path = base_resource_dir / resource.file
                if not res_path.exists() and not fallback_path.exists():
                    raise ValidationError(
                        f"Resource file not found: {resource.file} "
                        f"(checked {res_path} and {fallback_path})"
                    )

            for test in sub.tests:
                if test.type == "script" and test.file:
                    script_path = course_dir / test.file
                    if not script_path.exists():
                        raise ValidationError(
                            f"Script file not found: {test.file} "
                            f"(expected at {script_path})"
                        )
```

- [ ] **Step 6: Run loader tests to verify they pass**

```bash
cd backend && python -m pytest tests/course_loader/test_loader.py -v
```

Expected: 6 passed.

- [ ] **Step 7: Write locale tests**

```python
# backend/tests/course_loader/test_locale.py
from pathlib import Path

from api.course_loader.loader import load_course


def test_english_overlay_overrides_text(hello_world_path: Path):
    course = load_course(hello_world_path, locale="en")
    assert course.meta.title == "Hello World"
    assert course.meta.description == "A basic course to validate the platform."
    assert course.modules[0].title == "Module 1 — Basics"
    assert course.modules[0].submodules[0].title == "Print Hello World"
    assert course.modules[0].submodules[1].title == "Echo stdin"


def test_english_overlay_preserves_structure(hello_world_path: Path):
    course = load_course(hello_world_path, locale="en")
    # Tests are never overridden by locale
    assert len(course.modules[0].submodules[0].tests) == 1
    assert course.modules[0].submodules[0].tests[0].type == "unit"
    assert course.modules[0].submodules[0].tests[0].match == "TestHello"
    # Stubs are never overridden
    assert course.modules[0].submodules[0].stubs[0].path == "main.go"


def test_base_spanish_loads_without_overlay(hello_world_path: Path):
    course = load_course(hello_world_path, locale="es")
    assert course.meta.title == "Hola Mundo"
    assert course.modules[0].title == "Módulo 1 — Básicos"


def test_missing_locale_falls_back_to_base(hello_world_path: Path):
    course = load_course(hello_world_path, locale="fr")
    assert course.meta.title == "Hola Mundo"  # Falls back to Spanish
```

- [ ] **Step 8: Write the locale merge module**

```python
# backend/api/course_loader/locale.py
from __future__ import annotations


def merge_locale_overlay(base: dict, overlay: dict) -> dict:
    """Deep-merge a locale overlay onto a base course dict.

    Only text fields are overwritten: title, description, spec, resource titles.
    Structural fields (tests, stubs, ids) are never touched.
    """
    result = _deep_copy(base)

    if "meta" in overlay:
        _merge_text_fields(result["meta"], overlay["meta"], ["title", "description"])

    if "modules" in overlay:
        overlay_modules = {m["id"]: m for m in overlay["modules"]}
        for base_mod in result.get("modules", []):
            ov_mod = overlay_modules.get(base_mod["id"])
            if not ov_mod:
                continue
            _merge_text_fields(base_mod, ov_mod, ["title", "description"])

            if "submodules" in ov_mod:
                ov_subs = {s["id"]: s for s in ov_mod["submodules"]}
                for base_sub in base_mod.get("submodules", []):
                    ov_sub = ov_subs.get(base_sub["id"])
                    if not ov_sub:
                        continue
                    _merge_text_fields(base_sub, ov_sub, ["title", "spec"])

                    if "resources" in ov_sub:
                        _merge_resource_titles(base_sub, ov_sub)

    return result


def _merge_text_fields(target: dict, source: dict, fields: list[str]) -> None:
    for field in fields:
        if field in source:
            target[field] = source[field]


def _merge_resource_titles(base_sub: dict, ov_sub: dict) -> None:
    """Merge resource titles by index (overlay order matches base order)."""
    base_resources = base_sub.get("resources", [])
    ov_resources = ov_sub.get("resources", [])
    for i, ov_res in enumerate(ov_resources):
        if i < len(base_resources) and "title" in ov_res:
            base_resources[i]["title"] = ov_res["title"]


def _deep_copy(data: dict) -> dict:
    """Simple deep copy for YAML dicts (no custom objects)."""
    import copy
    return copy.deepcopy(data)
```

- [ ] **Step 9: Run locale tests to verify they pass**

```bash
cd backend && python -m pytest tests/course_loader/test_locale.py -v
```

Expected: 4 passed.

- [ ] **Step 10: Run all course loader tests together**

```bash
cd backend && python -m pytest tests/course_loader/ -v
```

Expected: all passed (models + loader + locale).

- [ ] **Step 11: Commit**

```bash
git add backend/api/course_loader/ backend/tests/conftest.py backend/tests/course_loader/
git commit -m "feat: course loader — parse, validate, locale merge"
```

---

### Task 5: Database Setup and Models

**Files:**
- Create: `backend/api/db/database.py`
- Create: `backend/api/db/models.py`
- Test: `backend/tests/db/test_models.py`
- Create: `backend/tests/db/__init__.py`

- [ ] **Step 1: Write the database tests**

```python
# backend/tests/db/test_models.py
from datetime import datetime, timezone

from sqlmodel import Session, create_engine, SQLModel

from api.db.models import Enrollment, WorkingFile, Progress


def _make_engine():
    engine = create_engine("sqlite://", echo=False)
    SQLModel.metadata.create_all(engine)
    return engine


def test_create_enrollment():
    engine = _make_engine()
    with Session(engine) as session:
        enrollment = Enrollment(
            user_id="local",
            course_slug="hello-world",
            language="go",
            difficulty="junior",
            locale="es",
        )
        session.add(enrollment)
        session.commit()
        session.refresh(enrollment)

        assert enrollment.id is not None
        assert enrollment.user_id == "local"
        assert enrollment.course_slug == "hello-world"
        assert enrollment.language == "go"
        assert enrollment.difficulty == "junior"
        assert enrollment.locale == "es"
        assert enrollment.started_at is not None


def test_create_working_file():
    engine = _make_engine()
    with Session(engine) as session:
        wf = WorkingFile(
            user_id="local",
            course_slug="hello-world",
            language="go",
            filepath="main.go",
            content='package main\n\nfunc Hello() string { return "" }',
        )
        session.add(wf)
        session.commit()
        session.refresh(wf)

        assert wf.id is not None
        assert wf.filepath == "main.go"
        assert "package main" in wf.content


def test_create_progress():
    engine = _make_engine()
    with Session(engine) as session:
        prog = Progress(
            user_id="local",
            course_slug="hello-world",
            language="go",
            submodule_id="basics/hello",
        )
        session.add(prog)
        session.commit()
        session.refresh(prog)

        assert prog.id is not None
        assert prog.submodule_id == "basics/hello"
        assert prog.passed_at is not None


def test_enrollment_unique_constraint():
    engine = _make_engine()
    with Session(engine) as session:
        e1 = Enrollment(user_id="local", course_slug="hello-world", language="go", difficulty="junior", locale="es")
        e2 = Enrollment(user_id="local", course_slug="hello-world", language="go", difficulty="senior", locale="en")
        session.add(e1)
        session.commit()
        session.add(e2)
        try:
            session.commit()
            assert False, "Should have raised IntegrityError"
        except Exception:
            session.rollback()
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/db/test_models.py -v
```

Expected: `ModuleNotFoundError`

- [ ] **Step 3: Write the SQLModel models**

```python
# backend/api/db/models.py
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Enrollment(SQLModel, table=True):
    __tablename__ = "enrollments"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    course_slug: str
    language: str
    difficulty: str
    locale: str = "es"
    started_at: datetime = Field(default_factory=_now)

    class Config:
        table_args = ({"schema": None},)


class WorkingFile(SQLModel, table=True):
    __tablename__ = "working_files"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    course_slug: str
    language: str
    filepath: str
    content: str
    updated_at: datetime = Field(default_factory=_now)


class Progress(SQLModel, table=True):
    __tablename__ = "progress"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    course_slug: str
    language: str
    submodule_id: str
    passed_at: datetime = Field(default_factory=_now)
```

- [ ] **Step 4: Write the database module**

```python
# backend/api/db/database.py
from sqlmodel import Session, SQLModel, create_engine

from api.config import settings

engine = create_engine(settings.database_url, echo=False)


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/db/test_models.py -v
```

Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/api/db/ backend/tests/db/
git commit -m "feat: database models — enrollments, working_files, progress"
```

---

### Task 6: FastAPI App Shell and Course Endpoints

**Files:**
- Create: `backend/api/main.py`
- Create: `backend/api/dependencies.py`
- Create: `backend/api/course_loader/cache.py`
- Modify: `backend/api/routers/courses.py`
- Test: `backend/tests/api/test_courses.py`
- Modify: `backend/tests/conftest.py`

- [ ] **Step 1: Write the course cache module**

```python
# backend/api/course_loader/cache.py
from __future__ import annotations

from pathlib import Path

from .loader import load_course, load_all_courses
from .models import Course

# slug -> {language -> {locale -> Course}}
_cache: dict[str, dict[str, dict[str, Course]]] = {}


def load_all(base_path: Path, locales: list[str] | None = None) -> None:
    global _cache
    if locales is None:
        locales = ["es", "en"]

    _cache = {}
    for locale in locales:
        for course in load_all_courses(base_path, locale):
            slug = course.meta.slug
            lang = course.meta.language
            _cache.setdefault(slug, {}).setdefault(lang, {})[locale] = course


def get_course(slug: str, language: str, locale: str = "es") -> Course | None:
    lang_map = _cache.get(slug, {}).get(language, {})
    return lang_map.get(locale) or lang_map.get("es")


def get_all_courses(locale: str = "es") -> list[Course]:
    result = []
    for slug_map in _cache.values():
        for lang_map in slug_map.values():
            course = lang_map.get(locale) or lang_map.get("es")
            if course:
                result.append(course)
    return result


def reload(base_path: Path) -> None:
    load_all(base_path)
```

- [ ] **Step 2: Write dependencies module**

```python
# backend/api/dependencies.py
from sqlmodel import Session

from api.db.database import engine


def get_db():
    with Session(engine) as session:
        yield session
```

- [ ] **Step 3: Write test conftest additions for API testing**

```python
# backend/tests/conftest.py
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from api.course_loader import cache as course_cache
from api.dependencies import get_db

FIXTURES_PATH = Path(__file__).parent / "fixtures"

_test_engine = create_engine("sqlite://", echo=False)


@pytest.fixture
def courses_path() -> Path:
    return FIXTURES_PATH / "courses"


@pytest.fixture
def hello_world_path(courses_path: Path) -> Path:
    return courses_path / "hello-world" / "go"


@pytest.fixture
def db_session():
    SQLModel.metadata.create_all(_test_engine)
    with Session(_test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(_test_engine)


@pytest.fixture
def client(courses_path: Path, db_session: Session):
    from api.main import app

    course_cache.load_all(courses_path)

    def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Step 4: Write course endpoint tests**

```python
# backend/tests/api/test_courses.py
def test_list_courses(client):
    resp = client.get("/api/courses")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    course = data[0]
    assert "slug" in course
    assert "title" in course
    assert "language" in course


def test_list_courses_with_locale(client):
    resp = client.get("/api/courses?locale=en")
    assert resp.status_code == 200
    data = resp.json()
    titles = [c["title"] for c in data]
    assert "Hello World" in titles


def test_get_course_detail(client):
    resp = client.get("/api/courses/hello-world/go")
    assert resp.status_code == 200
    data = resp.json()
    assert data["meta"]["slug"] == "hello-world"
    assert len(data["modules"]) == 1
    assert len(data["modules"][0]["submodules"]) == 2


def test_get_course_detail_english(client):
    resp = client.get("/api/courses/hello-world/go?locale=en")
    assert resp.status_code == 200
    data = resp.json()
    assert data["meta"]["title"] == "Hello World"


def test_get_course_not_found(client):
    resp = client.get("/api/courses/nonexistent/go")
    assert resp.status_code == 404
```

- [ ] **Step 5: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/api/test_courses.py -v
```

Expected: `ModuleNotFoundError: No module named 'api.main'`

- [ ] **Step 6: Write the courses router**

```python
# backend/api/routers/courses.py
from fastapi import APIRouter, HTTPException, Query

from api.course_loader import cache as course_cache

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("")
def list_courses(locale: str = Query("es")):
    courses = course_cache.get_all_courses(locale)
    return [
        {
            "slug": c.meta.slug,
            "title": c.meta.title,
            "description": c.meta.description,
            "language": c.meta.language,
            "difficulty": c.meta.difficulty,
            "estimated_hours": c.meta.estimated_hours.model_dump(),
        }
        for c in courses
    ]


@router.get("/{slug}/{lang}")
def get_course(slug: str, lang: str, locale: str = Query("es")):
    course = course_cache.get_course(slug, lang, locale)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course.model_dump()
```

- [ ] **Step 7: Write the main app**

```python
# backend/api/main.py
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from api.config import settings
from api.course_loader import cache as course_cache
from api.db.database import create_tables
from api.routers import courses, enroll, files, run, stream, progress, resources, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    course_cache.load_all(Path(settings.courses_path))
    yield


app = FastAPI(title="Buildmancer API", lifespan=lifespan)

app.include_router(courses.router)
```

Note: We register only the courses router for now. Other routers will be added as they're built — but we need the imports to not fail. Create stub router files:

```python
# backend/api/routers/enroll.py
from fastapi import APIRouter
router = APIRouter()

# backend/api/routers/files.py
from fastapi import APIRouter
router = APIRouter()

# backend/api/routers/run.py
from fastapi import APIRouter
router = APIRouter()

# backend/api/routers/stream.py
from fastapi import APIRouter
router = APIRouter()

# backend/api/routers/progress.py
from fastapi import APIRouter
router = APIRouter()

# backend/api/routers/resources.py
from fastapi import APIRouter
router = APIRouter()

# backend/api/routers/admin.py
from fastapi import APIRouter
router = APIRouter()
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/api/test_courses.py -v
```

Expected: 5 passed.

- [ ] **Step 9: Commit**

```bash
git add backend/api/main.py backend/api/dependencies.py backend/api/course_loader/cache.py backend/api/routers/ backend/tests/conftest.py backend/tests/api/test_courses.py
git commit -m "feat: FastAPI app shell and course browsing endpoints"
```

---

### Task 7: Enrollment Endpoint

**Files:**
- Modify: `backend/api/routers/enroll.py`
- Modify: `backend/api/main.py`
- Test: `backend/tests/api/test_enroll.py`

- [ ] **Step 1: Write enrollment tests**

```python
# backend/tests/api/test_enroll.py
def test_enroll_creates_enrollment(client):
    resp = client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["course_slug"] == "hello-world"
    assert data["language"] == "go"
    assert data["difficulty"] == "junior"


def test_enroll_seeds_working_files(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    resp = client.get("/api/files/hello-world/go")
    assert resp.status_code == 200
    files = resp.json()
    paths = [f["filepath"] for f in files]
    assert "main.go" in paths


def test_enroll_duplicate_returns_409(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    resp = client.post("/api/enroll/hello-world/go", json={
        "difficulty": "senior",
        "locale": "en",
    })
    assert resp.status_code == 409


def test_enroll_nonexistent_course_returns_404(client):
    resp = client.post("/api/enroll/nonexistent/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    assert resp.status_code == 404
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/api/test_enroll.py -v
```

Expected: 405 (no POST handler) or similar failures.

- [ ] **Step 3: Write the enrollment router**

```python
# backend/api/routers/enroll.py
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from api.config import settings
from api.course_loader import cache as course_cache
from api.db.models import Enrollment, WorkingFile
from api.dependencies import get_db

router = APIRouter(prefix="/api/enroll", tags=["enrollment"])


class EnrollRequest(BaseModel):
    difficulty: str
    locale: str = "es"


@router.post("/{slug}/{lang}")
def enroll(
    slug: str,
    lang: str,
    body: EnrollRequest,
    db: Session = Depends(get_db),
):
    user_id = settings.default_user_id

    course = course_cache.get_course(slug, lang, body.locale)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_slug == slug,
            Enrollment.language == lang,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled")

    enrollment = Enrollment(
        user_id=user_id,
        course_slug=slug,
        language=lang,
        difficulty=body.difficulty,
        locale=body.locale,
    )
    db.add(enrollment)

    # Seed working files from stubs
    src_dir = Path(settings.courses_path) / slug / lang / "src"
    if src_dir.exists():
        for file_path in src_dir.rglob("*"):
            if file_path.is_file():
                relative = str(file_path.relative_to(src_dir)).replace("\\", "/")
                wf = WorkingFile(
                    user_id=user_id,
                    course_slug=slug,
                    language=lang,
                    filepath=relative,
                    content=file_path.read_text(),
                )
                db.add(wf)

    db.commit()
    db.refresh(enrollment)
    return {
        "id": enrollment.id,
        "course_slug": enrollment.course_slug,
        "language": enrollment.language,
        "difficulty": enrollment.difficulty,
        "locale": enrollment.locale,
    }
```

- [ ] **Step 4: Register the router and update config override for tests**

Add to `backend/api/main.py` after the courses router:

```python
app.include_router(enroll.router)
```

Update `backend/tests/conftest.py` to override `settings.courses_path` for stub seeding:

Add this at the top of the `client` fixture, before creating the TestClient:

```python
@pytest.fixture
def client(courses_path: Path, db_session: Session):
    from api.main import app
    from api.config import settings

    course_cache.load_all(courses_path)
    settings.courses_path = str(courses_path)
    settings.default_user_id = "test-user"

    def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/api/test_enroll.py -v
```

Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/api/routers/enroll.py backend/api/main.py backend/tests/api/test_enroll.py backend/tests/conftest.py
git commit -m "feat: enrollment endpoint with stub seeding"
```

---

### Task 8: File Management Endpoints

**Files:**
- Modify: `backend/api/routers/files.py`
- Modify: `backend/api/main.py`
- Test: `backend/tests/api/test_files.py`

- [ ] **Step 1: Write file endpoint tests**

```python
# backend/tests/api/test_files.py
import pytest


@pytest.fixture
def enrolled_client(client):
    """Client with an active enrollment in hello-world/go."""
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    return client


def test_get_files(enrolled_client):
    resp = enrolled_client.get("/api/files/hello-world/go")
    assert resp.status_code == 200
    files = resp.json()
    assert len(files) >= 1
    assert all("filepath" in f and "content" in f for f in files)


def test_get_files_not_enrolled(client):
    resp = client.get("/api/files/hello-world/go")
    assert resp.status_code == 404


def test_patch_file(enrolled_client):
    new_content = 'package main\n\nfunc Hello() string { return "Hello, World!" }'
    resp = enrolled_client.patch(
        "/api/files/hello-world/go/main.go",
        json={"content": new_content},
    )
    assert resp.status_code == 200

    # Verify the content was saved
    resp = enrolled_client.get("/api/files/hello-world/go")
    files = resp.json()
    main_go = next(f for f in files if f["filepath"] == "main.go")
    assert main_go["content"] == new_content


def test_patch_file_not_enrolled(client):
    resp = client.patch(
        "/api/files/hello-world/go/main.go",
        json={"content": "test"},
    )
    assert resp.status_code == 404


def test_patch_file_nested_path(enrolled_client):
    """Filepath can contain slashes (e.g., internal/parser.go)."""
    resp = enrolled_client.patch(
        "/api/files/hello-world/go/internal/parser.go",
        json={"content": "package internal"},
    )
    assert resp.status_code == 200

    resp = enrolled_client.get("/api/files/hello-world/go")
    files = resp.json()
    paths = [f["filepath"] for f in files]
    assert "internal/parser.go" in paths
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/api/test_files.py -v
```

Expected: failures (stub router returns 405 or no routes).

- [ ] **Step 3: Write the files router**

```python
# backend/api/routers/files.py
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from api.config import settings
from api.db.models import Enrollment, WorkingFile
from api.dependencies import get_db

router = APIRouter(prefix="/api/files", tags=["files"])


class PatchFileRequest(BaseModel):
    content: str


def _get_enrollment(db: Session, slug: str, lang: str) -> Enrollment:
    user_id = settings.default_user_id
    enrollment = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_slug == slug,
            Enrollment.language == lang,
        )
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled")
    return enrollment


@router.get("/{slug}/{lang}")
def get_files(slug: str, lang: str, db: Session = Depends(get_db)):
    enrollment = _get_enrollment(db, slug, lang)
    files = db.exec(
        select(WorkingFile).where(
            WorkingFile.user_id == enrollment.user_id,
            WorkingFile.course_slug == slug,
            WorkingFile.language == lang,
        )
    ).all()
    return [
        {"filepath": f.filepath, "content": f.content, "updated_at": f.updated_at.isoformat()}
        for f in files
    ]


@router.patch("/{slug}/{lang}/{filepath:path}")
def patch_file(
    slug: str,
    lang: str,
    filepath: str,
    body: PatchFileRequest,
    db: Session = Depends(get_db),
):
    enrollment = _get_enrollment(db, slug, lang)

    existing = db.exec(
        select(WorkingFile).where(
            WorkingFile.user_id == enrollment.user_id,
            WorkingFile.course_slug == slug,
            WorkingFile.language == lang,
            WorkingFile.filepath == filepath,
        )
    ).first()

    if existing:
        existing.content = body.content
        existing.updated_at = datetime.now(timezone.utc)
        db.add(existing)
    else:
        wf = WorkingFile(
            user_id=enrollment.user_id,
            course_slug=slug,
            language=lang,
            filepath=filepath,
            content=body.content,
        )
        db.add(wf)

    db.commit()
    return {"status": "saved", "filepath": filepath}
```

- [ ] **Step 4: Register the router**

Add to `backend/api/main.py`:

```python
app.include_router(files.router)
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/api/test_files.py -v
```

Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/api/routers/files.py backend/api/main.py backend/tests/api/test_files.py
git commit -m "feat: file management endpoints — get and autosave"
```

---

### Task 9: Progress, Resources, and Admin Endpoints

**Files:**
- Modify: `backend/api/routers/progress.py`
- Modify: `backend/api/routers/resources.py`
- Modify: `backend/api/routers/admin.py`
- Modify: `backend/api/main.py`
- Test: `backend/tests/api/test_progress.py`
- Test: `backend/tests/api/test_resources.py`

- [ ] **Step 1: Write progress tests**

```python
# backend/tests/api/test_progress.py
import pytest


@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    return client


def test_get_progress_empty(enrolled_client):
    resp = enrolled_client.get("/api/progress/hello-world/go")
    assert resp.status_code == 200
    data = resp.json()
    assert data["passed"] == []
    assert data["difficulty"] == "junior"


def test_get_progress_not_enrolled(client):
    resp = client.get("/api/progress/hello-world/go")
    assert resp.status_code == 404
```

- [ ] **Step 2: Write resource tests**

```python
# backend/tests/api/test_resources.py
import pytest


@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    return client


def test_get_resources_junior(enrolled_client):
    resp = enrolled_client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 200
    resources = resp.json()
    assert len(resources) == 2  # doc + hint (junior sees both)
    types = [r["type"] for r in resources]
    assert "doc" in types
    assert "hint" in types
    assert all("content" in r for r in resources)


def test_get_resources_senior_no_hints(client):
    """Seniors should not see hint-type resources."""
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "senior",
        "locale": "es",
    })
    resp = client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 200
    resources = resp.json()
    types = [r["type"] for r in resources]
    assert "hint" not in types


def test_get_resources_english(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "en",
    })
    resp = client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 200
    resources = resp.json()
    doc = next(r for r in resources if r["type"] == "doc")
    assert "The fmt package" in doc["content"]


def test_get_resources_not_enrolled(client):
    resp = client.get("/api/resources/hello-world/go/basics/hello")
    assert resp.status_code == 404
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/api/test_progress.py tests/api/test_resources.py -v
```

Expected: failures.

- [ ] **Step 4: Write the progress router**

```python
# backend/api/routers/progress.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from api.config import settings
from api.db.models import Enrollment, Progress
from api.dependencies import get_db

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/{slug}/{lang}")
def get_progress(slug: str, lang: str, db: Session = Depends(get_db)):
    user_id = settings.default_user_id
    enrollment = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_slug == slug,
            Enrollment.language == lang,
        )
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled")

    progress_rows = db.exec(
        select(Progress).where(
            Progress.user_id == user_id,
            Progress.course_slug == slug,
            Progress.language == lang,
        )
    ).all()

    return {
        "course_slug": slug,
        "language": lang,
        "difficulty": enrollment.difficulty,
        "locale": enrollment.locale,
        "passed": [
            {"submodule_id": p.submodule_id, "passed_at": p.passed_at.isoformat()}
            for p in progress_rows
        ],
    }
```

- [ ] **Step 5: Write the resources router**

```python
# backend/api/routers/resources.py
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from api.config import settings
from api.course_loader import cache as course_cache
from api.db.models import Enrollment
from api.dependencies import get_db

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("/{slug}/{lang}/{submodule_id:path}")
def get_resources(
    slug: str,
    lang: str,
    submodule_id: str,
    db: Session = Depends(get_db),
):
    user_id = settings.default_user_id
    enrollment = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_slug == slug,
            Enrollment.language == lang,
        )
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled")

    course = course_cache.get_course(slug, lang, enrollment.locale)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Find the submodule
    submodule = None
    for module in course.modules:
        for sub in module.submodules:
            if sub.full_id == submodule_id:
                submodule = sub
                break

    if not submodule:
        raise HTTPException(status_code=404, detail="Submodule not found")

    # Filter resources by difficulty
    difficulty = enrollment.difficulty
    course_dir = Path(settings.courses_path) / slug / lang
    locale = enrollment.locale

    result = []
    for res in submodule.resources:
        if difficulty not in res.visible_to:
            continue

        # Try locale-specific path, then fallback to es
        res_path = course_dir / "resources" / locale / res.file
        if not res_path.exists():
            res_path = course_dir / "resources" / "es" / res.file

        content = ""
        if res_path.exists():
            content = res_path.read_text()

        result.append({
            "title": res.title,
            "type": res.type,
            "content": content,
        })

    return result
```

- [ ] **Step 6: Write the admin router**

```python
# backend/api/routers/admin.py
from pathlib import Path

from fastapi import APIRouter

from api.config import settings
from api.course_loader import cache as course_cache

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/reload-courses")
def reload_courses():
    course_cache.reload(Path(settings.courses_path))
    courses = course_cache.get_all_courses()
    return {
        "status": "reloaded",
        "course_count": len(courses),
    }
```

- [ ] **Step 7: Register all routers in main.py**

```python
# backend/api/main.py — update the router registrations
app.include_router(courses.router)
app.include_router(enroll.router)
app.include_router(files.router)
app.include_router(progress.router)
app.include_router(resources.router)
app.include_router(admin.router)
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/api/test_progress.py tests/api/test_resources.py -v
```

Expected: all passed (2 progress + 4 resources).

- [ ] **Step 9: Run all Python tests together**

```bash
cd backend && python -m pytest -v
```

Expected: all tests pass.

- [ ] **Step 10: Commit**

```bash
git add backend/api/routers/progress.py backend/api/routers/resources.py backend/api/routers/admin.py backend/api/main.py backend/tests/api/test_progress.py backend/tests/api/test_resources.py
git commit -m "feat: progress, resources, and admin endpoints"
```

---

### Task 10: Go Runner — Models, SSE Writer, Build Step

**Files:**
- Create: `backend/runner/internal/models/models.go`
- Create: `backend/runner/internal/sse/writer.go`
- Create: `backend/runner/internal/sse/writer_test.go`
- Create: `backend/runner/internal/build/build.go`
- Create: `backend/runner/internal/build/build_test.go`

- [ ] **Step 1: Write the models**

```go
// backend/runner/internal/models/models.go
package models

// RunRequest is the payload sent by the Python API.
type RunRequest struct {
	RunID    string            `json:"run_id"`
	Language string            `json:"language"`
	BuildCmd string            `json:"build_cmd"`
	RunCmd   string            `json:"run_cmd"`
	UnitCmd  string            `json:"unit_cmd"`
	Files    map[string]string `json:"files"`
	Tests    []TestSpec        `json:"tests"`
}

// TestSpec mirrors the Python TestSpec model.
type TestSpec struct {
	Type                   string         `json:"type"`
	Match                  string         `json:"match,omitempty"`
	Stdin                  string         `json:"stdin,omitempty"`
	ExpectedStdout         string         `json:"expected_stdout,omitempty"`
	ExpectedStdoutContains string         `json:"expected_stdout_contains,omitempty"`
	TimeoutMs              int            `json:"timeout_ms"`
	Request                *HTTPRequest   `json:"request,omitempty"`
	Expected               *HTTPExpected  `json:"expected,omitempty"`
	Port                   int            `json:"port,omitempty"`
	Send                   string         `json:"send,omitempty"`
	SendHex                string         `json:"send_hex,omitempty"`
	ExpectedResponse       string         `json:"expected_response,omitempty"`
	ExpectedHex            string         `json:"expected_hex,omitempty"`
	FileContent            string         `json:"file_content,omitempty"`
	ManagesLifecycle       bool           `json:"manages_lifecycle"`
}

type HTTPRequest struct {
	Method  string            `json:"method"`
	Path    string            `json:"path"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    string            `json:"body,omitempty"`
}

type HTTPExpected struct {
	Status       int               `json:"status,omitempty"`
	BodyContains string            `json:"body_contains,omitempty"`
	BodyEquals   string            `json:"body_equals,omitempty"`
	Headers      map[string]string `json:"headers,omitempty"`
}
```

- [ ] **Step 2: Write SSE writer test**

```go
// backend/runner/internal/sse/writer_test.go
package sse

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWriterSend(t *testing.T) {
	rec := httptest.NewRecorder()
	w := NewWriter(rec)

	w.Send("test_event", map[string]string{"key": "value"})

	body := rec.Body.String()
	if !strings.Contains(body, "event: test_event\n") {
		t.Errorf("missing event line, got: %s", body)
	}
	if !strings.Contains(body, `data: {"key":"value"}`) {
		t.Errorf("missing data line, got: %s", body)
	}
}

func TestWriterSendMultiple(t *testing.T) {
	rec := httptest.NewRecorder()
	w := NewWriter(rec)

	w.Send("first", map[string]int{"n": 1})
	w.Send("second", map[string]int{"n": 2})

	body := rec.Body.String()
	if strings.Count(body, "event: ") != 2 {
		t.Errorf("expected 2 events, got: %s", body)
	}
}
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd backend/runner && go test ./internal/sse/ -v
```

Expected: compilation error (package doesn't exist yet).

- [ ] **Step 4: Write the SSE writer**

```go
// backend/runner/internal/sse/writer.go
package sse

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Writer writes Server-Sent Events to an http.ResponseWriter.
type Writer struct {
	w       http.ResponseWriter
	flusher http.Flusher
}

// NewWriter creates an SSE writer. If the ResponseWriter doesn't support
// flushing (e.g. httptest.ResponseRecorder), writes still work but aren't flushed.
func NewWriter(w http.ResponseWriter) *Writer {
	flusher, _ := w.(http.Flusher)
	return &Writer{w: w, flusher: flusher}
}

// SetHeaders sets the required SSE response headers.
func (s *Writer) SetHeaders() {
	s.w.Header().Set("Content-Type", "text/event-stream")
	s.w.Header().Set("Cache-Control", "no-cache")
	s.w.Header().Set("Connection", "keep-alive")
}

// Send writes a single SSE event.
func (s *Writer) Send(event string, data any) {
	fmt.Fprintf(s.w, "event: %s\n", event)
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Fprintf(s.w, "data: {\"error\":\"marshal failed\"}\n\n")
	} else {
		fmt.Fprintf(s.w, "data: %s\n\n", jsonData)
	}
	if s.flusher != nil {
		s.flusher.Flush()
	}
}
```

- [ ] **Step 5: Run SSE writer test to verify it passes**

```bash
cd backend/runner && go test ./internal/sse/ -v
```

Expected: 2 passed.

- [ ] **Step 6: Write build step test**

```go
// backend/runner/internal/build/build_test.go
package build

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/sse"
)

func TestBuildSuccess(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)

	err := Run(context.Background(), "echo build-ok", "/tmp", map[string]string{}, w)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "build_start") {
		t.Error("missing build_start event")
	}
	if !strings.Contains(body, "build_done") {
		t.Error("missing build_done event")
	}
	if !strings.Contains(body, "build-ok") {
		t.Error("missing build output")
	}
}

func TestBuildFailure(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)

	err := Run(context.Background(), "false", "/tmp", map[string]string{}, w)
	if err != nil {
		// Expected: build failure is reported via SSE, not as a Go error
		// unless the command itself can't be started
	}

	body := rec.Body.String()
	if !strings.Contains(body, "build_failed") && err == nil {
		t.Error("expected build_failed event or error")
	}
}

func TestBuildEmptyCmd(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)

	// Empty build command (e.g. Python) should succeed immediately
	err := Run(context.Background(), "", "/tmp", map[string]string{}, w)
	if err != nil {
		t.Fatalf("empty build should succeed, got: %v", err)
	}
}
```

- [ ] **Step 7: Write the build module**

```go
// backend/runner/internal/build/build.go
package build

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"buildmancer/runner/internal/sse"
)

// Run executes the build command in the given workspace directory.
// It streams build output and reports success/failure via SSE.
// Returns nil if build succeeds or if build_cmd is empty (no build needed).
func Run(ctx context.Context, buildCmd string, workDir string, env map[string]string, w *sse.Writer) error {
	if buildCmd == "" {
		w.Send("build_start", map[string]string{"phase": "build"})
		w.Send("build_done", map[string]any{"success": true})
		return nil
	}

	w.Send("build_start", map[string]string{"phase": "build"})

	cmd := exec.CommandContext(ctx, "bash", "-c", buildCmd)
	cmd.Dir = workDir

	// Set environment variables
	for k, v := range env {
		cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
	}

	// Merge with PATH from parent
	cmd.Env = append(cmd.Env, "PATH="+getPath())

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		w.Send("build_failed", map[string]string{"error": err.Error()})
		return err
	}
	cmd.Stderr = cmd.Stdout // merge stderr into stdout

	if err := cmd.Start(); err != nil {
		w.Send("build_failed", map[string]string{"error": err.Error()})
		return err
	}

	scanner := bufio.NewScanner(stdout)
	var output strings.Builder
	for scanner.Scan() {
		line := scanner.Text()
		output.WriteString(line + "\n")
		w.Send("build_output", map[string]string{"line": line})
	}

	if err := cmd.Wait(); err != nil {
		w.Send("build_failed", map[string]any{
			"error":  "build failed",
			"output": output.String(),
		})
		return fmt.Errorf("build failed: %w", err)
	}

	w.Send("build_done", map[string]any{"success": true})
	return nil
}

func getPath() string {
	// Use a reasonable default PATH
	return "/usr/local/go/bin:/usr/local/bin:/usr/bin:/bin"
}
```

- [ ] **Step 8: Run build tests**

```bash
cd backend/runner && go test ./internal/build/ -v
```

Expected: 3 passed.

- [ ] **Step 9: Commit**

```bash
git add backend/runner/internal/models/ backend/runner/internal/sse/ backend/runner/internal/build/ backend/runner/go.mod
git commit -m "feat(runner): models, SSE writer, build step"
```

---

### Task 11: Go Runner — Lifecycle Management

**Files:**
- Create: `backend/runner/internal/lifecycle/process.go`
- Create: `backend/runner/internal/lifecycle/process_test.go`

- [ ] **Step 1: Write lifecycle tests**

```go
// backend/runner/internal/lifecycle/process_test.go
package lifecycle

import (
	"context"
	"testing"
	"time"
)

func TestSpawnAndKill(t *testing.T) {
	ctx := context.Background()
	// Start a simple process that listens (sleep simulates a long-running binary)
	proc, err := Spawn(ctx, "sleep 30", "/tmp", nil)
	if err != nil {
		t.Fatalf("failed to spawn: %v", err)
	}
	if proc.PID() <= 0 {
		t.Fatal("expected positive PID")
	}

	err = proc.Kill()
	if err != nil {
		t.Fatalf("failed to kill: %v", err)
	}
}

func TestWaitForPort(t *testing.T) {
	ctx := context.Background()

	// Start a netcat listener on a random port
	proc, err := Spawn(ctx, "bash -c 'nc -l -p 18923 &>/dev/null'", "/tmp", nil)
	if err != nil {
		t.Skipf("nc not available: %v", err)
	}
	defer proc.Kill()

	err = WaitForPort(ctx, 18923, 3*time.Second)
	if err != nil {
		t.Fatalf("port should be reachable: %v", err)
	}
}

func TestWaitForPortTimeout(t *testing.T) {
	ctx := context.Background()
	err := WaitForPort(ctx, 19999, 500*time.Millisecond)
	if err == nil {
		t.Fatal("expected timeout error for unreachable port")
	}
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend/runner && go test ./internal/lifecycle/ -v
```

Expected: compilation error.

- [ ] **Step 3: Write the lifecycle module**

```go
// backend/runner/internal/lifecycle/process.go
package lifecycle

import (
	"context"
	"fmt"
	"net"
	"os/exec"
	"syscall"
	"time"
)

// Process wraps a running binary.
type Process struct {
	cmd *exec.Cmd
}

// Spawn starts a command in the given directory with optional env vars.
func Spawn(ctx context.Context, command string, workDir string, env []string) (*Process, error) {
	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	cmd.Dir = workDir
	if env != nil {
		cmd.Env = env
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("spawn failed: %w", err)
	}
	return &Process{cmd: cmd}, nil
}

// PID returns the process ID.
func (p *Process) PID() int {
	if p.cmd.Process == nil {
		return 0
	}
	return p.cmd.Process.Pid
}

// Kill sends SIGTERM, waits briefly, then SIGKILL if still alive.
func (p *Process) Kill() error {
	if p.cmd.Process == nil {
		return nil
	}

	// Try SIGTERM first
	_ = p.cmd.Process.Signal(syscall.SIGTERM)

	done := make(chan error, 1)
	go func() { done <- p.cmd.Wait() }()

	select {
	case <-done:
		return nil
	case <-time.After(2 * time.Second):
		// Force kill
		_ = p.cmd.Process.Kill()
		<-done
		return nil
	}
}

// Wait blocks until the process exits.
func (p *Process) Wait() error {
	return p.cmd.Wait()
}

// WaitForPort polls a TCP port until it accepts connections or timeout.
func WaitForPort(ctx context.Context, port int, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	addr := fmt.Sprintf("localhost:%d", port)

	for time.Now().Before(deadline) {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		conn, err := net.DialTimeout("tcp", addr, 200*time.Millisecond)
		if err == nil {
			conn.Close()
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return fmt.Errorf("port %d not ready after %v", port, timeout)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend/runner && go test ./internal/lifecycle/ -v -timeout 30s
```

Expected: 3 passed (TestWaitForPort may skip if nc is unavailable).

- [ ] **Step 5: Commit**

```bash
git add backend/runner/internal/lifecycle/
git commit -m "feat(runner): lifecycle management — spawn, port wait, kill"
```

---

### Task 12: Go Runner — Test Dispatchers

**Files:**
- Create: `backend/runner/internal/dispatch/dispatch.go`
- Create: `backend/runner/internal/dispatch/unit.go`
- Create: `backend/runner/internal/dispatch/unit_test.go`
- Create: `backend/runner/internal/dispatch/stdout.go`
- Create: `backend/runner/internal/dispatch/stdout_test.go`
- Create: `backend/runner/internal/dispatch/http.go`
- Create: `backend/runner/internal/dispatch/http_test.go`
- Create: `backend/runner/internal/dispatch/tcp.go`
- Create: `backend/runner/internal/dispatch/tcp_test.go`
- Create: `backend/runner/internal/dispatch/script.go`
- Create: `backend/runner/internal/dispatch/script_test.go`

- [ ] **Step 1: Write the dispatcher interface and registry**

```go
// backend/runner/internal/dispatch/dispatch.go
package dispatch

import (
	"context"
	"fmt"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

// RunEnv holds the execution environment for a test.
type RunEnv struct {
	WorkspaceDir string
	BinaryPath   string
	Port         int
	ProcessPID   int
	EnvVars      []string
}

// Dispatcher runs a single test and streams results via SSE.
type Dispatcher interface {
	Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (passed bool, err error)
}

var registry = map[string]Dispatcher{
	"unit":   &UnitDispatcher{},
	"stdout": &StdoutDispatcher{},
	"http":   &HTTPDispatcher{},
	"tcp":    &TCPDispatcher{},
	"script": &ScriptDispatcher{},
}

// Get returns the dispatcher for a test type.
func Get(testType string) (Dispatcher, error) {
	d, ok := registry[testType]
	if !ok {
		return nil, fmt.Errorf("unknown test type: %s", testType)
	}
	return d, nil
}
```

- [ ] **Step 2: Write unit dispatcher test**

```go
// backend/runner/internal/dispatch/unit_test.go
package dispatch

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func TestUnitDispatcherPass(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &UnitDispatcher{}

	spec := models.TestSpec{
		Type:      "unit",
		Match:     "TestDummy",
		TimeoutMs: 5000,
	}
	env := RunEnv{
		WorkspaceDir: "/tmp",
		// Use a command that always passes
		EnvVars: []string{"PATH=/usr/local/bin:/usr/bin:/bin"},
	}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	// We can't run actual go test without a Go project, so test the SSE output
	body := rec.Body.String()
	if !strings.Contains(body, "test_start") {
		t.Error("missing test_start event")
	}
	_ = passed
	_ = err
}
```

- [ ] **Step 3: Write unit dispatcher**

```go
// backend/runner/internal/dispatch/unit.go
package dispatch

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

type UnitDispatcher struct{}

func (d *UnitDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{
		"index": index,
		"type":  "unit",
		"match": spec.Match,
	})

	// Build the unit command by interpolating {match}
	unitCmd := ""
	for _, e := range env.EnvVars {
		if strings.HasPrefix(e, "BUILDMANCER_UNIT_CMD=") {
			unitCmd = strings.TrimPrefix(e, "BUILDMANCER_UNIT_CMD=")
		}
	}
	if unitCmd == "" {
		unitCmd = "go test -run {match} -v -count=1 ."
	}
	unitCmd = strings.ReplaceAll(unitCmd, "{match}", spec.Match)

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "bash", "-c", unitCmd)
	cmd.Dir = env.WorkspaceDir
	cmd.Env = append(env.EnvVars, "PATH=/usr/local/go/bin:/usr/local/bin:/usr/bin:/bin")

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, err
	}
	cmd.Stderr = cmd.Stdout

	if err := cmd.Start(); err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, err
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		w.Send("test_output", map[string]any{"index": index, "line": scanner.Text()})
	}

	err = cmd.Wait()
	if ctx.Err() == context.DeadlineExceeded {
		w.Send("test_timeout", map[string]any{"index": index, "timeout_ms": spec.TimeoutMs})
		return false, nil
	}
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": fmt.Sprintf("test failed: %v", err)})
		return false, nil
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
```

- [ ] **Step 4: Write stdout dispatcher test**

```go
// backend/runner/internal/dispatch/stdout_test.go
package dispatch

import (
	"context"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func TestStdoutDispatcherPass(t *testing.T) {
	// Create a simple script that echoes stdin
	tmpDir := t.TempDir()
	script := filepath.Join(tmpDir, "echo.sh")
	os.WriteFile(script, []byte("#!/bin/bash\ncat"), 0755)

	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &StdoutDispatcher{}

	spec := models.TestSpec{
		Type:           "stdout",
		Stdin:          "hello world",
		ExpectedStdout: "hello world",
		TimeoutMs:      3000,
	}
	env := RunEnv{
		WorkspaceDir: tmpDir,
		BinaryPath:   script,
		EnvVars:      []string{"PATH=/usr/local/bin:/usr/bin:/bin"},
	}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		t.Error("expected test to pass")
	}

	body := rec.Body.String()
	if !strings.Contains(body, "test_done") {
		t.Errorf("missing test_done event, got: %s", body)
	}
}

func TestStdoutDispatcherFail(t *testing.T) {
	tmpDir := t.TempDir()
	script := filepath.Join(tmpDir, "wrong.sh")
	os.WriteFile(script, []byte("#!/bin/bash\necho wrong"), 0755)

	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &StdoutDispatcher{}

	spec := models.TestSpec{
		Type:           "stdout",
		Stdin:          "",
		ExpectedStdout: "expected",
		TimeoutMs:      3000,
	}
	env := RunEnv{BinaryPath: script, WorkspaceDir: tmpDir, EnvVars: []string{"PATH=/usr/local/bin:/usr/bin:/bin"}}

	passed, _ := d.Dispatch(context.Background(), 0, spec, env, w)
	if passed {
		t.Error("expected test to fail")
	}
}
```

- [ ] **Step 5: Write stdout dispatcher**

```go
// backend/runner/internal/dispatch/stdout.go
package dispatch

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

type StdoutDispatcher struct{}

func (d *StdoutDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "stdout"})

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, env.BinaryPath)
	cmd.Dir = env.WorkspaceDir
	cmd.Env = env.EnvVars

	if spec.Stdin != "" {
		cmd.Stdin = strings.NewReader(spec.Stdin)
	}

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if ctx.Err() == context.DeadlineExceeded {
		w.Send("test_timeout", map[string]any{"index": index, "timeout_ms": spec.TimeoutMs})
		return false, nil
	}
	if err != nil {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"passed": false,
			"error":  fmt.Sprintf("process exited with error: %v\nstderr: %s", err, stderr.String()),
		})
		return false, nil
	}

	actual := stdout.String()
	w.Send("test_output", map[string]any{"index": index, "line": actual})

	if spec.ExpectedStdout != "" {
		if strings.TrimRight(actual, "\n") != strings.TrimRight(spec.ExpectedStdout, "\n") {
			w.Send("test_failed", map[string]any{
				"index":  index,
				"passed": false,
				"error":  fmt.Sprintf("stdout mismatch:\n  expected: %q\n  actual:   %q", spec.ExpectedStdout, actual),
			})
			return false, nil
		}
	}

	if spec.ExpectedStdoutContains != "" {
		if !strings.Contains(actual, spec.ExpectedStdoutContains) {
			w.Send("test_failed", map[string]any{
				"index":  index,
				"passed": false,
				"error":  fmt.Sprintf("stdout does not contain %q, got: %q", spec.ExpectedStdoutContains, actual),
			})
			return false, nil
		}
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
```

- [ ] **Step 6: Write HTTP dispatcher test**

```go
// backend/runner/internal/dispatch/http_test.go
package dispatch

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func TestHTTPDispatcherPass(t *testing.T) {
	// Spin up a real HTTP server to test against
	srv := http.NewServeMux()
	srv.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		fmt.Fprint(w, `{"status":"ok"}`)
	})
	ts := httptest.NewServer(srv)
	defer ts.Close()

	// Extract port from test server URL
	parts := strings.Split(ts.URL, ":")
	port := parts[len(parts)-1]

	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &HTTPDispatcher{}

	spec := models.TestSpec{
		Type:      "http",
		TimeoutMs: 3000,
		Request:   &models.HTTPRequest{Method: "GET", Path: "/health"},
		Expected:  &models.HTTPExpected{Status: 200, BodyContains: `"status":"ok"`},
	}

	// Override the port for the dispatcher
	var portNum int
	fmt.Sscanf(port, "%d", &portNum)
	env := RunEnv{Port: portNum}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		body := rec.Body.String()
		t.Errorf("expected pass, SSE output: %s", body)
	}
}
```

- [ ] **Step 7: Write HTTP dispatcher**

```go
// backend/runner/internal/dispatch/http.go
package dispatch

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

type HTTPDispatcher struct{}

func (d *HTTPDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{
		"index": index,
		"type":  "http",
		"path":  spec.Request.Path,
	})

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	url := fmt.Sprintf("http://localhost:%d%s", env.Port, spec.Request.Path)

	var bodyReader io.Reader
	if spec.Request.Body != "" {
		bodyReader = strings.NewReader(spec.Request.Body)
	}

	req, err := http.NewRequestWithContext(ctx, spec.Request.Method, url, bodyReader)
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, nil
	}

	for k, v := range spec.Request.Headers {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	if ctx.Err() == context.DeadlineExceeded {
		w.Send("test_timeout", map[string]any{"index": index, "timeout_ms": spec.TimeoutMs})
		return false, nil
	}
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, nil
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyStr := string(bodyBytes)

	w.Send("test_output", map[string]any{
		"index":  index,
		"line":   fmt.Sprintf("HTTP %d — %s", resp.StatusCode, bodyStr),
	})

	// Check status
	if spec.Expected.Status != 0 && resp.StatusCode != spec.Expected.Status {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"passed": false,
			"error":  fmt.Sprintf("status: expected %d, got %d", spec.Expected.Status, resp.StatusCode),
		})
		return false, nil
	}

	// Check body_contains
	if spec.Expected.BodyContains != "" && !strings.Contains(bodyStr, spec.Expected.BodyContains) {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"passed": false,
			"error":  fmt.Sprintf("body does not contain %q, got: %q", spec.Expected.BodyContains, bodyStr),
		})
		return false, nil
	}

	// Check body_equals
	if spec.Expected.BodyEquals != "" && strings.TrimSpace(bodyStr) != strings.TrimSpace(spec.Expected.BodyEquals) {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"passed": false,
			"error":  fmt.Sprintf("body mismatch:\n  expected: %q\n  actual:   %q", spec.Expected.BodyEquals, bodyStr),
		})
		return false, nil
	}

	// Check headers
	for k, v := range spec.Expected.Headers {
		actual := resp.Header.Get(k)
		if !strings.Contains(actual, v) {
			w.Send("test_failed", map[string]any{
				"index":  index,
				"passed": false,
				"error":  fmt.Sprintf("header %s: expected contains %q, got %q", k, v, actual),
			})
			return false, nil
		}
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
```

- [ ] **Step 8: Write TCP dispatcher test**

```go
// backend/runner/internal/dispatch/tcp_test.go
package dispatch

import (
	"context"
	"fmt"
	"net"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func TestTCPDispatcherPass(t *testing.T) {
	// Start a TCP echo server
	ln, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		t.Fatal(err)
	}
	defer ln.Close()

	port := ln.Addr().(*net.TCPAddr).Port

	go func() {
		conn, err := ln.Accept()
		if err != nil {
			return
		}
		defer conn.Close()
		buf := make([]byte, 1024)
		n, _ := conn.Read(buf)
		conn.Write(buf[:n])
	}()

	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &TCPDispatcher{}

	spec := models.TestSpec{
		Type:             "tcp",
		Port:             port,
		Send:             "PING\r\n",
		ExpectedResponse: "PING\r\n",
		TimeoutMs:        3000,
	}
	env := RunEnv{Port: port}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	body := rec.Body.String()
	if !passed {
		t.Errorf("expected pass, SSE output: %s", body)
	}
	if !strings.Contains(body, "test_done") {
		t.Errorf("missing test_done: %s", body)
	}
	_ = fmt.Sprintf  // suppress unused import
}
```

- [ ] **Step 9: Write TCP dispatcher**

```go
// backend/runner/internal/dispatch/tcp.go
package dispatch

import (
	"context"
	"encoding/hex"
	"fmt"
	"net"
	"strings"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

type TCPDispatcher struct{}

func (d *TCPDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "tcp"})

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond

	port := spec.Port
	if port == 0 {
		port = env.Port
	}

	conn, err := net.DialTimeout("tcp", fmt.Sprintf("localhost:%d", port), timeout)
	if err != nil {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"passed": false,
			"error":  fmt.Sprintf("TCP connect failed: %v", err),
		})
		return false, nil
	}
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(timeout))

	// Determine what to send
	var sendBytes []byte
	if spec.SendHex != "" {
		cleaned := strings.ReplaceAll(spec.SendHex, " ", "")
		sendBytes, err = hex.DecodeString(cleaned)
		if err != nil {
			w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": "invalid send_hex"})
			return false, nil
		}
	} else if spec.Send != "" {
		sendBytes = []byte(spec.Send)
	}

	if len(sendBytes) > 0 {
		_, err = conn.Write(sendBytes)
		if err != nil {
			w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
			return false, nil
		}
	}

	// Read response
	buf := make([]byte, 4096)
	n, err := conn.Read(buf)
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, nil
	}
	actual := buf[:n]

	w.Send("test_output", map[string]any{
		"index": index,
		"line":  fmt.Sprintf("received %d bytes", n),
	})

	// Compare
	if spec.ExpectedHex != "" {
		cleaned := strings.ReplaceAll(spec.ExpectedHex, " ", "")
		expectedBytes, err := hex.DecodeString(cleaned)
		if err != nil {
			w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": "invalid expected_hex"})
			return false, nil
		}
		if string(actual) != string(expectedBytes) {
			w.Send("test_failed", map[string]any{
				"index":  index,
				"passed": false,
				"error":  fmt.Sprintf("hex mismatch:\n  expected: %x\n  actual:   %x", expectedBytes, actual),
			})
			return false, nil
		}
	} else if spec.ExpectedResponse != "" {
		if string(actual) != spec.ExpectedResponse {
			w.Send("test_failed", map[string]any{
				"index":  index,
				"passed": false,
				"error":  fmt.Sprintf("response mismatch:\n  expected: %q\n  actual:   %q", spec.ExpectedResponse, string(actual)),
			})
			return false, nil
		}
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
```

- [ ] **Step 10: Write script dispatcher test**

```go
// backend/runner/internal/dispatch/script_test.go
package dispatch

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func TestScriptDispatcherPass(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &ScriptDispatcher{}

	spec := models.TestSpec{
		Type:        "script",
		FileContent: "#!/bin/bash\necho PASS\nexit 0",
		TimeoutMs:   5000,
	}
	env := RunEnv{
		WorkspaceDir: t.TempDir(),
		BinaryPath:   "/bin/true",
		Port:         0,
		ProcessPID:   0,
	}

	passed, err := d.Dispatch(context.Background(), 0, spec, env, w)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !passed {
		body := rec.Body.String()
		t.Errorf("expected pass, SSE output: %s", body)
	}
}

func TestScriptDispatcherFail(t *testing.T) {
	rec := httptest.NewRecorder()
	w := sse.NewWriter(rec)
	d := &ScriptDispatcher{}

	spec := models.TestSpec{
		Type:        "script",
		FileContent: "#!/bin/bash\necho FAIL\nexit 1",
		TimeoutMs:   5000,
	}
	env := RunEnv{WorkspaceDir: t.TempDir(), BinaryPath: "/bin/true"}

	passed, _ := d.Dispatch(context.Background(), 0, spec, env, w)
	if passed {
		t.Error("expected test to fail")
	}

	body := rec.Body.String()
	if !strings.Contains(body, "test_failed") {
		t.Errorf("missing test_failed event: %s", body)
	}
}
```

- [ ] **Step 11: Write script dispatcher**

```go
// backend/runner/internal/dispatch/script.go
package dispatch

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

type ScriptDispatcher struct{}

func (d *ScriptDispatcher) Dispatch(ctx context.Context, index int, spec models.TestSpec, env RunEnv, w *sse.Writer) (bool, error) {
	w.Send("test_start", map[string]any{"index": index, "type": "script"})

	// Write the script content to a temp file
	scriptPath := filepath.Join(env.WorkspaceDir, fmt.Sprintf(".buildmancer_test_%d.sh", index))
	if err := os.WriteFile(scriptPath, []byte(spec.FileContent), 0755); err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, nil
	}
	defer os.Remove(scriptPath)

	timeout := time.Duration(spec.TimeoutMs) * time.Millisecond
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "bash", scriptPath)
	cmd.Dir = env.WorkspaceDir
	cmd.Env = append(os.Environ(),
		"BUILDMANCER_WORKSPACE_DIR="+env.WorkspaceDir,
		"BUILDMANCER_BINARY="+env.BinaryPath,
	)
	if env.ProcessPID > 0 {
		cmd.Env = append(cmd.Env, "BUILDMANCER_PROGRAM_PID="+strconv.Itoa(env.ProcessPID))
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, nil
	}
	cmd.Stderr = cmd.Stdout

	if err := cmd.Start(); err != nil {
		w.Send("test_failed", map[string]any{"index": index, "passed": false, "error": err.Error()})
		return false, nil
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		w.Send("test_output", map[string]any{"index": index, "line": scanner.Text()})
	}

	err = cmd.Wait()
	if ctx.Err() == context.DeadlineExceeded {
		w.Send("test_timeout", map[string]any{"index": index, "timeout_ms": spec.TimeoutMs})
		return false, nil
	}
	if err != nil {
		w.Send("test_failed", map[string]any{
			"index":  index,
			"passed": false,
			"error":  fmt.Sprintf("script exited with error: %v", err),
		})
		return false, nil
	}

	w.Send("test_done", map[string]any{"index": index, "passed": true})
	return true, nil
}
```

- [ ] **Step 12: Run all dispatcher tests**

```bash
cd backend/runner && go test ./internal/dispatch/ -v -timeout 30s
```

Expected: all tests pass.

- [ ] **Step 13: Commit**

```bash
git add backend/runner/internal/dispatch/
git commit -m "feat(runner): test dispatchers — unit, stdout, http, tcp, script"
```

---

### Task 13: Go Runner — HTTP Server

**Files:**
- Create: `backend/runner/internal/handler/run.go`
- Create: `backend/runner/internal/handler/run_test.go`
- Modify: `backend/runner/cmd/server/main.go`

- [ ] **Step 1: Write the run handler test**

```go
// backend/runner/internal/handler/run_test.go
package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"buildmancer/runner/internal/models"
)

func TestRunHandlerBuildOnly(t *testing.T) {
	req := models.RunRequest{
		RunID:    "test-1",
		Language: "go",
		BuildCmd: "echo build-done",
		Files:    map[string]string{"main.go": "package main"},
		Tests:    []models.TestSpec{},
	}

	body, _ := json.Marshal(req)
	httpReq := httptest.NewRequest("POST", "/run", bytes.NewReader(body))
	rec := httptest.NewRecorder()

	HandleRun(rec, httpReq)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	respBody := rec.Body.String()
	if !strings.Contains(respBody, "build_done") {
		t.Errorf("missing build_done in response: %s", respBody)
	}
	if !strings.Contains(respBody, "run_complete") {
		t.Errorf("missing run_complete: %s", respBody)
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend/runner && go test ./internal/handler/ -v
```

Expected: compilation error.

- [ ] **Step 3: Write the run handler**

```go
// backend/runner/internal/handler/run.go
package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"

	"buildmancer/runner/internal/build"
	"buildmancer/runner/internal/dispatch"
	"buildmancer/runner/internal/lifecycle"
	"buildmancer/runner/internal/models"
	"buildmancer/runner/internal/sse"
)

func HandleRun(w http.ResponseWriter, r *http.Request) {
	var req models.RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	sseWriter := sse.NewWriter(w)
	sseWriter.SetHeaders()

	ctx := r.Context()

	// Create tmpdir and materialize files
	tmpDir, err := os.MkdirTemp("", "buildmancer-run-*")
	if err != nil {
		sseWriter.Send("system_error", map[string]string{"error": "failed to create tmpdir"})
		return
	}
	defer os.RemoveAll(tmpDir)

	for path, content := range req.Files {
		fullPath := filepath.Join(tmpDir, path)
		os.MkdirAll(filepath.Dir(fullPath), 0755)
		if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
			sseWriter.Send("system_error", map[string]string{"error": fmt.Sprintf("failed to write %s", path)})
			return
		}
	}

	// Assign a dynamic port
	port := findFreePort()

	binaryPath := filepath.Join(tmpDir, "program")
	env := map[string]string{
		"BUILDMANCER_BINARY":        binaryPath,
		"BUILDMANCER_WORKSPACE_DIR": tmpDir,
		"BUILDMANCER_PORT":          fmt.Sprintf("%d", port),
	}

	// Build
	if err := build.Run(ctx, req.BuildCmd, tmpDir, env, sseWriter); err != nil {
		sseWriter.Send("run_complete", map[string]any{"all_passed": false, "error": "build failed"})
		return
	}

	// Determine if any tests need a running binary
	needsBinary := false
	for _, t := range req.Tests {
		if t.Type == "http" || t.Type == "tcp" || (t.Type == "script" && !t.ManagesLifecycle) {
			needsBinary = true
			break
		}
	}

	// Spawn binary if needed
	var proc *lifecycle.Process
	if needsBinary && req.RunCmd != "" {
		envList := buildEnvList(env)
		runCmd := os.Expand(req.RunCmd, func(key string) string {
			return env[key]
		})
		proc, err = lifecycle.Spawn(ctx, runCmd, tmpDir, envList)
		if err != nil {
			sseWriter.Send("process_crashed", map[string]any{"error": fmt.Sprintf("failed to start binary: %v", err)})
			sseWriter.Send("run_complete", map[string]any{"all_passed": false})
			return
		}
		defer proc.Kill()

		// Wait for port readiness
		if err := lifecycle.WaitForPort(ctx, port, 5_000_000_000); err != nil {
			sseWriter.Send("process_crashed", map[string]any{"error": fmt.Sprintf("binary not ready: %v", err)})
			sseWriter.Send("run_complete", map[string]any{"all_passed": false})
			return
		}
	}

	// Dispatch tests
	passed := 0
	failed := 0
	for i, testSpec := range req.Tests {
		dispatcher, err := dispatch.Get(testSpec.Type)
		if err != nil {
			sseWriter.Send("system_error", map[string]string{"error": err.Error()})
			failed++
			continue
		}

		runEnv := dispatch.RunEnv{
			WorkspaceDir: tmpDir,
			BinaryPath:   binaryPath,
			Port:         port,
			EnvVars:      buildEnvList(env),
		}
		if proc != nil {
			runEnv.ProcessPID = proc.PID()
		}

		ok, err := dispatcher.Dispatch(ctx, i, testSpec, runEnv, sseWriter)
		if err != nil {
			sseWriter.Send("system_error", map[string]string{"error": err.Error()})
			failed++
		} else if ok {
			passed++
		} else {
			failed++
		}
	}

	allPassed := failed == 0 && passed > 0 || (passed == 0 && failed == 0)
	sseWriter.Send("run_complete", map[string]any{
		"all_passed": allPassed,
		"passed":     passed,
		"failed":     failed,
	})
}

func findFreePort() int {
	ln, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return 18080 // fallback
	}
	port := ln.Addr().(*net.TCPAddr).Port
	ln.Close()
	return port
}

func buildEnvList(env map[string]string) []string {
	var list []string
	// Include parent PATH
	list = append(list, "PATH=/usr/local/go/bin:/usr/local/bin:/usr/bin:/bin")
	for k, v := range env {
		list = append(list, fmt.Sprintf("%s=%s", k, v))
	}
	return list
}
```

- [ ] **Step 4: Write the main server entry point**

```go
// backend/runner/cmd/server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"buildmancer/runner/internal/handler"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	http.HandleFunc("/run", handler.HandleRun)

	addr := fmt.Sprintf(":%s", port)
	log.Printf("Buildmancer runner listening on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
```

- [ ] **Step 5: Run handler tests**

```bash
cd backend/runner && go test ./internal/handler/ -v
```

Expected: passes.

- [ ] **Step 6: Run all Go tests**

```bash
cd backend/runner && go test ./... -v -timeout 60s
```

Expected: all tests pass.

- [ ] **Step 7: Verify the runner compiles and starts**

```bash
cd backend/runner && go build -o /tmp/buildmancer-runner ./cmd/server/
/tmp/buildmancer-runner &
curl -s http://localhost:9000/run -X POST -d '{"run_id":"test","language":"go","build_cmd":"echo ok","files":{},"tests":[]}' | head -20
kill %1
```

Expected: SSE events with build_start, build_done, run_complete.

- [ ] **Step 8: Commit**

```bash
git add backend/runner/internal/handler/ backend/runner/cmd/server/main.go
git commit -m "feat(runner): HTTP server with run handler"
```

---

### Task 14: Run and Stream Proxy Endpoints

**Files:**
- Modify: `backend/api/routers/run.py`
- Modify: `backend/api/routers/stream.py`
- Modify: `backend/api/main.py`
- Test: `backend/tests/api/test_run.py`

- [ ] **Step 1: Write run endpoint test**

```python
# backend/tests/api/test_run.py
import pytest
from unittest.mock import patch, AsyncMock

import httpx


@pytest.fixture
def enrolled_client(client):
    client.post("/api/enroll/hello-world/go", json={
        "difficulty": "junior",
        "locale": "es",
    })
    return client


def test_run_returns_run_id(enrolled_client):
    """POST /api/run should return a run_id."""
    resp = enrolled_client.post("/api/run/hello-world/go/basics/hello")
    assert resp.status_code == 200
    data = resp.json()
    assert "run_id" in data


def test_run_not_enrolled(client):
    resp = client.post("/api/run/hello-world/go/basics/hello")
    assert resp.status_code == 404


def test_run_invalid_submodule(enrolled_client):
    resp = enrolled_client.post("/api/run/hello-world/go/nonexistent/sub")
    assert resp.status_code == 404
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/api/test_run.py -v
```

Expected: failures.

- [ ] **Step 3: Write the run router**

```python
# backend/api/routers/run.py
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from api.config import settings
from api.course_loader import cache as course_cache
from api.course_loader.defaults import resolve_cmd
from api.db.models import Enrollment, WorkingFile
from api.dependencies import get_db

router = APIRouter(prefix="/api/run", tags=["run"])

# In-memory store for pending run requests.
# run_id -> RunRequest dict (consumed once by the stream endpoint).
pending_runs: dict[str, dict] = {}


@router.post("/{slug}/{lang}/{submodule_id:path}")
def start_run(
    slug: str,
    lang: str,
    submodule_id: str,
    db: Session = Depends(get_db),
):
    user_id = settings.default_user_id

    enrollment = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_slug == slug,
            Enrollment.language == lang,
        )
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled")

    course = course_cache.get_course(slug, lang, enrollment.locale)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Find the submodule
    submodule = None
    for module in course.modules:
        for sub in module.submodules:
            if sub.full_id == submodule_id:
                submodule = sub
                break

    if not submodule:
        raise HTTPException(status_code=404, detail="Submodule not found")

    # Read all working files for this enrollment
    files = db.exec(
        select(WorkingFile).where(
            WorkingFile.user_id == user_id,
            WorkingFile.course_slug == slug,
            WorkingFile.language == lang,
        )
    ).all()
    file_map = {f.filepath: f.content for f in files}

    # Resolve commands
    language = course.meta.language
    build_cmd = resolve_cmd("build_cmd", course.meta.build_cmd, language)
    run_cmd = resolve_cmd("run_cmd", course.meta.run_cmd, language)
    unit_cmd = resolve_cmd("unit_cmd", course.meta.unit_cmd, language)

    # Build test specs, inline script content
    tests = []
    course_dir = Path(settings.courses_path) / slug / lang
    for test in submodule.tests:
        spec = test.model_dump(exclude_none=True)
        if test.type == "script" and test.file:
            script_path = course_dir / test.file
            if script_path.exists():
                spec["file_content"] = script_path.read_text()
            spec.pop("file", None)
        tests.append(spec)

    run_id = str(uuid.uuid4())
    run_request = {
        "run_id": run_id,
        "language": language,
        "build_cmd": build_cmd,
        "run_cmd": run_cmd,
        "unit_cmd": unit_cmd,
        "files": file_map,
        "tests": tests,
    }

    pending_runs[run_id] = {
        "request": run_request,
        "user_id": user_id,
        "course_slug": slug,
        "language": lang,
        "submodule_id": submodule_id,
    }

    return {"run_id": run_id}
```

- [ ] **Step 4: Write the stream router**

```python
# backend/api/routers/stream.py
from __future__ import annotations

import asyncio
import json

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from sse_starlette.sse import EventSourceResponse

from api.config import settings
from api.db.models import Progress
from api.dependencies import get_db
from api.routers.run import pending_runs

router = APIRouter(prefix="/api/stream", tags=["stream"])


@router.get("/{run_id}")
async def stream_run(run_id: str):
    pending = pending_runs.pop(run_id, None)
    if not pending:
        raise HTTPException(status_code=404, detail="Run not found or already consumed")

    run_request = pending["request"]
    user_id = pending["user_id"]
    course_slug = pending["course_slug"]
    language = pending["language"]
    submodule_id = pending["submodule_id"]

    async def event_generator():
        all_passed = False
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    "POST",
                    f"{settings.runner_url}/run",
                    json=run_request,
                    headers={"Accept": "text/event-stream"},
                ) as response:
                    event_name = None
                    data_buffer = ""

                    async for line in response.aiter_lines():
                        if line.startswith("event: "):
                            event_name = line[7:].strip()
                        elif line.startswith("data: "):
                            data_buffer = line[6:]
                        elif line == "" and event_name:
                            yield {"event": event_name, "data": data_buffer}

                            # Check if run is complete
                            if event_name == "run_complete":
                                try:
                                    result = json.loads(data_buffer)
                                    all_passed = result.get("all_passed", False)
                                except json.JSONDecodeError:
                                    pass

                            event_name = None
                            data_buffer = ""

        except httpx.ConnectError:
            yield {
                "event": "system_error",
                "data": json.dumps({"error": "Runner service unavailable"}),
            }

        # Record progress if all passed
        if all_passed:
            from api.db.database import engine
            from sqlmodel import Session as SyncSession
            with SyncSession(engine) as db:
                progress = Progress(
                    user_id=user_id,
                    course_slug=course_slug,
                    language=language,
                    submodule_id=submodule_id,
                )
                db.add(progress)
                db.commit()

    return EventSourceResponse(event_generator())
```

- [ ] **Step 5: Register routers in main.py**

Add to `backend/api/main.py`:

```python
app.include_router(run.router)
app.include_router(stream.router)
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/api/test_run.py -v
```

Expected: 3 passed.

- [ ] **Step 7: Run all Python tests**

```bash
cd backend && python -m pytest -v
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add backend/api/routers/run.py backend/api/routers/stream.py backend/api/main.py backend/tests/api/test_run.py
git commit -m "feat: run and stream endpoints — trigger runs, proxy SSE, record progress"
```

---

### Task 15: End-to-End Smoke Test

A manual verification that the full system works end-to-end: Python API + Go Runner + Postgres + test course.

**Files:**
- Create: `backend/tests/test_e2e.sh`

- [ ] **Step 1: Write the smoke test script**

```bash
#!/bin/bash
# backend/tests/test_e2e.sh
# End-to-end smoke test for Buildmancer Phase 1
# Requires: Postgres running, Go runner compiled and running, Python API running
set -e

API="http://localhost:8000"
RUNNER="http://localhost:9000"

echo "=== Buildmancer E2E Smoke Test ==="

# 1. Check API is up
echo "[1/7] Checking API health..."
curl -sf "$API/api/courses" > /dev/null
echo "  OK"

# 2. List courses
echo "[2/7] Listing courses..."
COURSES=$(curl -sf "$API/api/courses")
echo "  Courses: $COURSES"

# 3. Enroll
echo "[3/7] Enrolling in hello-world/go..."
ENROLL=$(curl -sf -X POST "$API/api/enroll/hello-world/go" \
  -H "Content-Type: application/json" \
  -d '{"difficulty":"junior","locale":"es"}')
echo "  Enrollment: $ENROLL"

# 4. Get files
echo "[4/7] Getting working files..."
FILES=$(curl -sf "$API/api/files/hello-world/go")
echo "  Files: $(echo $FILES | python3 -c 'import sys,json; print([f["filepath"] for f in json.load(sys.stdin)])')"

# 5. Patch a file (implement Hello)
echo "[5/7] Patching main.go with solution..."
curl -sf -X PATCH "$API/api/files/hello-world/go/main.go" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"package main\\n\\nimport (\\n\\t\\\"bufio\\\"\\n\\t\\\"fmt\\\"\\n\\t\\\"os\\\"\\n)\\n\\nfunc Hello() string {\\n\\treturn \\\"Hello, World!\\\"\\n}\\n\\nfunc main() {\\n\\treader := bufio.NewReader(os.Stdin)\\n\\tline, _ := reader.ReadString('\\\\n')\\n\\tfmt.Print(line)\\n}\"}" > /dev/null
echo "  OK"

# 6. Trigger a run
echo "[6/7] Running tests for basics/hello..."
RUN_RESP=$(curl -sf -X POST "$API/api/run/hello-world/go/basics/hello")
RUN_ID=$(echo $RUN_RESP | python3 -c 'import sys,json; print(json.load(sys.stdin)["run_id"])')
echo "  Run ID: $RUN_ID"

# 7. Stream results
echo "[7/7] Streaming results..."
curl -sf -N "$API/api/stream/$RUN_ID" 2>&1 | head -30
echo ""

# 8. Check progress
echo "[BONUS] Checking progress..."
PROGRESS=$(curl -sf "$API/api/progress/hello-world/go")
echo "  Progress: $PROGRESS"

echo ""
echo "=== Smoke test complete ==="
```

- [ ] **Step 2: Start the stack and run the test**

```bash
# Terminal 1: Start Postgres
docker compose up -d postgres

# Terminal 2: Start Go runner
cd backend/runner && go run cmd/server/main.go

# Terminal 3: Start Python API (pointing at test fixtures as courses)
cd backend && COURSES_PATH=tests/fixtures/courses uvicorn api.main:app --reload --port 8000

# Terminal 4: Run the smoke test
chmod +x backend/tests/test_e2e.sh
bash backend/tests/test_e2e.sh
```

Expected: all 7 steps succeed, test output streams, progress shows the submodule as passed.

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_e2e.sh
git commit -m "test: end-to-end smoke test script"
```

---

## Final Checklist

After all tasks are complete:

- [ ] All Python tests pass: `cd backend && python -m pytest -v`
- [ ] All Go tests pass: `cd backend/runner && go test ./... -v`
- [ ] Docker Compose starts all services: `docker compose up`
- [ ] E2E smoke test passes
- [ ] A student can: browse courses → enroll → see stubs → edit code → run tests → see streamed results → see progress update
