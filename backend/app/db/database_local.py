# backend/app/db/database_local.py
# Local database configuration with SQLite support

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator

def get_local_db_engine():
    """Create a local SQLite database engine"""
    from app.core.config_local import local_settings
    
    # Create SQLite database URL
    db_path = local_settings.SQLITE_DB_PATH
    sqlite_url = f"sqlite:///{db_path}"
    
    # Create engine with SQLite-specific settings
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},  # SQLite specific
        echo=True  # Log SQL queries for debugging
    )
    
    return engine

def get_local_db_session():
    """Get a local database session"""
    engine = get_local_db_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def get_local_db() -> Generator:
    """Dependency for getting local database session"""
    db = get_local_db_session()
    try:
        yield db
    finally:
        db.close()

def init_local_db():
    """Initialize the local SQLite database with tables"""
    from app.db.base import Base
    from app.db.models import Submission
    
    engine = get_local_db_engine()
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Local SQLite database initialized successfully")
