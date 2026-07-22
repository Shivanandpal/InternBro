from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import Role


class UserBase(BaseModel):
    name: str
    email: EmailStr
    dob: Optional[str] = None
    mobile_no: Optional[str] = None
    college_name: Optional[str] = None
    current_year: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    dob: Optional[str] = None
    mobile_no: Optional[str] = None
    college_name: Optional[str] = None
    current_year: Optional[str] = None
    premium: Optional[bool] = None
    verified: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    role: Role
    premium: bool
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
