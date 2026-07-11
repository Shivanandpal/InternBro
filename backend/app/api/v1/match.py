from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.roles import require_roles
from app.models.user import Role

from app.repositories.resume_repository import ResumeRepository
from app.repositories.internship_repository import InternshipRepository

from app.ai.resume_parser import ResumeParser
from app.ai.match_service import MatchService

from app.schemas.match import MatchResponse

router = APIRouter(
    prefix="/match",
    tags=["AI Match"]
)


@router.get(
    "/{internship_id}",
    response_model=MatchResponse
)
def match_resume(
    internship_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.STUDENT))
):

    resume = ResumeRepository.get_by_student(
        db,
        current_user.id
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Upload resume first."
        )

    internship = InternshipRepository.get_by_id(
        db,
        internship_id
    )

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Internship not found."
        )

    resume_text = ResumeParser.extract_text(
        resume.file_path
    )

    result = MatchService.match_resume(
        resume_text,
        internship
    )

    return result