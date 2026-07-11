from pydantic import BaseModel


class ResumeResponse(BaseModel):

    id: str

    student_id: str

    file_name: str

    file_path: str

    class Config:
        from_attributes = True