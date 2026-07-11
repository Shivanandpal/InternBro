from sqlalchemy.orm import Session

from app.models.application import Application


class ApplicationRepository:

    @staticmethod
    def create(db: Session, application: Application):
        db.add(application)
        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def get_by_student(db: Session, student_id: str):
        return (
            db.query(Application)
            .filter(Application.student_id == student_id)
            .all()
        )

    @staticmethod
    def get_by_internship(db: Session, internship_id: str):
        return (
            db.query(Application)
            .filter(Application.internship_id == internship_id)
            .all()
        )

    @staticmethod
    def already_applied(
        db: Session,
        student_id: str,
        internship_id: str,
    ):
        return (
            db.query(Application)
            .filter(
                Application.student_id == student_id,
                Application.internship_id == internship_id,
            )
            .first()
        )

    @staticmethod
    def get_by_id(db: Session, application_id: str):
        return (
            db.query(Application)
            .filter(Application.id == application_id)
            .first()
        )


    @staticmethod
    def update(db, application):
        db.commit()
        db.refresh(application)
        return application  