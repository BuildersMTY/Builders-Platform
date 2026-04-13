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
