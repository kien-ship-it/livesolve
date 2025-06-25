# backend/app/services/feedback_service.py

# Correctly import the google.genai library
import google.genai as genai
from google.genai import types

from app.core.config import settings

def generate_feedback_from_text(student_ocr_text: str, canonical_solution: str) -> str:
    """
    Analyzes student's OCR'd text using Vertex AI Gemini and generates feedback.
    This version is updated to comply with the new google-genai SDK syntax.

    Args:
        student_ocr_text: The text extracted from the student's handwritten solution.
        canonical_solution: The correct, step-by-step solution for the problem.

    Returns:
        A string containing the AI-generated feedback.
    """
    try:
        # 1. Initialize the client using the dedicated AI_REGION from settings.
        # This makes the configuration explicit and easy to manage.
        client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT_ID,
            location=settings.AI_REGION,
        )
        
        # --- MVP Hardcoded Content ---
        problem_statement = "Solve for x: 2x + 5 = 11"
        # The canonical_solution is now passed in as an argument.
        
        # 2. Construct the prompt for the AI
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
        
        **Reply format guidelines:**
        - The compare and identify error procedures are done internally, immediate reply with only feedback for the student's work. 
        - Do not comment on any other topics unrelated to providing feedback for the student's work.
        
        **Example Converstaion flow:**
        -Math Problem: Solve for x: 4x - 2 = 10
        -The Correct, Step-by-Step Solution: 4x - 2 = 10\n4x = 10 + 2\n4x = 12\nx = 3
        -The Student's Submitted Solution (from OCR): 4x - 2 = 10\n4x = 10 - 2\nx = 2
        -Your Reply: Great job starting this problem! You're on the right track with isolating the 'x'. However, when you move the -2 to the other side of the equation, remember that it changes to a **+2**. So, it should be 4x = 10 **+2**. Try correcting that step, and you'll be able to solve for 'x' perfectly! Keep up the fantastic effort!
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
        
        # 5. Extract and return the text part of the response
        if response.text:
            return response.text
        else:
            block_reason = response.prompt_feedback.block_reason if response.prompt_feedback else "Unknown"
            return f"Sorry, the AI could not generate feedback. Reason: {block_reason}"

    except Exception as e:
        print(f"An error occurred in the feedback service: {e}")
        return "An unexpected error occurred while generating AI feedback."