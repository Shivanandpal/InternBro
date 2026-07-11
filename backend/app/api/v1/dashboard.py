from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.roles import require_roles

from app.models.user import Role

from app.schemas.dashboard import (
    StudentDashboardResponse,
    RecruiterDashboardResponse,
)

from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/student",
    response_model=StudentDashboardResponse
)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.STUDENT))
):

    return DashboardService.student_dashboard(
        db,
        current_user
    )


@router.get(
    "/recruiter",
    response_model=RecruiterDashboardResponse
)
def recruiter_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            Role.RECRUITER,
            Role.ADMIN
        )
    )
):

    return DashboardService.recruiter_dashboard(
        db,
        current_user
    )