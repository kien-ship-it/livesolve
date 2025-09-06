#
# FILE: backend/app/api/v1/endpoints/submission_local.py
# Local submission endpoint using SQLite
#

import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status

from ....core.security import get_current_user, User
from ....services import gcs_service, feedback_service
from ....schemas import submission as submission_schema
from ....db import crud_submission
from ....db.database_local import get_local_db
from ....core.config_local import local_settings

router = APIRouter()

@router.post(
    "/submit/solution-local",
    response_model=submission_schema.SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_solution_and_get_feedback_local(
    *,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Local version of submission endpoint using SQLite instead of Cloud SQL.
    This endpoint:
    1. Uploads image to GCS
    2. Sends image to AI for error detection
    3. Stores the submission in local SQLite database
    4. Returns the structured data to the client
    """
    problem_id = local_settings.PROBLEM_ID_MVP or "problem_1_algebra"

    # Upload to GCS
    public_gcs_url = gcs_service.upload_image_to_gcs(
        file=file, user_id=current_user.uid
    )
    if not public_gcs_url:
        raise HTTPException(status_code=500, detail="Failed to upload image.")

    # Convert to GCS URI for AI processing
    gcs_bucket_name = local_settings.GCS_BUCKET_NAME
    gcs_uri = public_gcs_url.replace(
        f"https://storage.googleapis.com/{gcs_bucket_name}/",
        f"gs://{gcs_bucket_name}/",
    )

    try:
        # Get AI feedback
        ai_feedback_data = feedback_service.get_errorbouding_from_image(
            gcs_uri=gcs_uri
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate AI feedback: {e}"
        )

    # Store in local SQLite database
    ai_feedback_json_string = json.dumps(ai_feedback_data)
    
    submission_data = submission_schema.SubmissionCreate(
        user_id=current_user.uid,
        problem_id=problem_id,
        image_gcs_url=public_gcs_url,
        ocr_text="",  # Not using OCR text
        ai_feedback=ai_feedback_json_string,
    )

    # Use local database session
    from ....db.database_local import get_local_db_session
    db = get_local_db_session()
    
    try:
        db_submission = crud_submission.create_submission(
            db=db, submission=submission_data
        )
        db.commit()
        
        # Return the structured response
        return submission_schema.SubmissionResponse(
            image_gcs_url=db_submission.image_gcs_url,
            ocr_text=db_submission.ocr_text,
            ai_feedback=db_submission.ai_feedback,
            ai_feedback_data=ai_feedback_data,
        )
    finally:
        db.close()
