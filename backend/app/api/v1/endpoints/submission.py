# backend/app/api/v1/endpoints/submission.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from ....core.security import get_current_user, User
from ....services import gcs_service, ocr_service 
from ....schemas import submission as submission_schema 

router = APIRouter()

@router.post("/upload-image", status_code=201)
def upload_image_for_submission(
    *,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Protected endpoint to upload an image to GCS.
    Receives an image, uploads it via the gcs_service, and returns the URL.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Call our service to handle the upload logic
    gcs_url = gcs_service.upload_image_to_gcs(
        file=file,
        user_id=current_user.uid
    )

    if not gcs_url:
        raise HTTPException(status_code=500, detail="Could not upload file to cloud storage.")

    return {"gcs_url": gcs_url}


# --- NEW ENDPOINT ADDED BELOW ---

@router.post(
    "/ocr",
    response_model=submission_schema.OCRResponse,
    status_code=status.HTTP_200_OK
)
def process_image_for_ocr(
    *,
    request_body: submission_schema.OCRRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Protected endpoint to perform OCR on an image stored in GCS.

    - Receives a GCS URI in the request body.
    - Calls the ocr_service to perform text detection.
    - Returns the extracted text.
    """
    # 1. Input validation (basic)
    if not request_body.image_gcs_url.startswith("gs://"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GCS URI provided. It must start with 'gs://'."
        )

    # 2. Call the OCR service
    extracted_text = ocr_service.perform_ocr_on_gcs_image(
        gcs_uri=request_body.image_gcs_url
    )

    # 3. Return the response
    return submission_schema.OCRResponse(ocr_text=extracted_text)