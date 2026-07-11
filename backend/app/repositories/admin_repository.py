from sqlalchemy.orm import Session
from app.models.admin import Admin

class AdminRepository:

    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(Admin).filter(Admin.email == email).first()

    @staticmethod
    def create(db: Session, admin: Admin):
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    @staticmethod
    def get_by_id(db: Session, admin_id: str):
        return db.query(Admin).filter(Admin.id == admin_id).first()
