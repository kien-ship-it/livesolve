# backend/app/services/gcs_service.py

import uuid
from google.cloud import storage
from fastapi import UploadFile
from typing import Optional

from ..core.config import settings

# Initialize the Google Cloud Storage client
storage_client = storage.Client(project=settings.GCP_PROJECT_ID)

def upload_image_to_gcs(
    file: UploadFile,
    user_id: str
) -> Optional[str]:
    """
    Uploads an image file to the Google Cloud Storage bucket and returns its public URL.
    """
    try:
        bucket = storage_client.bucket(settings.GCS_BUCKET_NAME)
        
        parts = file.filename.split('.')
        file_extension = parts[-1] if len(parts) > 1 else 'jpg'
        unique_id = uuid.uuid4()
        blob_name = f"submissions/{user_id}/{unique_id}.{file_extension}"

        blob = bucket.blob(blob_name)

        # REVERTED: The predefined_acl parameter has been removed as it is
        # incompatible with this bucket's Uniform Bucket-Level Access setting.
        # Permissions will now be controlled at the bucket level via IAM.
        blob.upload_from_file(file.file, content_type=file.content_type)

        return blob.public_url

    except Exception as e:
        print(f"Error uploading to GCS: {e}")
        return None