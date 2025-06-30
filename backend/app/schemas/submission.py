#
# FILE: backend/app/schemas/submission.py
#
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List, Tuple, Any

# --- UPDATED: Schemas for AI Feedback with Translation and Error Bounding Boxes ---

class ErrorEntry(BaseModel):
    """
    Defines the structure for a single error entry, including its
    bounding box and the error text from the translated handwriting.
    """
    error_text: str  # The text where the error occurs, taken from translated_handwriting
    box_2d: List[float]  # [x1, y1, x2, y2] coordinates of the error bounding box

class AIFeedbackResponse(BaseModel):
    """
    Defines the structure for the AI feedback response containing
    complete translation and list of errors with bounding boxes.
    """
    translated_handwriting: str  # Complete translation of all handwriting in the image
    errors: List[ErrorEntry]  # List of error entries with bounding boxes

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
    The 'ai_feedback_data' field now contains the structured AI feedback with translation and errors.
    """
    ai_feedback_data: AIFeedbackResponse

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

class AIFeedbackResponseOld(BaseModel):
    ai_feedback: str