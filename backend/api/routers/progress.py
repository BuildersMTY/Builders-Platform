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
        "course_slug": slug, "language": lang,
        "difficulty": enrollment.difficulty, "locale": enrollment.locale,
        "passed": [
            {"submodule_id": p.submodule_id, "passed_at": p.passed_at.isoformat()}
            for p in progress_rows
        ],
    }
