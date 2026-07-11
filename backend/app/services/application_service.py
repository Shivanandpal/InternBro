from app.models.application import (
    Application,
    ApplicationStatus,
)

from app.repositories.application_repository import (
    ApplicationRepository
)


class ApplicationService:

    @staticmethod
    def apply(
        db,
        student,
        data
    ):

        existing = ApplicationRepository.already_applied(
            db,
            student.id,
            data.internship_id
        )

        if existing:
            raise ValueError(
                "Already applied"
            )

        application = Application(

            student_id=student.id,

            internship_id=data.internship_id,

            resume_url=data.resume_url,

            cover_letter=data.cover_letter,

        )

        return ApplicationRepository.create(
            db,
            application
        )

    @staticmethod
    def my_applications(
        db,
        student
    ):

        return ApplicationRepository.get_by_student(
            db,
            student.id
        )

    @staticmethod
    def internship_applications(
        db,
        internship_id,
    ):

        return ApplicationRepository.get_by_internship(
            db,
            internship_id,
        )

    @staticmethod
    def update_status(
        db,
        application_id,
        status,
    ):

        application = ApplicationRepository.get_by_id(
            db,
            application_id,
        )

        if not application:
            raise ValueError("Application not found")

        application.status = ApplicationStatus(status)

        return ApplicationRepository.update(
            db,
            application,
        )