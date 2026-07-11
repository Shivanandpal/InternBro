from sqlalchemy.orm import Session

from app.models.internship import Internship


class InternshipRepository:

    @staticmethod
    def create(db: Session, internship: Internship):

        db.add(internship)

        db.commit()

        db.refresh(internship)

        return internship

    @staticmethod
    def get_all(db: Session, status: str = None):
        query = db.query(Internship)
        if status:
            query = query.filter(Internship.status == status)
        return query.all()

    @staticmethod
    def get_by_recruiter(
        db: Session,
        recruiter_id: str
    ):

        return db.query(Internship).filter(
            Internship.recruiter_id == recruiter_id
        ).all()

    @staticmethod
    def get_by_id(db, internship_id):
        return (
            db.query(Internship)
            .filter(
                Internship.id == internship_id
            )
            .first()
        )