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
def enroll(slug: str, lang: str, body: EnrollRequest, db: Session = Depends(get_db)):
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
        user_id=user_id, course_slug=slug, language=lang,
        difficulty=body.difficulty, locale=body.locale,
    )
    db.add(enrollment)
    # Seed working files from stubs
    src_dir = Path(settings.courses_path) / slug / lang / "src"
    if src_dir.exists():
        for file_path in src_dir.rglob("*"):
            if file_path.is_file():
                relative = str(file_path.relative_to(src_dir)).replace("\\", "/")
                wf = WorkingFile(
                    user_id=user_id, course_slug=slug, language=lang,
                    filepath=relative, content=file_path.read_text(encoding="utf-8"),
                )
                db.add(wf)
    db.commit()
    db.refresh(enrollment)
    return {
        "id": enrollment.id, "course_slug": enrollment.course_slug,
        "language": enrollment.language, "difficulty": enrollment.difficulty,
        "locale": enrollment.locale,
    }
