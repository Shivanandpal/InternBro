from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.application import (
    Application,
    ApplicationStatus,
)
from app.models.internship import Internship


class DashboardService:

    @staticmethod
    def student_dashboard(db: Session, student):

        applications = (
            db.query(Application)
            .filter(Application.student_id == student.id)
            .all()
        )

        return {
            "total_applications": len(applications),

            "pending": sum(
                a.status == ApplicationStatus.PENDING
                for a in applications
            ),

            "shortlisted": sum(
                a.status == ApplicationStatus.SHORTLISTED
                for a in applications
            ),

            "accepted": sum(
                a.status == ApplicationStatus.ACCEPTED
                for a in applications
            ),

            "rejected": sum(
                a.status == ApplicationStatus.REJECTED
                for a in applications
            ),

            "recent_applications":
                sorted(
                    applications,
                    key=lambda x: x.applied_at,
                    reverse=True
                )[:5]
        }

    @staticmethod
    def recruiter_dashboard(db: Session, recruiter):

        internships = (
            db.query(Internship)
            .filter(
                Internship.recruiter_id == recruiter.id
            )
            .all()
        )

        internship_ids = [i.id for i in internships]

        applications = (
            db.query(Application)
            .filter(
                Application.internship_id.in_(internship_ids)
            )
            .all()
        )

        return {

            "total_internships": len(internships),

            "total_applications": len(applications),

            "pending": sum(
                a.status == ApplicationStatus.PENDING
                for a in applications
            ),

            "shortlisted": sum(
                a.status == ApplicationStatus.SHORTLISTED
                for a in applications
            ),

            "accepted": sum(
                a.status == ApplicationStatus.ACCEPTED
                for a in applications
            ),

            "rejected": sum(
                a.status == ApplicationStatus.REJECTED
                for a in applications
            ),
        }