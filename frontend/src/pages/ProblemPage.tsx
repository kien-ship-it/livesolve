// frontend/src/pages/ProblemPage.tsx
import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
// --- NEW IMPORTS ---
import { submitSolution } from '../services/apiService';
import type { SubmissionResult } from '../services/apiService';
import FeedbackDisplay from '../components/problem/FeedbackDisplay';
// --- END NEW IMPORTS ---


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
      setError(null); // Reset error on new file selection
      setSubmissionResult(null); // Reset previous results
    }
  };
  
  // --- REFACTORED handleSubmit LOGIC ---
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
      // Call our new, centralized API service function
      const result = await submitSolution(selectedFile, token);
      setSubmissionResult(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      // The apiService now throws a user-friendly error message
      setError(err.message || "An unknown error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">
      <div className="w-full max-w-3xl px-6 pb-12">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
          <p className="text-gray-600 mb-6">{problem.statement}</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-8">
            <p className="text-2xl font-mono text-center text-blue-900">
              {problem.equation}
            </p>
          </div>
          
          <hr className="my-8" />

          {/* Only show the upload section if there are no results yet */}
          {!submissionResult && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Your Solution</h2>
              <div className="flex flex-col items-center space-y-4">
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
                  <span>{selectedFile ? 'Change image' : 'Select an image'}</span>
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
                  {isLoading ? 'Analyzing...' : 'Submit for Feedback'}
                </button>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="mt-8 text-center">
              <p className="text-lg text-gray-600">Analyzing your submission, please wait...</p>
              {/* Optional: Add a spinner component here */}
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* --- REPLACED with new Component --- */}
          {submissionResult && (
            <>
              <FeedbackDisplay result={submissionResult} />
              <div className="text-center mt-8">
                <button 
                  onClick={() => {
                    setSubmissionResult(null);
                    setSelectedFile(null);
                  }}
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Submit Another Solution
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;