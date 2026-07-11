from pydantic import BaseModel
from typing import List
from app.schemas.application import ApplicationResponse


class StudentDashboardResponse(BaseModel):
    total_applications: int
    pending: int
    shortlisted: int
    accepted: int
    rejected: int
    recent_applications: List[ApplicationResponse]


class RecruiterDashboardResponse(BaseModel):
    total_internships: int
    total_applications: int
    pending: int
    shortlisted: int
    accepted: int
    rejected: int