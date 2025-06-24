# backend/app/api/v1/endpoints/submission.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

# Local application imports
from ....core.security import get_current_user, User
from ....services import gcs_service, ocr_service, feedback_service
from ....schemas import submission as submission_schema
from ....db import crud_submission # New import for DB operations
from ....db.database import get_db # New import for DB session dependency
from ....core.config import settings # Import settings to get bucket name


router = APIRouter()

# ==============================================================================
# == PRIMARY ORCHESTRATION ENDPOINT
# ==============================================================================

@router.post(
    "/submit/solution",
    response_model=submission_schema.SubmissionResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_solution_and_get_feedback(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Orchestrates the full submission process:
    1. Uploads the user's handwritten solution image to GCS.
    2. Performs OCR on the image.
    3. Generates AI-driven feedback by comparing to a canonical solution.
    4. Stores the entire submission record in the database.
    5. Returns the GCS URL, OCR text, and AI feedback to the client.
    """
    # --- Hardcoded values for the MVP ---
    problem_id = "problem_1_algebra"
    # This will be passed to the feedback service for comparison
    canonical_solution = "2x + 5 = 11\n2x = 11 - 5\n2x = 6\nx = 3"

    # Step 1: Upload image to GCS
    # This service should return the public HTTPS URL
    public_gcs_url = gcs_service.upload_image_to_gcs(
        file=file,
        user_id=current_user.uid
    )
    if not public_gcs_url:
        raise HTTPException(status_code=500, detail="Failed to upload image.")

    # Step 2: Convert public URL to the required GCS URI for the Vision API
    # e.g., "https://storage.googleapis.com/bucket-name/file.jpg" -> "gs://bucket-name/file.jpg"
    gcs_bucket_name = settings.GCS_BUCKET_NAME
    gcs_uri = public_gcs_url.replace(
        f"https://storage.googleapis.com/{gcs_bucket_name}/",
        f"gs://{gcs_bucket_name}/"
    )

    # Step 3: Perform OCR on the image in GCS
    try:
        ocr_text = ocr_service.perform_ocr_on_gcs_image(gcs_uri=gcs_uri)
    except Exception as e:
        # Generic catch for now, can be more specific later
        raise HTTPException(status_code=500, detail=f"Failed to perform OCR: {e}")

    # Step 4: Generate feedback from the AI
    try:
        ai_feedback = feedback_service.generate_feedback_from_text(
            student_ocr_text=ocr_text,
            canonical_solution=canonical_solution # Pass the hardcoded solution
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI feedback: {e}")

    # Step 5: Prepare data for database insertion
    submission_data = submission_schema.SubmissionCreate(
        user_id=current_user.uid,
        problem_id=problem_id,
        image_gcs_url=public_gcs_url,
        ocr_text=ocr_text,
        ai_feedback=ai_feedback,
    )

    # Step 6: Create the submission record in the database
    db_submission = crud_submission.create_submission(db=db, submission=submission_data)
    
    # FastAPI will automatically serialize this into the SubmissionResponse model
    return db_submission


# ==============================================================================
# == INDIVIDUAL TESTING/DEBUGGING ENDPOINTS (Commented out for production)
# ==============================================================================

# @router.post("/upload-image", status_code=201)
# def upload_image_for_submission(
#     *,
#     file: UploadFile = File(...),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Protected endpoint to upload an image to GCS.
#     Receives an image, uploads it via the gcs_service, and returns the URL.
#     """
#     if not file:
#         raise HTTPException(status_code=400, detail="No file uploaded.")

#     # Call our service to handle the upload logic
#     gcs_url = gcs_service.upload_image_to_gcs(
#         file=file,
#         user_id=current_user.uid
#     )

#     if not gcs_url:
#         raise HTTPException(status_code=500, detail="Could not upload file to cloud storage.")

#     return {"gcs_url": gcs_url}

# @router.post(
#     "/ocr",
#     response_model=submission_schema.OCRResponse,
#     status_code=status.HTTP_200_OK
# )
# def process_image_for_ocr(
#     *,
#     request_body: submission_schema.OCRRequest,
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Protected endpoint to perform OCR on an image stored in GCS.

#     - Receives a GCS URI in the request body.
#     - Calls the ocr_service to perform text detection.
#     - Returns the extracted text.
#     """

#     if not request_body.image_gcs_url.startswith("gs://"):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid GCS URI provided. It must start with 'gs://'."
#         )

#     extracted_text = ocr_service.perform_ocr_on_gcs_image(
#         gcs_uri=request_body.image_gcs_url
#     )
#     return submission_schema.OCRResponse(ocr_text=extracted_text)

# @router.post(
#     "/feedback/generate",
#     response_model=submission_schema.AIFeedbackResponse,
#     status_code=status.HTTP_200_OK
# )
# def generate_ai_feedback(
#     *,
#     request_body: submission_schema.AIFeedbackRequest,
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Protected endpoint to generate AI feedback for a given text solution.

#     - Receives OCR'd text in the request body.
#     - Calls the feedback_service to get analysis from Gemini.
#     - Returns the AI-generated feedback.
#     """
#     if not request_body.ocr_text or not request_body.ocr_text.strip():
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="OCR text cannot be empty."
#         )

#     # note: This assumes the feedback service has a hardcoded canonical solution
#     # For the real endpoint, we pass it in.
#     feedback = feedback_service.generate_feedback_from_text(
#         student_ocr_text=request_body.ocr_text
#     )
#     return submission_schema.AIFeedbackResponse(ai_feedback=feedback)