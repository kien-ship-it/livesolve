/*
//
// FILE: frontend/src/pages/ProblemPage.tsx
//
import React, { useState, useRef, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitSolution } from '../services/apiService';
// --- UPDATED: Import new types for AI feedback with translation and error bounding boxes ---
import type { SubmissionResult } from '../services/apiService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ReactSketchCanvas, type ReactSketchCanvasRef, type CanvasPath } from 'react-sketch-canvas';
import SubmissionModal from '../components/problem/SubmissionModal';
// 
// Types
type SelectionMode = 'inactive' | 'selecting' | 'selected';
interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }
interface SentImageDimensions { width: number; height: number; }

const ProblemPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const { currentUser } = useAuth();
  
  const sketchCanvasRef = useRef<ReactSketchCanvasRef>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  type Tool = 'pen' | 'eraser';
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selection state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('inactive');
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  
  // State for error bounding box rendering
  const [sentImageDimensions, setSentImageDimensions] = useState<SentImageDimensions | null>(null);
  const [userPaths, setUserPaths] = useState<CanvasPath[]>([]);

  useEffect(() => {
    sketchCanvasRef.current?.eraseMode(activeTool === 'eraser');
  }, [activeTool]);

  // +++ UPDATED: This effect now renders error bounding boxes instead of segmentation masks +++
  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    const ctx = overlayCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Always clear the overlay first
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Ensure we have everything needed to render the error bounding boxes
    if (
      submissionResult && 
      submissionResult.ai_feedback_data?.errors && 
      submissionResult.ai_feedback_data.errors.length > 0 && 
      sentImageDimensions && 
      sketchCanvasRef.current && 
      canvasContainerRef.current
    ) {
      // Sync overlay canvas size with the container
      const containerRect = canvasContainerRef.current.getBoundingClientRect();
      overlayCanvas.width = containerRect.width;
      overlayCanvas.height = containerRect.height;
      
      // Restore the user's drawing on the main canvas
      sketchCanvasRef.current.loadPaths(userPaths);
      
      const { errors } = submissionResult.ai_feedback_data;

      // Draw a semi-transparent filled rectangle for each error bounding box
      errors.forEach((errorData) => {
        const [x1, y1, x2, y2] = errorData.box_2d;
        const targetX = (x1 / 1000) * overlayCanvas.width;
        const targetY = (y1 / 1000) * overlayCanvas.height;
        const targetWidth = ((x2 - x1) / 1000) * overlayCanvas.width;
        const targetHeight = ((y2 - y1) / 1000) * overlayCanvas.height;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; // Red with 30% opacity
        ctx.fillRect(targetX, targetY, targetWidth, targetHeight);
        
        // Add a border to make the error area more visible
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetX, targetY, targetWidth, targetHeight);
      });
    }
  }, [submissionResult, sentImageDimensions, userPaths]);

  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Challenge: Solve for x',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  };

  const handleUndo = () => sketchCanvasRef.current?.undo();
  
  const handleClear = () => {
    sketchCanvasRef.current?.clearCanvas();
    setUserPaths([]);
  };

  const executeSubmission = async (imageFile: File, imageDimensions: SentImageDimensions) => {
    if (!currentUser) {
      setError("You must be logged in.");
      return;
    }
    const paths = await sketchCanvasRef.current?.exportPaths();
    setUserPaths(paths || []);
    setSentImageDimensions(imageDimensions);

    setIsLoading(true);
    setError(null);
    setSubmissionResult(null);

    try {
      const token = await currentUser.getIdToken();
      const result = await submitSolution(imageFile, token);
      setSubmissionResult(result);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setSelectionMode('inactive');
      setSelectionRect(null);
    }
  };

  const dataUriToFile = async (dataUri: string, filename: string): Promise<{ file: File; dimensions: SentImageDimensions }> => {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    const img = new Image();
    const promise = new Promise<SentImageDimensions>((resolve, reject) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
    });
    img.src = dataUri;
    const dimensions = await promise;

    return { file, dimensions };
  };

  const handleConfirmSubmitAll = async () => {
    setIsModalOpen(false);
    if (!sketchCanvasRef.current) return;
    const dataUri = await sketchCanvasRef.current.exportImage('png');
    const { file, dimensions } = await dataUriToFile(dataUri, 'full_solution.png');
    await executeSubmission(file, dimensions);
  };
  
  const handleConfirmSelection = async () => {
    if (!sketchCanvasRef.current || !selectionRect) return;
    const fullDataUri = await sketchCanvasRef.current.exportImage('png');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        if (!ctx) return reject(new Error('Canvas context error'));
        canvas.width = selectionRect.width;
        canvas.height = selectionRect.height;
        ctx.drawImage(img, selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height, 0, 0, selectionRect.width, selectionRect.height);
        
        const croppedDataUri = canvas.toDataURL('image/png');
        const { file, dimensions } = await dataUriToFile(croppedDataUri, 'cropped_solution.png');
        await executeSubmission(file, dimensions);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = fullDataUri;
    });
  };
  
  // ... (JSX and other handlers remain the same)
  const handleSelectArea = () => { setIsModalOpen(false); setSelectionMode('selecting'); };
  const cancelSelection = () => { setSelectionMode('inactive'); setSelectionRect(null); setIsDrawingRect(false); };
  const handleInitiateSubmit = async () => { if (!sketchCanvasRef.current) { setError("Canvas is not available."); return; } const paths = await sketchCanvasRef.current.exportPaths(); if (!paths.length) { setError("Please write your solution on the canvas first!"); return; } if (!currentUser) { setError("You must be logged in to submit a solution."); return; } setError(null); setIsModalOpen(true); };
  const getCoords = (e: MouseEvent): Point | null => { if (!canvasContainerRef.current) return null; const rect = canvasContainerRef.current.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const handleMouseDown = (e: MouseEvent) => { if (selectionMode !== 'selecting') return; e.preventDefault(); const point = getCoords(e); if (!point) return; setIsDrawingRect(true); setStartPoint(point); setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 }); };
  const handleMouseMove = (e: MouseEvent) => { if (!isDrawingRect || !startPoint) return; const currentPoint = getCoords(e); if (!currentPoint) return; const x = Math.min(startPoint.x, currentPoint.x); const y = Math.min(startPoint.y, currentPoint.y); const width = Math.abs(startPoint.x - currentPoint.x); const height = Math.abs(startPoint.y - currentPoint.y); setSelectionRect({ x, y, width, height }); };
  const handleMouseUp = () => { if (!isDrawingRect) return; setIsDrawingRect(false); if (selectionRect && (selectionRect.width > 5 || selectionRect.height > 5)) { setSelectionMode('selected'); } else { cancelSelection(); } };
  const getToolButtonStyles = (tool: Tool) => { const base = "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"; return activeTool === tool ? `${base} bg-blue-600 text-white shadow-sm` : `${base} bg-white hover:bg-gray-100 text-gray-700 border border-gray-300`; };

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
          
          // { Always show toolbox and canvas }
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {submissionResult ? "Here is your feedback:" : "Write Your Solution Below"}
            </h2>
            <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
              <button onClick={() => setActiveTool('pen')} className={getToolButtonStyles('pen')}>Pen</button>
              <button onClick={() => setActiveTool('eraser')} className={getToolButtonStyles('eraser')}>Eraser</button>
              <div className="border-l border-gray-300 h-6 mx-1"></div>
              <button onClick={handleUndo} className="px-4 py-1.5 text-sm font-semibold rounded-md">Undo</button>
              <button onClick={handleClear} className="px-4 py-1.5 text-sm font-semibold rounded-md">Clear</button>
            </div>
            <div ref={canvasContainerRef} className="relative w-full h-96">
              <div className="absolute top-0 left-0 w-full h-full border-2 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg overflow-hidden">
                <ReactSketchCanvas ref={sketchCanvasRef} strokeWidth={4} strokeColor="black" eraserWidth={15} canvasColor="white" height="100%" width="100%" />
              </div>
              <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }} />
              {selectionMode === 'selecting' && !isDrawingRect && ( <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 text-white font-bold text-xl pointer-events-none rounded-b-lg z-20">Click and drag to select an area</div>)}
              {selectionMode !== 'inactive' && ( <div className="absolute top-0 left-0 w-full h-full cursor-crosshair z-20" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>{selectionRect && (<div className="absolute border-2 border-solid border-blue-500 bg-blue-500/20 z-20" style={{ left: selectionRect.x, top: selectionRect.y, width: selectionRect.width, height: selectionRect.height }}/>)}</div>)}
              {selectionMode === 'selected' && (<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-30"><button onClick={handleConfirmSelection} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">Confirm Selection</button><button onClick={cancelSelection} className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg text-sm font-bold border">Cancel</button></div>)}
            </div>
            {submissionResult && (!submissionResult.ai_feedback_data || !submissionResult.ai_feedback_data.errors || submissionResult.ai_feedback_data.errors.length === 0) && (
            <>
              <div className="mt-8 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md">
                <p className="font-bold">Success</p>
                <p>Your solution is correct! 🎉</p>
              </div>
            </>
          )}
            <div className="flex justify-center mt-6">
              <button onClick={handleInitiateSubmit} disabled={isLoading || selectionMode !== 'inactive'} className="w-full max-w-xs bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                {isLoading ? 'Analyzing...' : 'Submit for Feedback'}
              </button>
            </div>
          </div>

          // { Conditionally render feedback messages and buttons below the canvas/tools }
          {isLoading && <div className="mt-8 flex justify-center items-center space-x-3"><LoadingSpinner /><p className="text-lg text-gray-600">Analyzing...</p></div>}
          {error && (
            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {submissionResult && (!submissionResult.ai_feedback_data || !submissionResult.ai_feedback_data.errors || submissionResult.ai_feedback_data.errors.length === 0) && (
            <>
              <div className="text-center mt-8">
                <button onClick={() => { setSubmissionResult(null); handleClear(); setSentImageDimensions(null); }} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
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
*/