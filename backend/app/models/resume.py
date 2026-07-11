import uuid
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.database import Base


class Resume(Base):

    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    student_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        unique=True
    )

    file_name: Mapped[str] = mapped_column(String)

    file_path: Mapped[str] = mapped_column(String)

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )