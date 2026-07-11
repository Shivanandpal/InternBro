from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.internship import (
    InternshipCreate,
    InternshipResponse,
)
from app.services.internship_service import InternshipService
from app.dependencies.roles import require_roles
from app.models.user import Role

router = APIRouter(
    prefix="/internships",
    tags=["Internships"],
)


@router.post(
    "/",
    response_model=InternshipResponse,
)
def create_internship(
    internship: InternshipCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            Role.RECRUITER,
            Role.ADMIN,
        )
    ),
):
    return InternshipService.create(
        db,
        current_user,
        internship
    )


@router.get(
    "/",
    response_model=list[InternshipResponse],
)
def get_all_internships(
    status: str = None,
    db: Session = Depends(get_db),
):
    return InternshipService.get_all(db, status)

@router.get(
    "/my",
    response_model=list[InternshipResponse],
)
def my_internships(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            Role.RECRUITER,
            Role.ADMIN,
        )
    ),
):

    return InternshipService.recruiter_internships(
        db,
        current_user,
    )

from pydantic import BaseModel

class InternshipStatusUpdate(BaseModel):
    status: str

@router.put("/{internship_id}/status", response_model=InternshipResponse)
def update_internship_status(
    internship_id: str,
    status_data: InternshipStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN))
):
    from app.repositories.internship_repository import InternshipRepository
    internship = InternshipRepository.get_by_id(db, internship_id)
    if not internship:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Internship not found")
    internship.status = status_data.status
    db.commit()
    db.refresh(internship)
    return internship

@router.get("/{internship_id}", response_model=InternshipResponse)
def get_internship_by_id(
    internship_id: str,
    db: Session = Depends(get_db)
):
    from app.repositories.internship_repository import InternshipRepository
    from fastapi import HTTPException
    internship = InternshipRepository.get_by_id(db, internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship