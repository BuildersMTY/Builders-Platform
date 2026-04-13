# backend/api/course_loader/cache.py
from __future__ import annotations
from pathlib import Path
from .loader import load_all_courses
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
