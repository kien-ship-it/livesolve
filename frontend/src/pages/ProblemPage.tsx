// frontend/src/pages/ProblemPage.tsx
import React, { useState, useContext } from 'react';
import type { ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// This interface describes the final, complete result we WANT to display.
// The backend currently only sends a piece of this.
interface SubmissionResult {
  image_gcs_url: string;
  ocr_text: string;
  ai_feedback: string;
}

// --- CHANGE HERE ---
// This new interface describes what the backend ACTUALLY sends back right now.
interface GcsUploadResponse {
  gcs_url: string;
}
// --- END OF CHANGE ---

const ProblemPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const { currentUser } = useAuth();

  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Challenge: Solve for x',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setSubmissionResult(null);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file first!");
      return;
    }
    if (!currentUser) {
      setError("You must be logged in to submit a solution.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSubmissionResult(null);

    try {
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append('file', selectedFile);

      // --- CHANGE HERE ---
      // 1. Update the URL to match the backend's actual endpoint.
      // 2. Update the type parameter to expect our new GcsUploadResponse.
      const response = await axios.post<GcsUploadResponse>(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/v1/submission/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // --- END OF CHANGE ---

      // --- CHANGE HERE ---
      // The backend returns { gcs_url: "..." }. We now create the full
      // SubmissionResult object here on the frontend with placeholder text.
      setSubmissionResult({
        image_gcs_url: response.data.gcs_url,
        ocr_text: "(Awaiting backend OCR processing...)",
        ai_feedback: "(Awaiting backend AI feedback...)"
      });
      // --- END OF CHANGE ---

    } catch (err: any) {
      console.error("Submission failed:", err);
      // Better error message
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Submission failed: The server responded with a ${err.response.status} error. Please check the backend logs.`);
      } else if (err.request) {
        // The request was made but no response was received
        setError("Submission failed: No response from the server. Is the backend running and accessible?");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An error occurred while setting up the request. See the console for details.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl px-6 pb-12">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
          <p className="text-gray-600 mb-6">{problem.statement}</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-8">
            <p className="text-2xl font-mono text-center text-blue-900">
              {problem.equation}
            </p>
          </div>
          
          <hr className="my-8" />

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Your Solution</h2>
            <div className="flex flex-col items-center space-y-4">
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
                <span>Select an image</span>
                <input 
                  type="file" 
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected file: <span className="font-medium text-gray-800">{selectedFile.name}</span>
                </div>
              )}
              <button 
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className="w-full max-w-xs bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit for Feedback'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* This section will now work correctly */}
          {submissionResult && (
            <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-md">
              <h3 className="text-lg font-bold text-green-800 mb-4">Analysis Complete!</h3>
              <div>
                <h4 className="font-semibold text-gray-700 mt-2">GCS Image URL:</h4>
                {/* Security Note: Displaying the full GCS URL is fine for debugging,
                    but we'll want to use the uploaded image preview later. */}
                <p className="text-xs text-gray-600 break-all">{submissionResult.image_gcs_url}</p>
                
                <h4 className="font-semibold text-gray-700 mt-4">Extracted Text (OCR):</h4>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm text-gray-800 whitespace-pre-wrap">
                  {submissionResult.ocr_text}
                </pre>
                
                <h4 className="font-semibold text-gray-700 mt-4">AI Feedback:</h4>
                 <pre className="mt-1 p-2 bg-gray-100 rounded text-sm text-gray-800 whitespace-pre-wrap">
                  {submissionResult.ai_feedback}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;