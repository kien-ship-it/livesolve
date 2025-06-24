# backend/app/db/crud_submission.py

from sqlalchemy.orm import Session

from .. import schemas
from . import models

def create_submission(db: Session, *, submission: schemas.SubmissionCreate) -> models.Submission:
    """
    Create a new submission record in the database.

    Args:
        db: The SQLAlchemy database session.
        submission: A Pydantic schema containing the submission data.

    Returns:
        The newly created SQLAlchemy Submission object.
    """
    # Create a new SQLAlchemy model instance from the Pydantic schema data
    db_submission = models.Submission(
        user_id=submission.user_id,
        problem_id=submission.problem_id,
        image_gcs_url=str(submission.image_gcs_url), # Ensure URL is a string
        ocr_text=submission.ocr_text,
        ai_feedback=submission.ai_feedback,
    )

    # Add the new instance to the session, commit it to the database,
    # and refresh the instance to get DB-generated values (like id)
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    return db_submission