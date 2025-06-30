from typing import List, Dict, Any
from google.cloud import storage
from app.core.config import settings
from app.schemas.submission import ErrorEntry, AIFeedbackResponse

def get_errorbouding_from_image(gcs_uri: str, canonical_solution: str = None) -> dict:
    """
    Detects all math regions in the image and returns bounding boxes (normalized to 0-1000) with placeholder labels.
    Uses Vertex AI/GenAI SDK (google-genai) for bounding box detection.
    """
    import google.genai as genai
    from google.genai.types import GenerateContentConfig, HarmBlockThreshold, HarmCategory, HttpOptions, Part, SafetySetting, ThinkingConfig
    import io

    try:
        # Step 1: Download image from GCS URI to bytes
        storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
        bucket_name = gcs_uri.split("/")[2]
        blob_name = "/".join(gcs_uri.split("/")[3:])
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        in_mem_file = io.BytesIO()
        blob.download_to_file(in_mem_file)
        in_mem_file.seek(0)

        # Step 2: Prepare GenAI SDK client
        client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            # location=settings.AI_REGION,
            location='global',
        )

        # Step 3: Build config for bounding box detection
        config = GenerateContentConfig(
            system_instruction="""
            Return bounding boxes as an array with labels.
            Never return masks. Limit to 10 objects.
            If an object is present multiple times, give each object a unique label according to its distinct characteristics (position, etc..).
            """,
            temperature=0.4,
            response_mime_type="application/json",
            response_schema=list[dict],
            thinking_config=ThinkingConfig(thinking_budget=512)
        )

        # Step 4: Call the model
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[
                Part.from_bytes(
                    data=in_mem_file.getvalue(),
                    mime_type="image/png",
                ),
                # "Detect every numbers, letters or signs in handwriting with each a unique entry. Output the JSON list positions where each entry contains the 2D bounding box in 'box_2d' and 'a text label' in 'label'."
                'Detect the position of number or syntax or sign where the error (if any) occurs in mathematical work. Output a json list where each error entry contains the 2D bounding box in "box_2d" and a text label in "label". IF NO ERROR DETECTED, LEAVE BLANK.'
            ],
            config=config,
        )

        # Step 5: Parse response and convert to expected schema
        region_list = response.parsed if hasattr(response, "parsed") else []
        errors = []
        for region in region_list:
            box_2d_from_model = region.get("box_2d", [])
            label = region.get("label", "AI detected math region")
            # Model returns [ymin, xmin, ymax, xmax], frontend expects [xmin, ymin, xmax, ymax]
            if len(box_2d_from_model) == 4:
                y1, x1, y2, x2 = box_2d_from_model
                norm_box_2d = [x1, y1, x2, y2]
            else:
                norm_box_2d = [0, 0, 0, 0]
            errors.append(ErrorEntry(error_text=label, box_2d=norm_box_2d))
        try:
            feedback = AIFeedbackResponse(
                translated_handwriting="AI detected math regions",  # Placeholder
                errors=errors
            )
            return feedback.model_dump()
        except Exception as e:
            print(f"AIFeedbackResponse validation error: {e}")
            return AIFeedbackResponse(translated_handwriting="", errors=[]).model_dump()
    except Exception as e:
        print(f"Error in get_feedback_from_image (Vertex AI): {type(e).__name__} - {e}")
        import traceback
        traceback.print_exc()
        return AIFeedbackResponse(translated_handwriting="", errors=[]).model_dump()