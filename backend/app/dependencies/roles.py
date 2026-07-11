from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.user import Role


def require_roles(*roles: Role):

    def role_checker(current_user=Depends(get_current_user)):

        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource.",
            )

        return current_user

    return role_checker