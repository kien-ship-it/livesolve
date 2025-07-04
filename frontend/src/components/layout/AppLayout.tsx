import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { submitSolution } from '../../services/apiService';
import LeftSidebar from './LeftSidebar';
import CenterColumn from './CenterColumn';
import DrawingToolbar from '../workspace/DrawingToolbar';
import AIFloatingButton from '../ai/AIFloatingButton';
import AIChatPanel from '../ai/AIChatPanel';
import type { DrawingCanvasRef, BoundingBox } from '../workspace/DrawingCanvas';

const AppLayout: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [eraserWidth, setEraserWidth] = useState(20);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const canvasRef = useRef<DrawingCanvasRef | null>(null);
  const [aiFeedbackBoxes, setAiFeedbackBoxes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // State for interactive selection
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [selectionBounds, setSelectionBounds] = useState<BoundingBox | null>(null);
  const [showAiFeedbackBoxes, setShowAiFeedbackBoxes] = useState(true);

  const { currentUser } = useAuth();

  const handleCaptureAllWork = () => {
    if (!canvasRef.current) return;
    // Set selection mode to active, then trigger the bounds calculation.
    // The `onBoundsCalculate` callback will handle setting the selection bounds.
    setIsSelectionModeActive(true);
    canvasRef.current.calculateAndReportBounds();
    setAiOpen(false);
  };

  const handleBoundsCalculate = (bounds: BoundingBox | null) => {
    if (bounds) {
      setSelectionBounds(bounds);
    } else {
      setIsSelectionModeActive(false);

    }
  };

  const handleSelectionChange = (bounds: BoundingBox) => {
    setSelectionBounds(bounds);
  };

  const handleCancelSelection = () => {
    setIsSelectionModeActive(false);
    setSelectionBounds(null);
    setAiFeedbackBoxes([]);
    setAiOpen(false);
  };

  const handleConfirmSelection = async () => {
    if (!canvasRef.current || !selectionBounds || isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    setAiFeedbackBoxes([]);

    try {
      const result = await canvasRef.current.exportStrokes(selectionBounds);
      if (!result) {
        throw new Error('Could not export strokes. Is the canvas empty?');
      }

      const imageFile = new File([result.image], 'canvas_capture.png', { type: 'image/png' });

      if (!currentUser) {
        throw new Error('You must be logged in to get feedback.');
      }
      const token = await currentUser.getIdToken();

      const apiResponse = await submitSolution(imageFile, token);

      if (apiResponse.ai_feedback_data && apiResponse.ai_feedback_data.errors) {
        const translatedBoxes = apiResponse.ai_feedback_data.errors.map(error => {
          const [x1, y1, x2, y2] = error.box_2d;
          const { x, y, width, height } = result.bounds;

          const imgX1 = (x1 / 1000) * width;
          const imgY1 = (y1 / 1000) * height;
          const imgX2 = (x2 / 1000) * width;
          const imgY2 = (y2 / 1000) * height;

          return {
            ...error,
            box_2d: [
              imgX1 + x,
              imgY1 + y,
              imgX2 + x,
              imgY2 + y,
            ],
          };
        });
        setShowAiFeedbackBoxes(true);
        setAiFeedbackBoxes(translatedBoxes);
      } else {
        setAiFeedbackBoxes([]);
      }
    } catch (error: any) {
      console.error('Error getting AI feedback:', error);
      setSubmissionError(error.message || 'An unexpected error occurred.');
      alert(`Error: ${error.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsSubmitting(false);
      setSelectionBounds(null);
      setIsSelectionModeActive(false);
    }
  };

  return (
    <div className="flex h-screen bg-white relative">
      {/* Fixed left sidebar */}
      <div className="fixed left-0 top-0 h-full z-20 bg-gray-50">
        <LeftSidebar />
      </div>
      {/* Main content area extending to left edge to cover gaps */}
      <div className="flex-1 flex min-w-0 transition-all duration-300 ml-0 bg-white">
        <CenterColumn
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          eraserWidth={eraserWidth}
          canvasRef={canvasRef}
          aiFeedbackBoxes={aiFeedbackBoxes}
          showAiFeedbackBoxes={showAiFeedbackBoxes}
          isSelectionModeActive={isSelectionModeActive}
          selectionBounds={selectionBounds}
          onSelectionChange={handleSelectionChange}
          onConfirmSelection={handleConfirmSelection}
          onCancelSelection={handleCancelSelection}
          onBoundsCalculate={handleBoundsCalculate}
          isSubmitting={isSubmitting}
          activeTool={activeTool}
        />
      </div>
      {/* Fixed drawing toolbar */}
      <DrawingToolbar 
        canvasRef={canvasRef}
        strokeWidth={strokeWidth}
        strokeColor={strokeColor}
        eraserWidth={eraserWidth}
        onStrokeWidthChange={setStrokeWidth}
        onStrokeColorChange={setStrokeColor}
        onEraserWidthChange={setEraserWidth}
        activeTool={activeTool}
        onActiveToolChange={setActiveTool}
        showAiFeedbackBoxes={showAiFeedbackBoxes}
        onToggleAiFeedbackBoxes={() => setShowAiFeedbackBoxes(prev => !prev)}
        hasAiFeedback={aiFeedbackBoxes.length > 0}
      />
      <AIFloatingButton onClick={() => setAiOpen(true)} show={!aiOpen} />
      {aiOpen && <AIChatPanel onClose={() => setAiOpen(false)} onCaptureAllWork={handleCaptureAllWork} isSubmitting={isSubmitting} submissionError={submissionError} />}
    </div>
  );
};

export default AppLayout;