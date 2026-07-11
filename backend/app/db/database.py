import time
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Resilient Database Engine Initialization
DATABASE_URL = settings.DATABASE_URL
engine = None

if "neon.tech" in DATABASE_URL or DATABASE_URL.startswith("postgresql"):
    for attempt in range(3):
        try:
            engine = create_engine(
                DATABASE_URL,
                future=True,
                echo=True,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 10}
            )
            with engine.connect() as conn:
                pass
            print("DATABASE INFO: Connected to remote Neon PostgreSQL!")
            break
        except Exception as e:
            print(f"DATABASE INFO: Neon connection attempt {attempt+1} failed: {e}")
            if attempt < 2:
                time.sleep(2)
            else:
                print("DATABASE INFO: Neon connection failed permanently. Raising exception.")
                raise e
else:
    print("DATABASE INFO: No Neon DATABASE_URL provided. Using local SQLite.")
    engine = create_engine(
        "sqlite:///./internbro_local.db",
        connect_args={"check_same_thread": False},
        future=True,
        echo=True
    )

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False
)

# Auto-migration of missing User table columns
try:
    from sqlalchemy import inspect, text
    with engine.begin() as conn:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("users")]
            new_cols = {
                "dob": "VARCHAR(50)",
                "mobile_no": "VARCHAR(20)",
                "college_name": "VARCHAR(200)",
                "current_year": "VARCHAR(50)"
            }
            for col_name, col_type in new_cols.items():
                if col_name not in columns:
                    print(f"DATABASE INFO: Altering users table to add missing column: {col_name}")
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
except Exception as alter_err:
    print(f"DATABASE INFO: Auto-migration error: {alter_err}")

class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()