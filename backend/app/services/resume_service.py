import os
import shutil
import uuid

from fastapi import UploadFile

from app.models.resume import Resume
from app.repositories.resume_repository import ResumeRepository


UPLOAD_DIR = "uploads/resumes"


class ResumeService:

    @staticmethod
    def upload_resume(db, student, file: UploadFile):

        # Create uploads directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Check if student already has a resume
        existing_resume = ResumeRepository.get_by_student(
            db,
            student.id
        )

        # Generate unique filename
        extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{extension}"

        filepath = os.path.join(
            UPLOAD_DIR,
            filename
        )

        # Save file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Update existing resume
        if existing_resume:

            # Delete old file
            if os.path.exists(existing_resume.file_path):
                os.remove(existing_resume.file_path)

            existing_resume.file_name = file.filename
            existing_resume.file_path = filepath

            return ResumeRepository.update(
                db,
                existing_resume
            )

        # Create new record
        resume = Resume(
            student_id=student.id,
            file_name=file.filename,
            file_path=filepath
        )

        return ResumeRepository.create(
            db,
            resume
        )