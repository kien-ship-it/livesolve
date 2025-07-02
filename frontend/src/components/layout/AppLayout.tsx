import React, { useState, useRef } from 'react';
import LeftSidebar from './LeftSidebar';
import CenterColumn from './CenterColumn';
import DrawingToolbar from '../workspace/DrawingToolbar';
import AIFloatingButton from '../ai/AIFloatingButton';
import AIChatPanel from '../ai/AIChatPanel';
import type { ReactSketchCanvasRef } from 'react-sketch-canvas';

const AppLayout: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [eraserWidth, setEraserWidth] = useState(8);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

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
      {aiOpen && <AIChatPanel onClose={() => setAiOpen(false)} />}
    </div>
  );
};

export default AppLayout; 