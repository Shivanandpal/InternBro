import uuid
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy import String, Text, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.database import Base


class Internship(Base):
    __tablename__ = "internships"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    recruiter_id: Mapped[str] = mapped_column(
        ForeignKey("recruiters.id")
    )

    title: Mapped[str] = mapped_column(String(200))

    company: Mapped[str] = mapped_column(String(200))

    location: Mapped[str] = mapped_column(String(200))

    stipend: Mapped[str] = mapped_column(String(100))

    duration: Mapped[str] = mapped_column(String(100))

    description: Mapped[str] = mapped_column(Text)

    skills: Mapped[str] = mapped_column(Text)

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Pending"
    )

    type: Mapped[str] = mapped_column(
        String(50),
        default="On-site"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )