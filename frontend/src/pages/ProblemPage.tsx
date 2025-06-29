import React, { useState, useRef, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitSolution } from '../services/apiService';
import type { SubmissionResult } from '../services/apiService';
import FeedbackDisplay from '../components/problem/FeedbackDisplay';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';
import SubmissionModal from '../components/problem/SubmissionModal';

// --- NEW TYPES FOR SELECTION LOGIC ---
type SelectionMode = 'inactive' | 'selecting' | 'selected';
interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }
// --- END NEW TYPES ---

const ProblemPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const { currentUser } = useAuth();
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref for the canvas's container div

  type Tool = 'pen' | 'eraser';
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NEW STATE FOR SELECTION ---
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('inactive');
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  // --- END NEW STATE FOR SELECTION ---

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.eraseMode(activeTool === 'eraser');
    }
  }, [activeTool]);

  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Challenge: Solve for x',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  };

  const handleUndo = () => canvasRef.current?.undo();
  const handleClear = () => canvasRef.current?.clearCanvas();

  // --- REFACTORED AND NEW LOGIC FOR SUBMISSION ---

  // Helper function to handle the actual API call, avoiding code duplication.
  const executeSubmission = async (imageFile: File) => {
    if (!currentUser) {
      setError("You must be logged in to submit a solution.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSubmissionResult(null);

    try {
      const token = await currentUser.getIdToken();
      const result = await submitSolution(imageFile, token);
      setSubmissionResult(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unknown error occurred during submission.");
    } finally {
      setIsLoading(false);
      setSelectionMode('inactive'); // Reset selection mode on completion
      setSelectionRect(null);
    }
  };
  
  // Converts a data URI to a File object
  const dataUriToFile = async (dataUri: string, filename: string): Promise<File> => {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'image/png' });
  };

  const handleConfirmSubmitAll = async () => {
    setIsModalOpen(false);
    if (!canvasRef.current) return;
    const dataUri = await canvasRef.current.exportImage('png');
    const imageFile = await dataUriToFile(dataUri, 'full_solution.png');
    await executeSubmission(imageFile);
  };
  
  // Confirms the selected area and submits the cropped image
  const handleConfirmSelection = async () => {
    if (!canvasRef.current || !selectionRect) return;
    
    // Export the full image first
    const fullDataUri = await canvasRef.current.exportImage('png');
    
    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        if (!ctx) return reject(new Error('Could not get canvas context'));
        
        // Set canvas size to selection size
        canvas.width = selectionRect.width;
        canvas.height = selectionRect.height;
        
        // Draw the cropped portion
        ctx.drawImage(
          img,
          selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height,
          0, 0, selectionRect.width, selectionRect.height
        );
        
        // Convert to data URI and submit
        const croppedDataUri = canvas.toDataURL('image/png');
        const imageFile = await dataUriToFile(croppedDataUri, 'cropped_solution.png');
        await executeSubmission(imageFile);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = fullDataUri;
    });
  };

  // Activates the selection mode
  const handleSelectArea = () => {
    setIsModalOpen(false);
    setSelectionMode('selecting');
  };
  
  // Resets the selection state
  const cancelSelection = () => {
      setSelectionMode('inactive');
      setSelectionRect(null);
      setIsDrawingRect(false);
  };

  const handleInitiateSubmit = async () => {
    if (!canvasRef.current) { setError("Canvas is not available."); return; }
    const paths = await canvasRef.current.exportPaths();
    if (!paths.length) { setError("Please write your solution on the canvas first!"); return; }
    if (!currentUser) { setError("You must be logged in to submit a solution."); return; }
    setError(null);
    setIsModalOpen(true);
  };
  // --- END REFACTORED LOGIC ---

  // --- MOUSE HANDLERS FOR DRAWING THE SELECTION RECTANGLE ---
  const getCoords = (e: MouseEvent): Point | null => {
      if (!canvasContainerRef.current) return null;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
      };
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (selectionMode !== 'selecting') return;
    e.preventDefault();
    const point = getCoords(e);
    if (!point) return;
    setIsDrawingRect(true);
    setStartPoint(point);
    setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawingRect || !startPoint) return;
    const currentPoint = getCoords(e);
    if (!currentPoint) return;
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(startPoint.x - currentPoint.x);
    const height = Math.abs(startPoint.y - currentPoint.y);
    setSelectionRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawingRect) return;
    setIsDrawingRect(false);
    if (selectionRect && (selectionRect.width > 5 || selectionRect.height > 5)) {
        setSelectionMode('selected');
    } else {
        // If the box is too small, just cancel the selection.
        cancelSelection();
    }
  };
  // --- END MOUSE HANDLERS ---

  const getToolButtonStyles = (tool: Tool) => {
    const base = "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
    return activeTool === tool
      ? `${base} bg-blue-600 text-white shadow-sm`
      : `${base} bg-white hover:bg-gray-100 text-gray-700 border border-gray-300`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">
      <div className="w-full max-w-3xl px-6 pb-12">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
          <p className="text-gray-600 mb-6">{problem.statement}</p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-8">
            <p className="text-2xl font-mono text-center text-blue-900">{problem.equation}</p>
          </div>
          <hr className="my-8" />

          {!submissionResult && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Write Your Solution Below</h2>
              <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
                <button onClick={() => setActiveTool('pen')} className={getToolButtonStyles('pen')}>Pen</button>
                <button onClick={() => setActiveTool('eraser')} className={getToolButtonStyles('eraser')}>Eraser</button>
                <div className="border-l border-gray-300 h-6 mx-1"></div>
                <button onClick={handleUndo} className="px-4 py-1.5 text-sm font-semibold rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-300">Undo</button>
                <button onClick={handleClear} className="px-4 py-1.5 text-sm font-semibold rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-300">Clear</button>
              </div>

              <div ref={canvasContainerRef} className="relative w-full h-96">
                <div className="w-full h-full border-2 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg overflow-hidden">
                  <ReactSketchCanvas ref={canvasRef} strokeWidth={4} strokeColor="black" eraserWidth={15} canvasColor="white" height="100%" width="100%" />
                </div>
                
                {/* --- UI FIX #2: SELECTION INSTRUCTION OVERLAY --- */}
                {selectionMode === 'selecting' && !isDrawingRect && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 text-white font-bold text-xl pointer-events-none rounded-b-lg">
                        Click and drag to select an area
                    </div>
                )}
                
                {selectionMode !== 'inactive' && (
                  <div className="absolute top-0 left-0 w-full h-full cursor-crosshair" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                    {selectionRect && (
                      // --- UI FIX #3: SELECTION RECTANGLE ---
                      <div
                        className="absolute border-2 border-solid border-blue-500 bg-blue-500/20"
                        style={{ left: selectionRect.x, top: selectionRect.y, width: selectionRect.width, height: selectionRect.height }}
                      />
                    )}
                  </div>
                )}
                
                {selectionMode === 'selected' && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                        <button onClick={handleConfirmSelection} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">Confirm Selection</button>
                        <button onClick={cancelSelection} className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg text-sm font-bold border">Cancel</button>
                    </div>
                )}
              </div>

              <div className="flex justify-center mt-6">
                 {/* --- UI FIX #1: SUBMIT BUTTON --- */}
                <button onClick={handleInitiateSubmit} disabled={isLoading || selectionMode !== 'inactive'} className="w-full max-w-xs bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400">
                  {isLoading ? 'Analyzing...' : 'Submit for Feedback'}
                </button>
              </div>
            </div>
          )}

          {isLoading && <div className="mt-8 flex justify-center items-center space-x-3"><LoadingSpinner /><p className="text-lg text-gray-600">Analyzing your submission, please wait...</p></div>}
          {error && <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md"><p className="font-bold">Error</p><p>{error}</p></div>}
          
          {submissionResult && (
            <>
              <FeedbackDisplay result={submissionResult} />
              <div className="text-center mt-8">
                <button onClick={() => { setSubmissionResult(null); handleClear(); }} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  Submit Another Solution
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirmSubmitAll={handleConfirmSubmitAll} onSelectArea={handleSelectArea} />
    </div>
  );
};

export default ProblemPage;