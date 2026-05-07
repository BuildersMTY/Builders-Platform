# backend/api/routers/run.py
from __future__ import annotations
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from api.config import settings
from api.course_loader import cache as course_cache
from api.course_loader.defaults import resolve_cmd
from api.db.models import Enrollment, WorkingFile
from api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/run", tags=["run"])

# In-memory store for pending run requests.
# run_id -> dict with request payload and metadata
pending_runs: dict[str, dict] = {}

@router.post("/{slug}/{lang}/{submodule_id:path}")
def start_run(slug: str, lang: str, submodule_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):

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

    # Find the submodule
    submodule = None
    for module in course.modules:
        for sub in module.submodules:
            if sub.full_id == submodule_id:
                submodule = sub
                break

    if not submodule:
        raise HTTPException(status_code=404, detail="Submodule not found")

    # Read ALL working files for this enrollment
    files = db.exec(
        select(WorkingFile).where(
            WorkingFile.user_id == user_id,
            WorkingFile.course_slug == slug,
            WorkingFile.language == lang,
        )
    ).all()
    file_map = {f.filepath: f.content for f in files}

    # Resolve commands
    language = course.meta.language
    build_cmd = resolve_cmd("build_cmd", course.meta.build_cmd, language)
    run_cmd = resolve_cmd("run_cmd", course.meta.run_cmd, language)
    unit_cmd = resolve_cmd("unit_cmd", course.meta.unit_cmd, language)

    # Build test specs, inline script content
    tests = []
    course_dir = Path(settings.courses_path) / slug / lang
    for test in submodule.tests:
        spec = test.model_dump(exclude_none=True)
        if test.type == "script" and test.file:
            script_path = course_dir / test.file
            if script_path.exists():
                spec["file_content"] = script_path.read_text(encoding="utf-8")
            spec.pop("file", None)
        tests.append(spec)

    run_id = str(uuid.uuid4())
    run_request = {
        "run_id": run_id,
        "language": language,
        "build_cmd": build_cmd,
        "run_cmd": run_cmd,
        "unit_cmd": unit_cmd,
        "files": file_map,
        "tests": tests,
    }

    pending_runs[run_id] = {
        "request": run_request,
        "user_id": user_id,
        "course_slug": slug,
        "language": lang,
        "submodule_id": submodule_id,
    }

    return {"run_id": run_id}
