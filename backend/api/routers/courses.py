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
