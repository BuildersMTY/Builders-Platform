# backend/api/routers/files.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from api.config import settings
from api.db.models import Enrollment, WorkingFile
from api.dependencies import get_db

router = APIRouter(prefix="/api/files", tags=["files"])


class PatchFileRequest(BaseModel):
    content: str


@router.get("/{slug}/{lang}")
def get_files(slug: str, lang: str, db: Session = Depends(get_db)):
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
    files = db.exec(
        select(WorkingFile).where(
            WorkingFile.user_id == user_id,
            WorkingFile.course_slug == slug,
            WorkingFile.language == lang,
        )
    ).all()
    return [
        {"filepath": f.filepath, "content": f.content, "updated_at": f.updated_at.isoformat()}
        for f in files
    ]


@router.patch("/{slug}/{lang}/{filepath:path}")
def patch_file(slug: str, lang: str, filepath: str, body: PatchFileRequest, db: Session = Depends(get_db)):
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
    existing = db.exec(
        select(WorkingFile).where(
            WorkingFile.user_id == user_id,
            WorkingFile.course_slug == slug,
            WorkingFile.language == lang,
            WorkingFile.filepath == filepath,
        )
    ).first()
    if existing:
        existing.content = body.content
        existing.updated_at = datetime.now(timezone.utc)
        db.add(existing)
    else:
        wf = WorkingFile(
            user_id=user_id, course_slug=slug, language=lang,
            filepath=filepath, content=body.content,
        )
        db.add(wf)
    db.commit()
    return {"status": "saved", "filepath": filepath}
