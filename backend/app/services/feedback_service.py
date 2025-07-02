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
            temperature=0.7,
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
                # 'Detect the position of number or syntax or sign where the error (if any) occurs in mathematical work. Output a json list where each error entry contains the 2D bounding box in "box_2d" and a text label in "label". IF NO ERROR DETECTED, LEAVE BLANK.'
                """
                ## Persona
                You are a highly precise, automated system for mathematical error detection. You function as a quality control checker for educational software. Your analysis must be objective, accurate, and strictly formatted.
                ## Primary Objective
                Given an image containing mathematical steps, identify every logical, calculation, or transcription error. For each error, you must return its precise location and a structured description.
                ## Input
                An image file containing handwritten or typed mathematical work.
                ## Output Specification
                Your entire output must be a single, valid JSON object that is a list of error entries.
                No Errors: If the mathematical work is entirely correct, you must return an empty list []. Do not add any other text or explanation.
                With Errors: If errors are present, return a list of JSON objects. Each object represents a single, distinct error and must contain the following two keys:
                "box_2d": A JSON array of four integer pixel coordinates [x_min, y_min, x_max, y_max], defining the tightest possible bounding box around the incorrect character, number, or sign.
                "label": A JSON string with a structured description of the error, formatted as "Error Type: Brief, specific explanation."
                ## Core Instructions & Error Taxonomy
                You must classify errors into one of the following types:
                Calculation Error: For mistakes in basic arithmetic (e.g., 7 * 8 = 54).
                Label Example: `"Calculation Error: The result of 7 * 8 should be 56."*
                Sign Error: For errors involving positive/negative signs (e.g., -3^2 = 9).
                Label Example: `"Sign Error: (-3)^2 is 9, but -3^2 is -9. Check order of operations."*
                Conceptual Error: For incorrect application of a mathematical law or property (e.g., sqrt(a^2 + b^2) = a + b).
                Label Example: `"Conceptual Error: The square root of a sum is not the sum of the square roots."*
                Transcription Error: For when a value is copied incorrectly from one line to the next.
                Label Example: `"Transcription Error: The value was 5 on the previous line but was written as 6 here."*
                Syntax Error: For malformed mathematical expressions (e.g., (2+x with a missing closing parenthesis).
                Label Example: `"Syntax Error: Missing closing parenthesis ')'."*
                ## Constraints and Edge Cases
                Focus only on mathematical correctness. Do not comment on handwriting neatness or style.
                If a step is technically correct but uses an unconventional method, it is not an error.
                If a section of the image is completely illegible or not mathematical, ignore it and do not flag an error.
                The bounding box should be as tight as possible around the specific point of error. For example, in 2+2=5, the box should be around the 5, not the whole equation.
                """
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