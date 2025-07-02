import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import type { ReactSketchCanvasRef } from 'react-sketch-canvas';

interface DrawingToolbarProps {
  canvasRef: React.RefObject<ReactSketchCanvasRef | null>;
  strokeWidth: number;
  strokeColor: string;
  eraserWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onStrokeColorChange: (color: string) => void;
  onEraserWidthChange: (width: number) => void;
  activeTool: 'pen' | 'eraser';
  onActiveToolChange: (tool: 'pen' | 'eraser') => void;
}

const tools = [
  { name: 'pen', icon: 'PenTool', label: 'Pen', group: 'main' },
  { name: 'eraser', icon: 'Eraser', label: 'Eraser', group: 'main' },
  { name: 'undo', icon: 'Undo2', label: 'Undo', group: 'action' },
  { name: 'redo', icon: 'Redo2', label: 'Redo', group: 'action' },
  { name: 'clear', icon: 'Trash2', label: 'Clear', group: 'action' },
];

const strokeWidths = [1, 2, 4, 6, 8, 12];
const colors = [
  { name: 'black', value: '#000000' },
  { name: 'red', value: '#ef4444' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'green', value: '#10b981' },
  { name: 'purple', value: '#8b5cf6' },
  { name: 'orange', value: '#f97316' },
];

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ 
  canvasRef, 
  strokeWidth, 
  strokeColor, 
  eraserWidth,
  onStrokeWidthChange, 
  onStrokeColorChange,
  onEraserWidthChange,
  activeTool,
  onActiveToolChange
}) => {
  const [pressed, setPressed] = useState<{ [key: string]: boolean }>({});

  // Update canvas when tool changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.eraseMode(activeTool === 'eraser');
    }
  }, [activeTool, canvasRef]);

  const handleActionClick = (toolName: string) => {
    setPressed((prev) => ({ ...prev, [toolName]: true }));
    setTimeout(() => {
      setPressed((prev) => ({ ...prev, [toolName]: false }));
    }, 180);

    if (!canvasRef.current) return;

    switch (toolName) {
      case 'undo':
        canvasRef.current.undo();
        break;
      case 'redo':
        canvasRef.current.redo();
        break;
      case 'clear':
        canvasRef.current.clearCanvas();
        break;
    }
  };

  const handleToolClick = (toolName: string) => {
    if (toolName === 'pen' || toolName === 'eraser') {
      onActiveToolChange(toolName as 'pen' | 'eraser');
    }
  };

  const handleWidthChange = (width: number) => {
    if (activeTool === 'pen') {
      onStrokeWidthChange(width);
    } else {
      onEraserWidthChange(width);
    }
  };

  const getCurrentWidth = () => {
    return activeTool === 'pen' ? strokeWidth : eraserWidth;
  };

  return (
    <div className="fixed bottom-6 z-30 left-64 right-0 flex justify-center">
      <div className="flex flex-row gap-2 bg-white rounded-lg shadow-lg p-2 border border-neutral-200">
        {/* Main tools */}
        {tools.map((tool, idx) => (
          <React.Fragment key={tool.name}>
            {idx === 2 && (
              <div className="mx-1 w-px h-6 bg-neutral-200 self-center" />
            )}
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full transition border-2 text-neutral-700
                ${tool.group === 'main' && activeTool === tool.name ? 'bg-neutral-100 border-neutral-300 shadow-md' : ''}
                ${tool.group === 'main' && activeTool !== tool.name ? 'bg-white border-transparent hover:bg-neutral-50' : ''}
                ${tool.group === 'action' && tool.name === 'undo' && pressed[tool.name] ? 'bg-blue-200 border-transparent' : ''}
                ${tool.group === 'action' && tool.name === 'redo' && pressed[tool.name] ? 'bg-blue-200 border-transparent' : ''}
                ${tool.group === 'action' && tool.name === 'clear' && pressed[tool.name] ? 'bg-red-200 border-transparent' : ''}
                ${tool.group === 'action' && !pressed[tool.name] ? 'bg-white border-transparent hover:bg-neutral-50' : ''}
              `}
              title={tool.label}
              onClick={() => {
                if (tool.group === 'main') handleToolClick(tool.name);
                if (tool.group === 'action') handleActionClick(tool.name);
              }}
              type="button"
            >
              <Icon iconName={tool.icon as any} size={16} />
            </button>
          </React.Fragment>
        ))}

        {/* Separator */}
        <div className="mx-1 w-px h-6 bg-neutral-200 self-center" />

        {/* Stroke width selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-500 mr-1">Width:</span>
          {strokeWidths.map((width) => (
            <button
              key={width}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium transition
                ${getCurrentWidth() === width ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-transparent'}
              `}
              onClick={() => handleWidthChange(width)}
              title={`${width}px`}
            >
              {width}
            </button>
          ))}
        </div>
        
        {activeTool === 'eraser' && (
          <>
          <div className="w-1 h-5"></div>
          </>
        )}
      
        {activeTool === 'pen' && (
          <>
          {/* Separator */}
          <div className="mx-1 w-px h-6 bg-neutral-200 self-center" />
          {/* Color picker - only show for pen tool */}
            <div className="flex items-center gap-1">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all
                    ${strokeColor === color.value ? 'border-neutral-400 scale-110' : 'border-transparent hover:scale-105'}
                  `}
                  style={{ backgroundColor: color.value }}
                  onClick={() => onStrokeColorChange(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DrawingToolbar; 