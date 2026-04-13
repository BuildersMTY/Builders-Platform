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
    if course_override:
        return course_override
    defaults = LANGUAGE_DEFAULTS.get(language, {})
    return defaults.get(field, "")
