from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db

from app.dependencies.roles import require_roles
from app.models.user import Role

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def dashboard(
    current_user=Depends(require_roles(Role.ADMIN))
):

    return {
        "message": f"Welcome Admin {current_user.name}"
    }

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.ADMIN))
):
    from app.repositories.user_repository import UserRepository
    from app.repositories.recruiter_repository import RecruiterRepository
    
    users = UserRepository.get_all(db)
    recruiters = RecruiterRepository.get_all(db)
    
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value if hasattr(u.role, "value") else u.role,
            "dob": getattr(u, "dob", None),
            "college_name": getattr(u, "college_name", None),
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "premium": getattr(u, "premium", False)
        })
    for r in recruiters:
        result.append({
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "role": "RECRUITER",
            "company_name": r.company_name,
            "company_website": r.company_website,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "premium": False
        })
    return result
