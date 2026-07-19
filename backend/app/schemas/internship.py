from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InternshipCreate(BaseModel):

    title: str
    company: str
    location: str
    stipend: str
    duration: str
    description: str
    skills: str
    type: str = "On-site"


class InternshipResponse(InternshipCreate):

    id: str
    recruiter_id: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True