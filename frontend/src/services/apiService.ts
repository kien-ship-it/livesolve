//
// FILE: frontend/src/services/apiService.ts
//

// --- UPDATED: Types for AI feedback with translation and error bounding boxes ---

/**
 * Defines the structure for a single error entry received from the API.
 */
export interface ErrorEntry {
  error_text: string; // The text where the error occurs, taken from translated_handwriting
  box_2d: number[]; // [x1, y1, x2, y2] coordinates of the error bounding box
}

/**
 * Defines the structure for the AI feedback response containing
 * complete translation and list of errors with bounding boxes.
 */
export interface AIFeedbackData {
  translated_handwriting: string; // Complete translation of all handwriting in the image
  errors: ErrorEntry[]; // List of error entries with bounding boxes
}

/**
 * The main submission result interface, updated to use the new AI feedback structure.
 */
export interface SubmissionResult {
  image_gcs_url: string;
  ocr_text: string;
  ai_feedback: string; // JSON string of the AI feedback data
  ai_feedback_data: AIFeedbackData; // Structured AI feedback data
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Submits a solution image to the backend orchestration endpoint.
 *
 * @param imageFile The image file from the user's input.
 * @param token The Firebase auth ID token for the user.
 * @returns A promise that resolves to the SubmissionResult.
 */
export const submitSolution = async (imageFile: File, token: string): Promise<SubmissionResult> => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/v1/submission/submit/solution`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred during submission.' }));
    const errorMessage = errorData.detail || `Server responded with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};