from fastapi import APIRouter, Depends

from app.dependencies.roles import require_roles
from app.models.user import Role

router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"]
)


@router.get("/dashboard")
def dashboard(
    current_user=Depends(require_roles(Role.RECRUITER))
):

    return {
        "message": f"Welcome Recruiter {current_user.name}"
    }