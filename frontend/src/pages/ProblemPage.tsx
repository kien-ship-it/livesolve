import React, { useState, useRef } from 'react'; // Import useRef
// import type { ChangeEvent } from 'react'; // No longer needed
import { useAuth } from '../contexts/AuthContext';
import { submitSolution } from '../services/apiService';
import type { SubmissionResult } from '../services/apiService';
import FeedbackDisplay from '../components/problem/FeedbackDisplay';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// --- NEW IMPORTS ---
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';
// --- END NEW IMPORTS ---


const ProblemPage: React.FC = () => {
  // const [selectedFile, setSelectedFile] = useState<File | null>(null); // Replaced by canvas ref
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const { currentUser } = useAuth();

  // --- NEW STATE & REF ---
  // Create a ref to control the canvas component programmatically
  const canvasRef = useRef<ReactSketchCanvasRef>(null); 
  // --- END NEW STATE & REF ---

  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Challenge: Solve for x',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  };

  // handleFileChange is no longer needed

  const handleSubmit = async () => {
    // --- MODIFIED SUBMISSION LOGIC ---
    if (!canvasRef.current) {
      setError("Canvas is not available.");
      return;
    }

    const isEmpty = await canvasRef.current.exportPaths();
    if (!isEmpty.length) {
      setError("Please write your solution on the canvas first!");
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
      // Export the canvas content as a PNG image
      const dataUri = await canvasRef.current.exportImage('png');
      // Convert the data URI to a File object that our API service expects
      const response = await fetch(dataUri);
      const blob = await response.blob();
      const imageFile = new File([blob], 'solution.png', { type: 'image/png' });
      
      const token = await currentUser.getIdToken();
      const result = await submitSolution(imageFile, token); // Use the new image file
      setSubmissionResult(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unknown error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
    // --- END MODIFIED SUBMISSION LOGIC ---
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

          {!submissionResult && (
            // --- MODIFIED SUBMISSION AREA ---
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Write Your Solution Below</h2>
              <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <ReactSketchCanvas
                  ref={canvasRef}
                  strokeWidth={4}
                  strokeColor="black"
                  canvasColor="white"
                  height="100%"
                  width="100%"
                />
              </div>
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full max-w-xs bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Analyzing...' : 'Submit for Feedback'}
                </button>
              </div>
            </div>
            // --- END MODIFIED SUBMISSION AREA ---
          )}
          
          {isLoading && (
            <div className="mt-8 flex justify-center items-center space-x-3">
              <LoadingSpinner />
              <p className="text-lg text-gray-600">Analyzing your submission, please wait...</p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {submissionResult && (
            <>
              <FeedbackDisplay result={submissionResult} />
              <div className="text-center mt-8">
                <button 
                  onClick={() => {
                    setSubmissionResult(null);
                    // setSelectedFile(null); // No longer needed
                    canvasRef.current?.clearCanvas(); // Clear the canvas for a new attempt
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