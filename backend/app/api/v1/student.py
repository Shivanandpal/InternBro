from fastapi import APIRouter, Depends

from app.dependencies.roles import require_roles
from app.models.user import Role

router = APIRouter(
    prefix="/student",
    tags=["Student"]
)


@router.get("/dashboard")
def dashboard(
    current_user=Depends(require_roles(Role.STUDENT))
):

    return {
        "message": f"Welcome Student {current_user.name}"
    }