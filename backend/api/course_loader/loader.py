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
    yaml_path = course_dir / "course.yaml"
    if not yaml_path.exists():
        raise ValidationError(f"course.yaml not found in {course_dir}")
    with open(yaml_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if locale != "es":
        overlay_path = course_dir / f"course.{locale}.yaml"
        if overlay_path.exists():
            from .locale import merge_locale_overlay
            with open(overlay_path, encoding="utf-8") as f:
                overlay = yaml.safe_load(f)
            data = merge_locale_overlay(data, overlay)
    course = _parse_course(data)
    _set_full_ids(course)
    _validate(course, course_dir, locale)
    return course


def load_all_courses(base_path: Path, locale: str = "es") -> list[Course]:
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
    seen_ids: set[str] = set()
    for module in course.modules:
        for sub in module.submodules:
            if sub.full_id in seen_ids:
                raise ValidationError(f"Duplicate submodule ID: {sub.full_id}")
            seen_ids.add(sub.full_id)
            for stub in sub.stubs:
                stub_path = src_dir / stub.path
                if not stub_path.exists():
                    raise ValidationError(
                        f"Stub file not found: {stub.path} (expected at {stub_path})")
            for resource in sub.resources:
                res_path = locale_resource_dir / resource.file
                fallback_path = base_resource_dir / resource.file
                if not res_path.exists() and not fallback_path.exists():
                    raise ValidationError(
                        f"Resource file not found: {resource.file} (checked {res_path} and {fallback_path})")
            for test in sub.tests:
                if test.type == "script" and test.file:
                    script_path = course_dir / test.file
                    if not script_path.exists():
                        raise ValidationError(
                            f"Script file not found: {test.file} (expected at {script_path})")
