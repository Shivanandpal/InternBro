from sqlalchemy.orm import Session
from app.models.recruiter import Recruiter

class RecruiterRepository:

    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(Recruiter).filter(Recruiter.email == email).first()

    @staticmethod
    def create(db: Session, recruiter: Recruiter):
        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)
        return recruiter

    @staticmethod
    def get_by_id(db: Session, recruiter_id: str):
        return db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()

    @staticmethod
    def get_all(db: Session):
        return db.query(Recruiter).all()
