import React from 'react';
import DrawingCanvas, { type DrawingCanvasRef, type BoundingBox } from '../workspace/DrawingCanvas';
import Icon from '../ui/Icon';

interface CenterColumnProps {
  isSidebarCollapsed: boolean;
  strokeWidth: number;
  strokeColor: string;
  eraserWidth: number;
  canvasRef: React.RefObject<DrawingCanvasRef | null>;
  aiFeedbackBoxes: any[];
  showAiFeedbackBoxes: boolean;
  isSelectionModeActive: boolean;
  selectionBounds: BoundingBox | null;
  onSelectionChange: (bounds: BoundingBox) => void;
  onConfirmSelection: () => void;
  onCancelSelection: () => void;
  onBoundsCalculate: (bounds: BoundingBox | null) => void;
  isSubmitting: boolean;
  activeTool: 'pen' | 'eraser';
}

const currentPath = 'Algebra  /  Linear Systems'; // This would be dynamic in a real app

const CenterColumn: React.FC<CenterColumnProps> = ({ 
  isSidebarCollapsed,
  strokeWidth, 
  strokeColor, 
  eraserWidth, 
  canvasRef,
  aiFeedbackBoxes,
  showAiFeedbackBoxes,
  isSelectionModeActive,
  selectionBounds,
  onSelectionChange,
  onConfirmSelection,
  onCancelSelection,
  onBoundsCalculate,
  isSubmitting,
  activeTool
}) => {
  return (
    <main className="flex-1 flex flex-col min-w-0 h-full bg-white relative">
      {/* Fixed top bar extending from left edge to right edge */}
      <div className={`fixed top-0 right-0 left-0 h-14 flex items-center px-6 border-b border-neutral-200 bg-gray-50 z-10 justify-between transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-72'}`}>
        <span className="text-sm text-black-400 font-medium truncate max-w-xs">{currentPath}</span>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 transition" title="Star">
            <Icon iconName="Star" size={15} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 transition" title="More options">
            <Icon iconName="MoreVertical" size={15} />
          </button>
        </div>
      </div>
      {/* Canvas area with top margin and left padding to account for sidebar */}
      <div className="flex-1 p-0 mt-14 bg-white w-full">
        <DrawingCanvas 
          ref={canvasRef}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          eraserWidth={eraserWidth}
          aiFeedbackBoxes={aiFeedbackBoxes}
          showAiFeedbackBoxes={showAiFeedbackBoxes}
          isSelectionModeActive={isSelectionModeActive}
          selectionBounds={selectionBounds}
          onSelectionChange={onSelectionChange}
          onConfirmSelection={onConfirmSelection}
          onCancelSelection={onCancelSelection}
          onBoundsCalculate={onBoundsCalculate}
          isSubmitting={isSubmitting}
          activeTool={activeTool}
        />
      </div>
    </main>
  );
};

export default CenterColumn;  