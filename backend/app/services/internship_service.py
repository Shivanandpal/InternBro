from sqlalchemy.orm import Session

from app.models.internship import Internship
from app.repositories.internship_repository import InternshipRepository


class InternshipService:

    @staticmethod
    def create(db,current_user, data):

        from app.models.user import Role
        status_value = "Approved" if current_user.role == Role.ADMIN else "Pending"

        internship = Internship(
            recruiter_id=current_user.id,
            title=data.title,
            company=data.company,
            location=data.location,
            type=data.type,
            stipend=data.stipend,
            duration=data.duration,
            skills=(data.skills),
            description=data.description,
            status=status_value
        )

        return InternshipRepository.create(
            db,
            internship
        )

    @staticmethod
    def get_all(db: Session, status: str = None):
        return InternshipRepository.get_all(db, status)

    @staticmethod
    def recruiter_internships(
        db: Session,
        recruiter
    ):

        return InternshipRepository.get_by_recruiter(
            db,
            recruiter.id
        )