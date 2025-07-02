import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { submitSolution } from '../../services/apiService';
import LeftSidebar from './LeftSidebar';
import CenterColumn from './CenterColumn';
import DrawingToolbar from '../workspace/DrawingToolbar';
import AIFloatingButton from '../ai/AIFloatingButton';
import AIChatPanel from '../ai/AIChatPanel';
import type { DrawingCanvasRef } from '../workspace/DrawingCanvas';

const AppLayout: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [eraserWidth, setEraserWidth] = useState(8);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [aiFeedbackBoxes, setAiFeedbackBoxes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { currentUser } = useAuth();

  const handleCaptureAllWork = async () => {
    if (!canvasRef.current || isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    setAiFeedbackBoxes([]);

    try {
      const result = await canvasRef.current.exportStrokes();
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

          // Scale the normalized coordinates to the exported image's dimensions
          const imgX1 = (x1 / 1000) * width;
          const imgY1 = (y1 / 1000) * height;
          const imgX2 = (x2 / 1000) * width;
          const imgY2 = (y2 / 1000) * height;

          // Translate the coordinates back to the canvas space
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
          activeTool={activeTool}
          aiFeedbackBoxes={aiFeedbackBoxes}
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
      />
      <AIFloatingButton onClick={() => setAiOpen(true)} show={!aiOpen} />
      {aiOpen && <AIChatPanel onClose={() => setAiOpen(false)} onCaptureAllWork={handleCaptureAllWork} isSubmitting={isSubmitting} submissionError={submissionError} />}
    </div>
  );
};

export default AppLayout;