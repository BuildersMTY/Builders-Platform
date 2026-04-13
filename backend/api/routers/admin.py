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
    return {"status": "reloaded", "course_count": len(courses)}
