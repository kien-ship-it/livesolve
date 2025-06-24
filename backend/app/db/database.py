# backend/app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator

from app.core.config import settings

# The database engine is the entry point to our database.
# It's configured with the DATABASE_URL from our settings.
# The pool_pre_ping is a good practice to ensure the database connection is
# alive before use, which helps prevent connection errors.
engine = create_engine(str(settings.DATABASE_URL), pool_pre_ping=True)

# A SessionLocal class is created using the sessionmaker factory.
# Each instance of SessionLocal will be a new database session.
# This session is the "handle" we'll use to interact with the database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()