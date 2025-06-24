// frontend/src/services/apiService.ts

// This interface defines the expected shape of the data returned from our
// backend orchestration endpoint.
export interface SubmissionResult {
    image_gcs_url: string;
    ocr_text: string;
    ai_feedback: string;
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
    // IMPORTANT: The backend FastAPI endpoint expects the file to be named 'file' as per the function signature: `file: UploadFile = File(...)`
    formData.append('file', imageFile);
  
    // --- FIX ---
    // The URL has been corrected to include the '/submission' prefix from the sub-router.
    const response = await fetch(`${API_BASE_URL}/api/v1/submission/submit/solution`, {
    // --- END FIX ---
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: For multipart/form-data, you MUST NOT set the 'Content-Type' header manually.
        // The browser will do it for you, including the necessary boundary string.
      },
      body: formData,
    });
  
    if (!response.ok) {
      // If the server returns a non-2xx status, we try to get more info.
      const errorData = await response.json().catch(() => ({})); // Try to parse error, but don't fail if it's not JSON
      const errorMessage = errorData.detail || `Server responded with status ${response.status}`;
      throw new Error(errorMessage);
    }
  
    return response.json();
  };