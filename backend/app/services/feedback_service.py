#
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

def get_feedback_from_image(gcs_uri: str, canonical_solution: str) -> list:
    """
    FOR TESTING ONLY: Calls the Gemini public API with a personal API key.
    Returns a list of error mask dicts.
    """
    try:
        # --- Step 1 - Download and Resize Image ---
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
            max_size = 640
            scale = min(max_size / img.width, max_size / img.height)
            new_width = int(img.width * scale)
            new_height = int(img.height * scale)
            resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            output_buffer = io.BytesIO()
            resized_img.save(output_buffer, format="PNG")
            resized_image_bytes = output_buffer.getvalue()
            # Save for debugging
            with open("/tmp/debug_image.png", "wb") as debug_f:
                debug_f.write(resized_image_bytes)

        # --- Step 2: Encode as base64 for public API ---
        # Remove any data URL prefix if present (shouldn't be, but for safety)
        image_b64 = base64.b64encode(resized_image_bytes).decode("utf-8")
        if image_b64.startswith("data:image/png;base64,"):
            image_b64 = image_b64[len("data:image/png;base64,"):]

        # --- Step 3: Build API request to match segmentation-feature.tsx ---
        API_KEY = "AIzaSyDideGDIfiPOlfpO-JhOaKr8GI-yxV14Vs"  # <-- Replace with your key
        MODEL = "models/gemini-2.5-flash-preview-04-17"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key={API_KEY}"
        headers = {"Content-Type": "application/json"}
        prompt_text = (
            "Give the segmentation masks for the mathematical errors in this handwritten math solution image. "
            "Output a JSON list of segmentation masks where each entry contains the 2D bounding box in 'box_2d', the segmentation mask in key 'mask', and the text label in the key 'label'. Use descriptive labels."
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

        # --- Step 4: Call the API ---
        resp = requests.post(url, headers=headers, json=data)
        try:
            resp.raise_for_status()
        except Exception as e:
            print(f"Public Gemini API error: {e}\n{resp.text}")
            return []
        resp_json = resp.json()
        # --- Step 5: Parse masks from the response ---
        try:
            # Step 1: Extract the text
            text = resp_json["candidates"][0]["content"]["parts"][0]["text"]

            # Step 2: Find the JSON list inside triple backticks
            import re
            import json as pyjson
            match = re.search(r'```json\s*(\[.*?\])\s*```', text, re.DOTALL)
            if not match:
                print("No JSON list found in public API response.")
                return []
            mask_list = pyjson.loads(match.group(1))

            # Step 3: Clean up each mask
            def clean_mask(m):
                mask_str = m.get("mask", "")
                # Remove data URL prefix if present
                if mask_str.startswith("data:image/png;base64,"):
                    mask_str = mask_str[len("data:image/png;base64,"):]
                # Only keep if it looks like a PNG
                if not mask_str.startswith("iVBORw0KGgo"):
                    return None
                # Optionally, rename text_content to label
                label = m.get("text_content", "")
                return {
                    "box_2d": m.get("box_2d", []),
                    "mask": mask_str,
                    "label": label
                }
            valid_masks = [clean_mask(m) for m in mask_list]
            valid_masks = [m for m in valid_masks if m is not None]
            return valid_masks
        except Exception as e:
            print(f"Failed to parse masks from public API response: {e}\n{resp_json}")
            return []
    except Exception as e:
        print(f"Unexpected error in feedback service: {type(e).__name__} - {e}")
        import traceback
        traceback.print_exc()
        return []

# ---
# (Commented out: Vertex AI/SDK implementation)
# def get_feedback_from_image(...):
#     ...

def generate_feedback_from_text(student_ocr_text: str, canonical_solution: str) -> str:
    """(This function is now DEPRECATED in the main workflow)"""
    return "This function is deprecated."
