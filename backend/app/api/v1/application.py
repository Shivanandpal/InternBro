from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.dependencies.roles import require_roles
from app.dependencies.auth import get_current_user
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


@router.get("/")
def get_applications(
    studentId: str | None = None,
    recruiterId: str | None = None,
    jobId: str | None = None,
    db: Session = Depends(get_db)
):
    from app.models.application import Application
    from app.models.internship import Internship
    from app.models.user import User

    query = db.query(Application)

    if studentId:
        query = query.filter(Application.student_id == studentId)
    if jobId:
        query = query.filter(Application.internship_id == jobId)
    if recruiterId:
        query = query.filter(Application.internship_id == Internship.id).filter(Internship.recruiter_id == recruiterId)

    applications = query.all()
    results = []

    for app in applications:
        internship = db.query(Internship).filter(Internship.id == app.internship_id).first()
        job_details = {}
        if internship:
            job_details = {
                "id": internship.id,
                "title": internship.title,
                "company": internship.company,
                "location": internship.location,
                "stipend": internship.stipend,
                "duration": internship.duration
            }

        student = db.query(User).filter(User.id == app.student_id).first()
        student_name = student.name if student else "Unknown Student"
        student_email = student.email if student else ""

        results.append({
            "id": app.id,
            "jobId": app.internship_id,
            "studentId": app.student_id,
            "studentName": student_name,
            "studentEmail": student_email,
            "resumeUrl": app.resume_url,
            "skills": [],
            "status": app.status.value if hasattr(app.status, "value") else app.status,
            "appliedAt": app.applied_at.isoformat() if app.applied_at else datetime.now().isoformat(),
            "jobDetails": job_details
        })

    return results


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