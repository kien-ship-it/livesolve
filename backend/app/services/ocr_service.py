# backend/app/services/ocr_service.py

from google.cloud import vision
from fastapi import HTTPException, status
from google.api_core import exceptions as google_exceptions 

def perform_ocr_on_gcs_image(gcs_uri: str) -> str:
    """
    Performs OCR on an image stored in Google Cloud Storage.

    This function uses the Google Cloud Vision API to detect and extract
    text from the specified image.

    Args:
        gcs_uri: The GCS URI of the image (e.g., "gs://bucket_name/file_name").

    Returns:
        The full text extracted from the image as a single string.

    Raises:
        HTTPException: If the Vision API call fails or returns an error.
    """
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image()
        image.source.image_uri = gcs_uri
        response = client.text_detection(image=image)

        # MODIFIED: Changed how this error is handled
        if response.error.message:
            # This error comes from the Vision API itself after a successful call.
            # It indicates a problem with the input image (e.g., corrupt, unsupported format).
            # This is a client-side error, so we use a 4xx status code.
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, # <-- CHANGED from 500
                detail=f"Vision API could not process the image. Error: {response.error.message}"
            )

        if response.full_text_annotation:
            return response.full_text_annotation.text
        else:
            return ""

    # --- REFINED EXCEPTION HANDLING BLOCK ---

    # ADDED: Catch specific Google Cloud errors first
    except google_exceptions.GoogleAPICallError as e:
        # This catches errors during the API call itself, such as:
        # - google_exceptions.NotFound: The file GCS URI does not exist.
        # - google_exceptions.PermissionDenied: The service account lacks permissions.
        print(f"A Google API call error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"A server-side error occurred while communicating with Google services."
        )

    # MODIFIED: This now catches any other, truly unexpected errors
    except Exception as e:
        # Catch any other exception during the process
        print(f"An unexpected error occurred in perform_ocr_on_gcs_image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected server error occurred while processing the image."
        )