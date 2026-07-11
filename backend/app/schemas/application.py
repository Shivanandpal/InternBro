from datetime import datetime

from pydantic import BaseModel

from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    internship_id: str
    cover_letter: str | None = None
    resume_url: str | None = None


class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    internship_id: str
    cover_letter: str | None
    resume_url: str | None
    status: ApplicationStatus
    applied_at: datetime

    model_config = {
        "from_attributes": True
    }