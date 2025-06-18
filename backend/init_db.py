# backend/init_db.py

import logging
from app.db.base import Base
from app.db.database import engine
from app.db.models import Submission # Make sure Submission is imported

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Creates all database tables defined by the SQLAlchemy models.
    """
    logger.info("Connecting to the database and creating tables...")
    try:
        # The Base.metadata object has collected all the models that inherit from it.
        # create_all(engine) issues the 'CREATE TABLE' statements to the database
        # for all tables that do not already exist.
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully (if they didn't exist).")
    except Exception as e:
        logger.error(f"An error occurred while creating database tables: {e}")
        raise

if __name__ == "__main__":
    init_db()