import uuid
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.user import Role

class Recruiter(Base):
    __tablename__ = "recruiters"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )
    password: Mapped[str] = mapped_column(String(255))
    company_name: Mapped[str] = mapped_column(String(200), nullable=True)
    company_website: Mapped[str] = mapped_column(String(200), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    @property
    def role(self):
        return Role.RECRUITER
