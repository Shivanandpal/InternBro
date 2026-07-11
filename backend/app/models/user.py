import uuid
import enum
from datetime import datetime

from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import Enum
from sqlalchemy import Integer
from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.sql import func

from app.db.database import Base


class Role(enum.Enum):
    STUDENT = "STUDENT"
    RECRUITER = "RECRUITER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

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

    password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    google_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True
    )

    role: Mapped[Role] = mapped_column(
        Enum(Role),
        default=Role.STUDENT
    )

    premium: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    premium_expiry: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True),
    nullable=True
    )

    free_chat_used: Mapped[int] = mapped_column(
    Integer,
        default=0
    )

    free_resume_used: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    dob: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    mobile_no: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    college_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )

    current_year: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )