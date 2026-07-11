import uuid
import enum
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.database import Base
from sqlalchemy import UniqueConstraint

class ApplicationStatus(enum.Enum):
    PENDING = "PENDING"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    ACCEPTED = "ACCEPTED"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    student_id: Mapped[str] = mapped_column(
        ForeignKey("users.id")
    )

    internship_id: Mapped[str] = mapped_column(
        ForeignKey("internships.id")
    )

    resume_url: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    cover_letter: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus),
        default=ApplicationStatus.PENDING
    )

    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    '''__tablename__ = "applications"

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "internship_id",
            name="uq_student_internship"
        ),
    )'''