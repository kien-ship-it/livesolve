# backend/app/services/feedback_service.py

# Correctly import the google.genai library
import google.genai as genai
from google.genai import types

from app.core.config import settings

def generate_feedback_from_text(student_ocr_text: str) -> str:
    """
    Analyzes student's OCR'd text using Vertex AI Gemini and generates feedback.
    This version is updated to comply with the new google-genai SDK syntax.

    Args:
        student_ocr_text: The text extracted from the student's handwritten solution.

    Returns:
        A string containing the AI-generated feedback.
    """
    try:
        # 1. Initialize the client using the dedicated AI_REGION from settings.
        # This makes the configuration explicit and easy to manage.
        client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            location=settings.AI_REGION, # <-- CORRECT: Using our new dedicated setting
        )
        
        # --- MVP Hardcoded Content ---
        problem_statement = "Solve for x: 2x + 5 = 11"
        canonical_solution = """
        Step 1: 2x + 5 = 11
        Step 2: 2x = 11 - 5
        Step 3: 2x = 6
        Step 4: x = 6 / 2
        Step 5: x = 3
        """
        
        # 2. Construct the prompt for the AI (This logic remains the same)
        prompt = f"""
        You are an expert and friendly math tutor for middle school students.
        Your task is to analyze a student's handwritten solution to a math problem and provide constructive feedback.

        **Math Problem:**
        {problem_statement}

        **The Correct, Step-by-Step Solution:**
        ```
        {canonical_solution}
        ```

        **The Student's Submitted Solution (from OCR):**
        ```
        {student_ocr_text}
        ```

        **Your Instructions:**
        1.  **Compare:** Carefully compare the student's solution to the correct step-by-step solution.
        2.  **Identify Errors:** Pinpoint the exact step where the student made a mistake, if any. If there are no mistakes, congratulate them.
        3.  **Provide Feedback:** Write a short, encouraging, and helpful paragraph of feedback.
            - If there's a mistake, explain the error in a simple way and gently guide the student toward the correct step. Do not just give them the answer.
            - If the solution is correct, praise their good work and briefly mention why their method was correct.
        4.  **Formatting:** Use markdown for clear formatting (e.g., bolding for key terms).
        5.  **Tone:** Be positive, encouraging, and clear. Avoid jargon.
        """
        
        # 3. Define the model and a single configuration object
        model_id = "gemini-2.0-flash-lite-001"
        
        safety_settings = [
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
        ]

        config = types.GenerateContentConfig(
            max_output_tokens=2048,
            temperature=0.4,
            safety_settings=safety_settings
        )
        
        # 4. Send the prompt to the model using the new `config` parameter
        response = client.models.generate_content(
            model=model_id,
            contents=[prompt],
            config=config,
        )
        
        # 5. Extract and return the text part of the response (This logic remains the same)
        if response.text:
            return response.text
        else:
            block_reason = response.prompt_feedback.block_reason if response.prompt_feedback else "Unknown"
            return f"Sorry, the AI could not generate feedback. Reason: {block_reason}"

    except Exception as e:
        print(f"An error occurred in the feedback service: {e}")
        return "An unexpected error occurred while generating AI feedback."