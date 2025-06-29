//
// FILE: frontend/src/services/apiService.ts
//

// --- MODIFIED: Types simplified to remove segmentation mask ---

/**
 * Defines the structure for a single error detection object received from the API.
 */
export interface ErrorMask {
  box_2d: [number, number, number, number]; // ymin, xmin, ymax, xmax (normalized to 1000)
  label: string; // Descriptive label for the error
}

/**
 * The main submission result interface, updated to use the simplified ErrorMask type.
 */
export interface SubmissionResult {
  image_gcs_url: string;
  ocr_text: string;
  ai_feedback: string;
  error_masks: ErrorMask[]; // An array of error detection objects
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