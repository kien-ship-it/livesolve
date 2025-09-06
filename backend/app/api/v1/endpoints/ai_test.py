#
# FILE: backend/app/api/v1/endpoints/ai_test.py
# AI Testing endpoint that bypasses database requirements
#

import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from ....core.security import get_current_user, User
from ....services import gcs_service, feedback_service

router = APIRouter()

class MockAIFeedbackResponse(BaseModel):
    """Mock response model for AI testing"""
    image_gcs_url: Optional[str] = None
    ai_feedback_data: dict
    message: str

@router.post(
    "/test-feedback",
    response_model=MockAIFeedbackResponse,
    status_code=status.HTTP_200_OK,
)
def test_ai_feedback_without_db(
    *,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Test AI functionality without database storage.
    This endpoint:
    1. Uploads image to GCS
    2. Runs AI analysis for error detection
    3. Returns results without storing in database
    """
    try:
        # Step 1: Upload to GCS
        public_gcs_url = gcs_service.upload_image_to_gcs(
            file=file, user_id=current_user.uid
        )
        if not public_gcs_url:
            raise HTTPException(status_code=500, detail="Failed to upload image to GCS.")

        # Step 2: Convert to GCS URI for AI processing
        from ....core.config import settings
        gcs_bucket_name = settings.GCS_BUCKET_NAME
        gcs_uri = public_gcs_url.replace(
            f"https://storage.googleapis.com/{gcs_bucket_name}/",
            f"gs://{gcs_bucket_name}/",
        )

        # Step 3: Run AI analysis
        ai_feedback_data = feedback_service.get_errorbouding_from_image(
            gcs_uri=gcs_uri
        )

        return MockAIFeedbackResponse(
            image_gcs_url=public_gcs_url,
            ai_feedback_data=ai_feedback_data,
            message="AI analysis completed successfully (no database storage)"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI testing failed: {str(e)}"
        )

@router.post(
    "/test-bounding-boxes",
    response_model=MockAIFeedbackResponse,
    status_code=status.HTTP_200_OK,
)
def test_bounding_box_detection(
    *,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Test only the bounding box detection functionality.
    """
    try:
        # Upload to GCS
        public_gcs_url = gcs_service.upload_image_to_gcs(
            file=file, user_id=current_user.uid
        )
        if not public_gcs_url:
            raise HTTPException(status_code=500, detail="Failed to upload image to GCS.")

        # Convert to GCS URI
        from ....core.config import settings
        gcs_bucket_name = settings.GCS_BUCKET_NAME
        gcs_uri = public_gcs_url.replace(
            f"https://storage.googleapis.com/{gcs_bucket_name}/",
            f"gs://{gcs_bucket_name}/",
        )

        # Test bounding box detection
        bounding_boxes = feedback_service.get_bounding_from_image(gcs_uri=gcs_uri)
        
        return MockAIFeedbackResponse(
            image_gcs_url=public_gcs_url,
            ai_feedback_data={
                "bounding_boxes": [box.model_dump() for box in bounding_boxes],
                "total_detected": len(bounding_boxes)
            },
            message="Bounding box detection completed successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Bounding box detection failed: {str(e)}"
        )
