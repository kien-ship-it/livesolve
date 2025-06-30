# FILE: backend/app/services/feedback_service.py
#
import json
from typing import List, Dict, Any
import io
import base64

from google.cloud import storage
from PIL import Image

import google.genai as genai
from google.genai import types
from google.genai import errors as genai_errors

from app.core.config import settings

# --- FOR TESTING: Use Gemini public API with personal API key ---
import requests

def get_feedback_from_image(gcs_uri: str, canonical_solution: str) -> dict:
    """
    Adapter: Calls detect_math_regions_from_image and returns its result. All other features are disabled for testing.
    """
    return detect_math_regions_from_image(gcs_uri)

# ---
# (Commented out: Vertex AI/SDK implementation)
# def get_feedback_from_image(...):
#     ...

def generate_feedback_from_text(student_ocr_text: str, canonical_solution: str) -> str:
    """(This function is now DEPRECATED in the main workflow)"""
    return "This function is deprecated."

def detect_math_regions_from_image(gcs_uri: str) -> dict:
    """
    Detects all math regions in the image and returns bounding boxes (normalized to 0-1000) with placeholder labels.
    """
    try:
        # --- Step 1 - Download and Prepare Image for Model ---
        storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
        bucket_name = gcs_uri.split("/")[2]
        blob_name = "/".join(gcs_uri.split("/")[3:])
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        in_mem_file = io.BytesIO()
        blob.download_to_file(in_mem_file)
        in_mem_file.seek(0)

        with Image.open(in_mem_file) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # The model handles various sizes, but resizing can speed up the process.
            # We don't need to save dimensions for scaling as the model returns normalized coords.
            max_size = 640
            scale = min(max_size / img.width, max_size / img.height)
            new_width = int(img.width * scale)
            new_height = int(img.height * scale)
            resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            output_buffer = io.BytesIO()
            resized_img.save(output_buffer, format="PNG")
            resized_image_bytes = output_buffer.getvalue()

        image_b64 = base64.b64encode(resized_image_bytes).decode("utf-8")
        if image_b64.startswith("data:image/png;base64,"):
            image_b64 = image_b64[len("data:image/png;base64,"):]

        # --- Step 2: Build API request for math region detection ---
        API_KEY = "AIzaSyDideGDIfiPOlfpO-JhOaKr8GI-yxV14Vs"
        MODEL = "models/gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
        headers = {"Content-Type": "application/json"}
        # The reference implementation `bounding-box-pipeline.tsx` implies the model
        # returns coordinates normalized to 1000 in [ymin, xmin, ymax, xmax] format.
        prompt_text = (
            "Detect all math, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in 'box_2d' and 'label'."
        )
        data = {
            "model": MODEL,
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "inlineData": {
                                "data": image_b64,
                                "mimeType": "image/png"
                            }
                        },
                        {"text": prompt_text}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0
            }
        }

        resp = requests.post(url, headers=headers, json=data)
        try:
            resp.raise_for_status()
        except Exception as e:
            print(f"Public Gemini API error: {e}\n{resp.text}")
            return {"translated_handwriting": "", "errors": []}
        resp_json = resp.json()

        # --- Step 3: Parse response for bounding boxes ---
        try:
            text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
            print(f"DEBUG: Raw API response text: {text[:500]}...")
            import re
            import json as pyjson
            match = re.search(r'```json\s*(\[.*?\])\s*```', text, re.DOTALL)
            if not match:
                match = re.search(r'```json\s*(\[.*\])\s*```', text, re.DOTALL) # A slightly more lenient regex
            if not match:
                match = re.search(r'```\s*(\[.*?\])\s*```', text, re.DOTALL) # A more lenient regex
            if not match:
                print("DEBUG: Regex failed, printing full text for manual inspection:")
                print(text)
                print("No JSON list found in public API response.")
                return {"translated_handwriting": "", "errors": []}
            print(f"DEBUG: Regex matched: {match.group(0)[:200]}")
            region_list = pyjson.loads(match.group(1))
            print(f"DEBUG: Parsed region list: {region_list}")

            errors = []
            for region in region_list:
                box_2d_from_model = region.get("box_2d", [])
                
                # --- FIX: Correctly handle coordinate format ---
                # The model, as per the reference implementation, returns coordinates normalized
                # to 1000 in the format [ymin, xmin, ymax, xmax].
                # The frontend expects the format [xmin, ymin, xmax, ymax].
                # We do not need to perform any scaling, just re-order the coordinates.
                if len(box_2d_from_model) == 4:
                    y1, x1, y2, x2 = box_2d_from_model
                    # Swap to match frontend's expected format [x1, y1, x2, y2]
                    norm_box_2d = [x1, y1, x2, y2]
                else:
                    norm_box_2d = [0, 0, 0, 0] # Default for malformed data
                
                errors.append({
                    "error_text": "AI detected math region",  # Placeholder
                    "box_2d": norm_box_2d
                })

            return {
                "translated_handwriting": "AI detected math regions",  # Placeholder
                "errors": errors
            }
        except Exception as e:
            print(f"Failed to parse math region detection from public API response: {e}\n{resp_json}")
            return {"translated_handwriting": "", "errors": []}
    except Exception as e:
        print(f"Unexpected error in math region detection: {type(e).__name__} - {e}")
        import traceback
        traceback.print_exc()
        return {"translated_handwriting": "", "errors": []}