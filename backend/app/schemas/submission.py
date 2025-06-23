# backend/app/schemas/submission.py

from pydantic import BaseModel, HttpUrl

# --- Schemas for OCR Processing ---

class OCRRequest(BaseModel):
    """
    Schema for the request body of the OCR endpoint.
    It expects a valid GCS URL for the image.
    """
    image_gcs_url: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "image_gcs_url": "gs://your-bucket-name/path/to/image.jpg"
                }
            ]
        }
    }


class OCRResponse(BaseModel):
    """
    Schema for the response body of the OCR endpoint.
    It returns the extracted text.
    """
    ocr_text: str