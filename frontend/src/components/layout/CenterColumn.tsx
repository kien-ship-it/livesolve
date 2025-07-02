import React from 'react';
import DrawingCanvas, { type DrawingCanvasRef, type BoundingBox } from '../workspace/DrawingCanvas';
import Icon from '../ui/Icon';

interface CenterColumnProps {
  strokeWidth: number;
  strokeColor: string;
  eraserWidth: number;
  canvasRef: React.RefObject<DrawingCanvasRef | null>;
  aiFeedbackBoxes: any[];
  isSelectionModeActive: boolean;
  selectionBounds: BoundingBox | null;
  onSelectionChange: (bounds: BoundingBox) => void;
  onConfirmSelection: () => void;
  onBoundsCalculate: (bounds: BoundingBox | null) => void;
}

const currentPath = 'Algebra  /  Linear Systems'; // This would be dynamic in a real app

const CenterColumn: React.FC<CenterColumnProps> = ({ 
  strokeWidth, 
  strokeColor, 
  eraserWidth, 
  canvasRef,
  aiFeedbackBoxes,
  isSelectionModeActive,
  selectionBounds,
  onSelectionChange,
  onConfirmSelection,
  onBoundsCalculate
}) => {
  return (
    <main className="flex-1 flex flex-col min-w-0 h-full bg-white relative">
      {/* Fixed top bar extending from left edge to right edge */}
      <div className="fixed top-0 right-0 left-0 h-14 flex items-center px-6 border-b border-neutral-200 bg-white shadow-sm z-10 justify-between">
        <span className="text-sm text-black-400 font-medium truncate max-w-xs ml-64">{currentPath}</span>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-neutral-100 transition" title="Star">
            <Icon iconName="Star" size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-neutral-100 transition" title="More options">
            <Icon iconName="MoreVertical" size={20} />
          </button>
        </div>
      </div>
      {/* Canvas area with top margin and left padding to account for sidebar */}
      <div className="flex-1 p-0 mt-14 bg-white w-full pl-60">
        <DrawingCanvas 
          ref={canvasRef}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          eraserWidth={eraserWidth}
          aiFeedbackBoxes={aiFeedbackBoxes}
          isSelectionModeActive={isSelectionModeActive}
          selectionBounds={selectionBounds}
          onSelectionChange={onSelectionChange}
          onConfirmSelection={onConfirmSelection}
          onBoundsCalculate={onBoundsCalculate}
        />
      </div>
    </main>
  );
};

export default CenterColumn;  