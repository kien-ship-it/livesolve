#
# FILE: backend/app/schemas/submission.py
#
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List, Tuple, Any

# --- MODIFIED: Simplified ErrorMask without segmentation mask ---

class ErrorMask(BaseModel):
    """
    Defines the structure for a single error detection, including its
    bounding box and descriptive label.
    """
    box_2d: Tuple[float, float, float, float] # ymin, xmin, ymax, xmax
    label: str # Descriptive label for the error

# --- Schemas for Orchestration Endpoint ---

class SubmissionBase(BaseModel):
    """Base schema with fields common to both creation and response."""
    image_gcs_url: HttpUrl
    ocr_text: str
    ai_feedback: str

class SubmissionCreate(SubmissionBase):
    """Schema for creating a new submission record in the database."""
    user_id: str
    problem_id: str

class SubmissionResponse(SubmissionBase):
    """
    Schema for the data returned to the frontend after a successful submission.
    The 'error_masks' field now contains a list of error detection objects.
    """
    error_masks: List[ErrorMask]

# --- Schemas for Database Model ---

class SubmissionInDBBase(SubmissionBase):
    id: int
    user_id: str
    problem_id: str
    submitted_at: datetime
    model_config = {"from_attributes": True}

# --- Schemas for old testing endpoints (Kept for compatibility) ---

class OCRRequest(BaseModel):
    image_gcs_url: str
    model_config = {"json_schema_extra": {"examples": [{"image_gcs_url": "gs://your-bucket-name/path/to/image.jpg"}]}}

class OCRResponse(BaseModel):
    ocr_text: str

class AIFeedbackRequest(BaseModel):
    ocr_text: str

class AIFeedbackResponse(BaseModel):
    ai_feedback: str