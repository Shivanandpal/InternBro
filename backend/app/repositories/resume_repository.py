from sqlalchemy.orm import Session

from app.models.resume import Resume


class ResumeRepository:

    @staticmethod
    def create(db: Session, resume: Resume):

        db.add(resume)

        db.commit()

        db.refresh(resume)

        return resume

    @staticmethod
    def get_by_student(db, student_id):

        return (
            db.query(Resume)
            .filter(Resume.student_id == student_id)
            .first()
        )

    @staticmethod
    def update(db, resume):

        db.commit()

        db.refresh(resume)

        return resume