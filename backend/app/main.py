from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from app.db.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.internship import router as internship_router
from app.api.v1.student import router as student_router
from app.api.v1.recruiter import router as recruiter_router
from app.api.v1.admin import router as admin_router
from app.api.v1.application import router as application_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.resume import router as resume_router
from app.api.v1.match import router as match_router
from app.api.v1.chat import router as chat_router
from app.api.v1.payment import router as payment_router

from app.models.user import User
from app.models.internship import Internship
from app.models.application import Application
from app.models.admin import Admin
from app.models.recruiter import Recruiter
from app.db.database import Base, engine, SessionLocal
from app.core.security import hash_password
Base.metadata.create_all(bind=engine)

# Dynamically alter table to add status if it doesn't exist
try:
    from sqlalchemy import text
    db_conn = SessionLocal()
    db_conn.execute(text("ALTER TABLE internships ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'"))
    db_conn.commit()
    db_conn.close()
    print("DATABASE INFO: Successfully added 'status' column to internships table.")
except Exception as e:
    # Column already exists or table doesn't exist
    pass

# Dynamically alter table to add type if it doesn't exist
try:
    from sqlalchemy import text
    db_conn = SessionLocal()
    db_conn.execute(text("ALTER TABLE internships ADD COLUMN type VARCHAR(50) DEFAULT 'On-site'"))
    db_conn.commit()
    db_conn.close()
    print("DATABASE INFO: Successfully added 'type' column to internships table.")
except Exception as e:
    # Column already exists or table doesn't exist
    pass

# Dynamically update foreign key constraint to recruiters table
try:
    from sqlalchemy import text
    db_conn = SessionLocal()
    db_conn.execute(text("ALTER TABLE internships DROP CONSTRAINT IF EXISTS internships_recruiter_id_fkey"))
    db_conn.execute(text("ALTER TABLE internships DROP CONSTRAINT IF EXISTS fk_recruiter"))
    db_conn.execute(text("ALTER TABLE internships DROP CONSTRAINT IF EXISTS fk_recruiter_recruiters"))
    # Delete orphan applications first to avoid foreign key violations
    db_conn.execute(text("DELETE FROM applications WHERE internship_id IN (SELECT id FROM internships WHERE recruiter_id NOT IN (SELECT id FROM recruiters))"))
    # Delete orphan internships to avoid constraint violations
    db_conn.execute(text("DELETE FROM internships WHERE recruiter_id NOT IN (SELECT id FROM recruiters)"))
    db_conn.execute(text("ALTER TABLE internships ADD CONSTRAINT fk_recruiter_recruiters FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE"))
    db_conn.commit()
    db_conn.close()
    print("DATABASE INFO: Successfully updated internships foreign key to recruiters table.")
except Exception as e:
    if 'db_conn' in locals():
        db_conn.close()
    print(f"DATABASE INFO: Foreign key migration notice: {e}")

# Seed default admin if none exist
try:
    db = SessionLocal()
    if db.query(Admin).count() == 0:
        print("DATABASE INFO: Seeding default admin user...")
        default_admin = Admin(
            name="Super Admin",
            email="admin@internbro.com",
            password=hash_password("admin123")
        )
        db.add(default_admin)
        db.commit()
        print("DATABASE INFO: Default admin (admin@internbro.com / admin123) seeded successfully!")
    db.close()
except Exception as e:
    print(f"DATABASE INFO: Admin seeding error: {e}")

# Seed default recruiter and mock internships if none exist
try:
    db = SessionLocal()
    
    # 1. Seed default recruiter if not present
    default_recruiter = db.query(Recruiter).filter(Recruiter.id == 'default-recruiter-id').first()
    if not default_recruiter:
        print("DATABASE INFO: Seeding default recruiter user...")
        default_recruiter = Recruiter(
            id='default-recruiter-id',
            name='Default Recruiter',
            email='recruiter@internbro.com',
            password=hash_password('recruiter123'),
            company_name='InternBRO Corporation',
            company_website='https://internbro.com'
        )
        db.add(default_recruiter)
        db.commit()
        print("DATABASE INFO: Default recruiter seeded successfully!")

    # 2. Seed mock internships if count is low
    mock_jobs = [
        {
            "id": "job-google-1",
            "title": "Software Engineering Intern (Frontend)",
            "company": "Google",
            "location": "Bangalore, India",
            "type": "Hybrid",
            "stipend": "₹85,000 / month",
            "duration": "6 Months",
            "description": "Google's software engineers develop the next-generation technologies that change how billions of users connect, explore, and interact with information.",
            "skills": "React.js, JavaScript, TypeScript, HTML/CSS, Data Structures",
            "status": "Approved"
        },
        {
            "id": "job-figma-2",
            "title": "UI/UX Design Intern",
            "company": "Figma",
            "location": "Remote",
            "type": "Remote",
            "stipend": "$3,000 / month",
            "duration": "3 Months",
            "description": "Join Figma's design team to shape the future of collaborative design tools.",
            "skills": "Figma, User Research, Wireframing, Prototyping, Design Systems",
            "status": "Approved"
        },
        {
            "id": "job-stripe-3",
            "title": "Backend Engineering Intern",
            "company": "Stripe",
            "location": "San Francisco, USA",
            "type": "Hybrid",
            "stipend": "$5,500 / month",
            "duration": "6 Months",
            "description": "Stripe builds the economic infrastructure for the internet. As a backend intern, you will help design, build, and maintain the server-side API systems.",
            "skills": "Node.js, Express, REST APIs, SQL, Redis",
            "status": "Approved"
        },
        {
            "id": "job-meta-4",
            "title": "Data Science & AI Intern",
            "company": "Meta",
            "location": "London, UK",
            "type": "On-site",
            "stipend": "£3,800 / month",
            "duration": "4 Months",
            "description": "Meta is looking for Data Scientist Interns to help turn data into insights and direct decisions.",
            "skills": "Python, SQL, Pandas, Scikit-Learn, Machine Learning",
            "status": "Approved"
        },
        {
            "id": "job-vercel-5",
            "title": "Full-Stack Web Intern",
            "company": "Vercel",
            "location": "Remote",
            "type": "Remote",
            "stipend": "$4,500 / month",
            "duration": "6 Months",
            "description": "Vercel provides the developer platform to deploy web applications. Work as a Full-Stack developer intern directly on our developer portal dashboard.",
            "skills": "Next.js, React.js, Tailwind CSS, TypeScript, Node.js",
            "status": "Approved"
        },
        {
            "id": "job-stripe-6",
            "title": "Product Management Intern",
            "company": "Stripe",
            "location": "Remote",
            "type": "Remote",
            "stipend": "$4,000 / month",
            "duration": "3 Months",
            "description": "As a Product Management Intern, you will work at the intersection of design, engineering, and business.",
            "skills": "Product Strategy, User Interviews, Market Analysis, Agile Roadmap",
            "status": "Approved"
        },
        {
            "id": "job-airbnb-7",
            "title": "Mobile App Developer (React Native)",
            "company": "Airbnb",
            "location": "Mumbai, India",
            "type": "Hybrid",
            "stipend": "₹50,000 / month",
            "duration": "6 Months",
            "description": "Airbnb is looking for a mobile app developer intern to join our core mobile engineering group.",
            "skills": "React Native, JavaScript, iOS/Android, Redux Toolkit",
            "status": "Approved"
        },
        {
            "id": "job-aws-8",
            "title": "Cloud Support Associate",
            "company": "Amazon Web Services (AWS)",
            "location": "Pune, India",
            "type": "On-site",
            "stipend": "₹45,000 / month",
            "duration": "6 Months",
            "description": "AWS cloud is growing exponentially. Work in our Enterprise support desk helping cloud architects build robust networks.",
            "skills": "Linux, Networking, AWS, Bash Scripting, Troubleshooting",
            "status": "Approved"
        }
    ]

    if db.query(Internship).count() < 5:
        print("DATABASE INFO: Seeding mock internships...")
        for job_data in mock_jobs:
            existing_job = db.query(Internship).filter(Internship.id == job_data["id"]).first()
            if not existing_job:
                new_job = Internship(
                    id=job_data["id"],
                    title=job_data["title"],
                    company=job_data["company"],
                    location=job_data["location"],
                    type=job_data["type"],
                    stipend=job_data["stipend"],
                    duration=job_data["duration"],
                    description=job_data["description"],
                    skills=job_data["skills"],
                    status=job_data["status"],
                    recruiter_id='default-recruiter-id'
                )
                db.add(new_job)
        db.commit()
        print("DATABASE INFO: Mock internships seeded successfully!")

    # 3. Update existing mock internships with their correct type
    try:
        updated_any = False
        for job_data in mock_jobs:
            existing_job = db.query(Internship).filter(Internship.id == job_data["id"]).first()
            if existing_job and existing_job.type != job_data["type"]:
                existing_job.type = job_data["type"]
                updated_any = True
        if updated_any:
            db.commit()
            print("DATABASE INFO: Successfully updated existing mock internship types.")
    except Exception as update_err:
        print(f"DATABASE INFO: Internship type update error: {update_err}")

    # 4. Clean up any null recruiter_id fields in existing internships
    try:
        updated_rec = False
        null_rec_jobs = db.query(Internship).filter(Internship.recruiter_id == None).all()
        for job in null_rec_jobs:
            job.recruiter_id = 'default-recruiter-id'
            updated_rec = True
        if updated_rec:
            db.commit()
            print("DATABASE INFO: Successfully cleaned up null recruiter_id fields.")
    except Exception as clean_err:
        print(f"DATABASE INFO: Internship recruiter_id cleanup error: {clean_err}")

    db.close()
except Exception as e:
    print(f"DATABASE INFO: Internship seeding error: {e}")

# Migrate users from SQLite to Neon PostgreSQL if needed
try:
    import os
    sqlite_db_path = "internbro_local.db"
    if os.path.exists(sqlite_db_path):
        print("DATABASE MIGRATION: SQLite database found. Checking for users to migrate...")
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}")
        SqliteSession = sessionmaker(bind=sqlite_engine)
        sqlite_db = SqliteSession()
        
        # Read users from SQLite
        from sqlalchemy import text
        sqlite_users = sqlite_db.execute(text("SELECT * FROM users")).fetchall()
        
        neon_db = SessionLocal()
        migrated_count = 0
        for u in sqlite_users:
            exists = neon_db.execute(text("SELECT 1 FROM users WHERE email = :email"), {"email": u.email}).first()
            if not exists:
                neon_db.execute(text(
                    "INSERT INTO users (id, name, email, password, role, premium, verified, created_at) "
                    "VALUES (:id, :name, :email, :password, :role, :premium, :verified, :created_at)"
                ), {
                    "id": u.id,
                    "name": u.name,
                    "email": u.email,
                    "password": u.password,
                    "role": u.role,
                    "premium": u.premium,
                    "verified": u.verified,
                    "created_at": u.created_at
                })
                migrated_count += 1
                
        if migrated_count > 0:
            neon_db.commit()
            print(f"DATABASE MIGRATION: Successfully migrated {migrated_count} users to Neon PostgreSQL!")
        else:
            print("DATABASE MIGRATION: All users are already synced.")

        # Migrate recruiters
        try:
            sqlite_recruiters = sqlite_db.execute(text("SELECT * FROM recruiters")).fetchall()
            migrated_rec_count = 0
            for r in sqlite_recruiters:
                exists = neon_db.execute(text("SELECT 1 FROM recruiters WHERE email = :email"), {"email": r.email}).first()
                if not exists:
                    neon_db.execute(text(
                        "INSERT INTO recruiters (id, name, email, password, company_name, company_website, created_at) "
                        "VALUES (:id, :name, :email, :password, :company_name, :company_website, :created_at)"
                    ), {
                        "id": r.id,
                        "name": r.name,
                        "email": r.email,
                        "password": r.password,
                        "company_name": r.company_name,
                        "company_website": r.company_website,
                        "created_at": r.created_at
                    })
                    migrated_rec_count += 1
            if migrated_rec_count > 0:
                neon_db.commit()
                print(f"DATABASE MIGRATION: Successfully migrated {migrated_rec_count} recruiters to Neon PostgreSQL!")
        except Exception as rec_err:
            pass
            
        sqlite_db.close()
        neon_db.close()
except Exception as migrate_err:
    print(f"DATABASE MIGRATION: User migration notice/skipping: {migrate_err}")
app = FastAPI(
    title="InternBro API",
    version="1.0.0"
)
app.include_router(student_router)
app.include_router(recruiter_router)
app.include_router(admin_router)
app.include_router(internship_router)
app.include_router(application_router)
app.include_router(dashboard_router)
app.include_router(resume_router)
app.include_router(match_router)
app.include_router(chat_router)
app.include_router(payment_router)

origins = [
    "https://internbro-09.vercel.app"
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "InternBro Backend Running 🚀"
    }