# backend/app/services/gcs_service.py

import uuid
from google.cloud import storage
from fastapi import UploadFile
from typing import Optional

from ..core.config import settings

# Initialize the Google Cloud Storage client
# This will use the credentials from GOOGLE_APPLICATION_CREDENTIALS
# environment variable by default.
storage_client = storage.Client(project=settings.GCP_PROJECT_ID)

def upload_image_to_gcs(
    file: UploadFile,
    user_id: str
) -> Optional[str]:
    """
    Uploads an image file to the Google Cloud Storage bucket and returns its public URL.

    Args:
        file: The image file uploaded by the user (FastAPI's UploadFile).
        user_id: The unique ID of the user uploading the file.

    Returns:
        The public URL of the uploaded image, or None if the upload fails.
    """
    try:
        # Get the bucket object
        bucket = storage_client.bucket(settings.GCS_BUCKET_NAME)

        # Create a unique filename to prevent overwrites
        # Format: submissions/{user_id}/{uuid}-{original_filename}
        # The UUID makes sure that even if a user uploads a file with the same name twice,
        # it will be stored as a new, unique object.
        unique_id = uuid.uuid4()
        file_extension = file.filename.split('.')[-1]
        blob_name = f"submissions/{user_id}/{unique_id}.{file_extension}"

        # Create a new blob (i.e., file object) in the bucket
        blob = bucket.blob(blob_name)

        # Upload the file's content
        # We use file.read() to get the bytes from the uploaded file.
        blob.upload_from_file(file.file, content_type=file.content_type)

        # Return the public URL of the blob
        return blob.public_url

    except Exception as e:
        print(f"Error uploading to GCS: {e}")
        return None