from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.repositories.user_repository import UserRepository
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    email = payload.get("sub")

    user = UserRepository.get_by_email(
        db,
        email,
    )

    if user is None:
        from app.repositories.admin_repository import AdminRepository
        user = AdminRepository.get_by_email(db, email)

    if user is None:
        from app.repositories.recruiter_repository import RecruiterRepository
        user = RecruiterRepository.get_by_email(db, email)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user