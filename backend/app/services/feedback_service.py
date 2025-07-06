from google.cloud import storage
from app.core.config import settings
from app.schemas.submission import ErrorEntry, AIFeedbackResponse
from pydantic import BaseModel
import json

class BoundingBox(BaseModel):
    """
    Represents a bounding box with its 2D coordinates and associated label.

    Attributes:
        box_2d (list[int]): A list of integers representing the 2D coordinates of the bounding box,
                            typically in the format [xmin, ymin, xmax, ymax] for the frontend.
        label (str): A string representing the label or class associated with the object within the bounding box.
    """
    box_2d: list[int]
    label: str

def get_errorbouding_from_image(gcs_uri: str) -> dict:
    """
    Detects errors in the math work by comparing against pre-detected bounding boxes.
    """
    import google.genai as genai
    from google.genai.types import GenerateContentConfig, Part, ThinkingConfig
    import io

    all_bounding_boxes = get_bounding_from_image(gcs_uri)
    if not all_bounding_boxes:
        return AIFeedbackResponse(translated_handwriting="No content detected", errors=[]).model_dump()

    prompt_boxes = []
    for bbox in all_bounding_boxes:
        x1, y1, x2, y2 = bbox.box_2d
        prompt_boxes.append({"box_2d": [y1, x1, y2, x2], "label": bbox.label})
    bounding_boxes_json = json.dumps(prompt_boxes, indent=2)

    try:
        storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
        bucket_name = gcs_uri.split("/")[2]
        blob_name = "/".join(gcs_uri.split("/")[3:])
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        in_mem_file = io.BytesIO()
        blob.download_to_file(in_mem_file)
        in_mem_file.seek(0)

        client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            location='global',
        )

        config = GenerateContentConfig(
            system_instruction="""
            Return bounding boxes as an array with labels for errors only.
            Never return masks. Limit to 10 objects.
            If no error found, return an empty list.
            """,
            temperature=0.5,
            response_mime_type="application/json",
            response_schema=list[BoundingBox],
            thinking_config=ThinkingConfig(thinking_budget=512)
        )

        prompt = f"""
        Output the bounding box of the error in the math work.
        YOU MUST choose from these pre-analyzed bounding boxes for the syntax:
        {bounding_boxes_json}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                Part.from_bytes(
                    data=in_mem_file.getvalue(),
                    mime_type="image/png",
                ),
                prompt
            ],
            config=config,
        )
        print(f"AI Response for errors: {response.json()}")

        region_list = response.parsed if hasattr(response, "parsed") else []
        errors = []
        for region in region_list:
            box_2d_from_model = region.box_2d if hasattr(region, 'box_2d') else []
            label = region.label if hasattr(region, 'label') else "AI detected error"
            if len(box_2d_from_model) == 4:
                y1, x1, y2, x2 = box_2d_from_model
                norm_box_2d = [x1, y1, x2, y2]
            else:
                norm_box_2d = [0, 0, 0, 0]
            errors.append(ErrorEntry(error_text=label, box_2d=norm_box_2d))
        
        try:
            feedback = AIFeedbackResponse(
                translated_handwriting="AI feedback based on detected errors",
                errors=errors
            )
            return feedback.model_dump()
        except Exception as e:
            print(f"AIFeedbackResponse validation error: {e}")
            return AIFeedbackResponse(translated_handwriting="", errors=[]).model_dump()

    except Exception as e:
        print(f"Error in get_errorbouding_from_image (Vertex AI): {type(e).__name__} - {e}")
        import traceback
        traceback.print_exc()
        return AIFeedbackResponse(translated_handwriting="", errors=[]).model_dump()

def get_bounding_from_image(gcs_uri: str) -> list[BoundingBox]:
    """
    Detects all math regions in the image and returns bounding boxes (normalized to 0-1000) with placeholder labels.
    Uses Vertex AI/GenAI SDK (google-genai) for bounding box detection.
    """
    import google.genai as genai
    from google.genai.types import GenerateContentConfig, Part, ThinkingConfig
    import io

    try:
        storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
        bucket_name = gcs_uri.split("/")[2]
        blob_name = "/".join(gcs_uri.split("/")[3:])
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        in_mem_file = io.BytesIO()
        blob.download_to_file(in_mem_file)
        in_mem_file.seek(0)

        client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            location='global',
        )

        config = GenerateContentConfig(
            system_instruction="""
            Return bounding boxes as an array with labels.
            Never return masks. Limit to 30 objects.
            """,
            temperature=0,
            response_mime_type="application/json",
            response_schema=list[BoundingBox],
            thinking_config=ThinkingConfig(thinking_budget=0)
        )

        prompt = "Output the bounding box of all syntaxes in the math work."
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                Part.from_bytes(
                    data=in_mem_file.getvalue(),
                    mime_type="image/png",
                ),
                prompt
            ],
            config=config,
        )
        print(f"AI Response for all boxes: {response.json()}")

        region_list = response.parsed if hasattr(response, "parsed") else []
        bounding_boxes = []
        for region in region_list:
            box_2d_from_model = region.box_2d if hasattr(region, 'box_2d') else []
            label = region.label if hasattr(region, 'label') else "AI detected math region"
            if len(box_2d_from_model) == 4:
                y1, x1, y2, x2 = box_2d_from_model
                norm_box_2d = [x1, y1, x2, y2]
            else:
                norm_box_2d = [0, 0, 0, 0]
            bounding_boxes.append(BoundingBox(box_2d=norm_box_2d, label=label))
        return bounding_boxes
    except Exception as e:
        print(f"Error in get_bounding_from_image (Vertex AI): {type(e).__name__} - {e}")
        import traceback
        traceback.print_exc()
        return []