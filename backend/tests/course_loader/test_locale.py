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
    assert len(course.modules[0].submodules[0].tests) == 1
    assert course.modules[0].submodules[0].tests[0].type == "unit"
    assert course.modules[0].submodules[0].tests[0].match == "TestHello"
    assert course.modules[0].submodules[0].stubs[0].path == "main.go"


def test_base_spanish_loads_without_overlay(hello_world_path: Path):
    course = load_course(hello_world_path, locale="es")
    assert course.meta.title == "Hola Mundo"
    assert course.modules[0].title == "Módulo 1 — Básicos"


def test_missing_locale_falls_back_to_base(hello_world_path: Path):
    course = load_course(hello_world_path, locale="fr")
    assert course.meta.title == "Hola Mundo"
