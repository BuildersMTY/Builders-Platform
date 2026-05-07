# backend/api/routers/resources.py
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from api.config import settings
from api.course_loader import cache as course_cache
from api.db.models import Enrollment
from api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("/{slug}/{lang}/{submodule_id:path}")
def get_resources(slug: str, lang: str, submodule_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
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
    submodule = None
    for module in course.modules:
        for sub in module.submodules:
            if sub.full_id == submodule_id:
                submodule = sub
                break
    if not submodule:
        raise HTTPException(status_code=404, detail="Submodule not found")
    difficulty = enrollment.difficulty
    course_dir = Path(settings.courses_path) / slug / lang
    locale = enrollment.locale
    result = []
    for res in submodule.resources:
        if difficulty not in res.visible_to:
            continue
        res_path = course_dir / "resources" / locale / res.file
        if not res_path.exists():
            res_path = course_dir / "resources" / "es" / res.file
        if not res_path.exists():
            res_path = course_dir / "resources" / res.file
        content = ""
        if res_path.exists():
            content = res_path.read_text(encoding="utf-8")
        result.append({"title": res.title, "type": res.type, "content": content})
    return result
