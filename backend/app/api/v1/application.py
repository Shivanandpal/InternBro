from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.roles import require_roles
from app.models.user import Role
from app.models.application import ApplicationStatus
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
)
from app.services.application_service import (
    ApplicationService,
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


@router.post(
    "/",
    response_model=ApplicationResponse,
)
def apply(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.STUDENT)),
):

    try:
        return ApplicationService.apply(
            db,
            current_user,
            data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "/my",
    response_model=list[ApplicationResponse],
)
def my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.STUDENT)),
):
    return ApplicationService.my_applications(
        db,
        current_user,
    )


@router.get(
    "/internship/{internship_id}",
    response_model=list[ApplicationResponse],
)
def internship_applications(
    internship_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            Role.RECRUITER,
            Role.ADMIN,
        )
    ),
):
    return ApplicationService.internship_applications(
        db,
        internship_id,
    )


@router.put("/{application_id}/status")
def update_status(
    application_id: str,
    status: ApplicationStatus,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            Role.RECRUITER,
            Role.ADMIN,
        )
    ),
):

    try:
        return ApplicationService.update_status(
            db,
            application_id,
            status,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

from pydantic import BaseModel
class ApplicationSyncStatus(BaseModel):
    student_id: str
    internship_id: str
    status: str

@router.put("/sync-status")
def sync_status(
    data: ApplicationSyncStatus,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.RECRUITER, Role.ADMIN))
):
    try:
        from app.models.application import Application, ApplicationStatus
        
        # Find application in Neon database by student_id and internship_id
        application = db.query(Application).filter(
            Application.student_id == data.student_id,
            Application.internship_id == data.internship_id
        ).first()
        
        status_enum = ApplicationStatus[data.status.upper()]
        
        if not application:
            # If application doesn't exist in Neon PostgreSQL yet, create it!
            application = Application(
                student_id=data.student_id,
                internship_id=data.internship_id,
                status=status_enum
            )
            db.add(application)
            db.commit()
            db.refresh(application)
            return {"status": "created", "id": application.id}
            
        application.status = status_enum
        db.commit()
        return {"status": "updated", "id": application.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))