#
# FILE: backend/app/api/v1/endpoints/submission.py
#
import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from ....core.security import get_current_user, User
from ....services import gcs_service, feedback_service
from ....schemas import submission as submission_schema
from ....db import crud_submission
from ....db.database import get_db
from ....core.config import settings

router = APIRouter()

@router.post(
    "/submit/solution",
    response_model=submission_schema.SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_solution_and_get_feedback(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Orchestrates the full submission process:
    1. Uploads image to GCS.
    2. Sends image to a multimodal AI to generate error detections with bounding boxes.
    3. Stores the submission in the database.
    4. Returns the structured data to the client.
    """
    problem_id = "problem_1_algebra"
    canonical_solution = "2x + 5 = 11\n2x = 11 - 5\n2x = 6\nx = 3"

    public_gcs_url = gcs_service.upload_image_to_gcs(
        file=file, user_id=current_user.uid
    )
    if not public_gcs_url:
        raise HTTPException(status_code=500, detail="Failed to upload image.")

    gcs_bucket_name = settings.GCS_BUCKET_NAME
    gcs_uri = public_gcs_url.replace(
        f"https://storage.googleapis.com/{gcs_bucket_name}/",
        f"gs://{gcs_bucket_name}/",
    )

    try:
        error_masks = feedback_service.get_feedback_from_image(
            gcs_uri=gcs_uri, canonical_solution=canonical_solution
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate AI feedback: {e}"
        )

    ai_feedback_json_string = json.dumps(error_masks)

    submission_data = submission_schema.SubmissionCreate(
        user_id=current_user.uid,
        problem_id=problem_id,
        image_gcs_url=public_gcs_url,
        ocr_text="",
        ai_feedback=ai_feedback_json_string,
    )

    db_submission = crud_submission.create_submission(
        db=db, submission=submission_data
    )
    
    # MODIFIED: The structure now perfectly matches the SubmissionResponse schema
    # Pydantic will validate this automatically.
    return submission_schema.SubmissionResponse(
        image_gcs_url=db_submission.image_gcs_url,
        ocr_text=db_submission.ocr_text,
        ai_feedback=db_submission.ai_feedback,
        error_masks=error_masks,
    )

# ... (The rest of the file with old testing endpoints remains unchanged) ...