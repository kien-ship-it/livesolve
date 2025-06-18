# backend/app/db/models.py

from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func
from .base import Base

class Submission(Base):
    """
    Database model for a user's submission.
    """
    __tablename__ = "submissions"

    # Columns for the 'submissions' table
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    problem_id = Column(String, nullable=False, index=True)
    image_gcs_url = Column(String(2048), nullable=False)
    ocr_text = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)

    # The 'server_default=func.now()' tells the PostgreSQL database to automatically
    # set the current timestamp when a new row is created.
    submitted_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<Submission(id={self.id}, user_id='{self.user_id}', problem_id='{self.problem_id}')>"