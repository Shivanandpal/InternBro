from pydantic import BaseModel


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
    recruiter_id: str | None = None
    status: str

    class Config:
        from_attributes = True