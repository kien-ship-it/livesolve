import React, { useState, useRef, useEffect } from 'react'; // Import useEffect
import { useAuth } from '../contexts/AuthContext';
import { submitSolution } from '../services/apiService';
import type { SubmissionResult } from '../services/apiService';
import FeedbackDisplay from '../components/problem/FeedbackDisplay';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';


const ProblemPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const { currentUser } = useAuth();
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  
  // --- NEW STATE & EFFECT FOR TOOLS ---
  type Tool = 'pen' | 'eraser';
  const [activeTool, setActiveTool] = useState<Tool>('pen');

  // This effect synchronizes our React state with the canvas library's mode.
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.eraseMode(activeTool === 'eraser');
    }
  }, [activeTool]); // It runs only when `activeTool` changes.
  // --- END NEW STATE & EFFECT ---

  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Challenge: Solve for x',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  };

  // --- NEW CANVAS CONTROL HANDLERS ---
  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
  };
  // --- END NEW CANVAS CONTROL HANDLERS ---

  const handleSubmit = async () => {
    if (!canvasRef.current) {
      setError("Canvas is not available.");
      return;
    }

    const paths = await canvasRef.current.exportPaths();
    if (!paths.length) {
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
      const dataUri = await canvasRef.current.exportImage('png');
      const response = await fetch(dataUri);
      const blob = await response.blob();
      const imageFile = new File([blob], 'solution.png', { type: 'image/png' });
      
      const token = await currentUser.getIdToken();
      const result = await submitSolution(imageFile, token);
      setSubmissionResult(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unknown error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW STYLING FOR TOOLBAR BUTTONS ---
  const getToolButtonStyles = (tool: Tool) => {
    const baseStyles = "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
    if (activeTool === tool) {
      return `${baseStyles} bg-blue-600 text-white shadow-sm`;
    }
    return `${baseStyles} bg-white hover:bg-gray-100 text-gray-700 border border-gray-300`;
  };
  // --- END NEW STYLING ---

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
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Write Your Solution Below</h2>

              {/* --- NEW CANVAS TOOLBAR --- */}
              <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
                <button onClick={() => setActiveTool('pen')} className={getToolButtonStyles('pen')}>
                  Pen
                </button>
                <button onClick={() => setActiveTool('eraser')} className={getToolButtonStyles('eraser')}>
                  Eraser
                </button>
                <div className="border-l border-gray-300 h-6 mx-1"></div>
                <button onClick={handleUndo} className="px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300">
                  Undo
                </button>
                <button onClick={handleClear} className="px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300">
                  Clear
                </button>
              </div>
              {/* --- END NEW CANVAS TOOLBAR --- */}

              {/* --- MODIFIED CANVAS CONTAINER --- */}
              <div className="w-full h-96 border-2 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg overflow-hidden">
                <ReactSketchCanvas
                  ref={canvasRef}
                  strokeWidth={4}
                  strokeColor="black"
                  eraserWidth={15} // Make eraser a bit bigger
                  canvasColor="white"
                  height="100%"
                  width="100%"
                />
              </div>
              {/* --- END MODIFIED CANVAS CONTAINER --- */}

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
                    handleClear(); // Use the new handler function
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