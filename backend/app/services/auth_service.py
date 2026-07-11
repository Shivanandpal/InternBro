from app.db import database
from sqlalchemy.orm import Session

from app.models.user import User, Role
from app.repositories.user_repository import UserRepository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


class AuthService:

    @staticmethod
    def signup(db: Session, data):
        role_enum = Role(data.role.upper())
        
        if role_enum == Role.RECRUITER:
            from app.repositories.recruiter_repository import RecruiterRepository
            from app.models.recruiter import Recruiter
            
            existing = RecruiterRepository.get_by_email(db, data.email)
            if existing:
                raise ValueError("Email already exists")
                
            recruiter = Recruiter(
                name=data.name,
                email=data.email,
                password=hash_password(data.password),
                company_name=getattr(data, 'company_name', ''),
                company_website=getattr(data, 'company_website', '')
            )
            RecruiterRepository.create(db, recruiter)
            user_obj = recruiter
        else:
            existing = UserRepository.get_by_email(
                db,
                data.email
            )
            if existing:
                raise ValueError("Email already exists")

            user = User(
                name=data.name,
                email=data.email,
                password=hash_password(data.password),
                role=role_enum
            )
            UserRepository.create(db, user)
            user_obj = user

        token = create_access_token(
            {
                "sub": user_obj.email,
                "role": user_obj.role.value
            }
        )

        return token

    @staticmethod
    def login(db: Session, email: str, password: str):

        user = UserRepository.get_by_email(db, email)
        
        if not user:
            from app.repositories.admin_repository import AdminRepository
            user = AdminRepository.get_by_email(db, email)

        if not user:
            from app.repositories.recruiter_repository import RecruiterRepository
            user = RecruiterRepository.get_by_email(db, email)

        if not user:
            raise ValueError("Invalid credentials")

        if not verify_password(password, user.password):
            raise ValueError("Invalid credentials")

        token = create_access_token(
            {
                "sub": user.email,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }