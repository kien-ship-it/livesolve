import { useState, useRef, useCallback, forwardRef, useImperativeHandle, type PointerEvent as ReactPointerEvent, useEffect } from 'react';
import { ReactSketchCanvas, type ReactSketchCanvasRef, type CanvasPath } from 'react-sketch-canvas';

// --- TYPES ---
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawingCanvasRef {
  exportStrokes: (bounds: BoundingBox) => Promise<{ image: Blob; bounds: BoundingBox } | null>;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  loadPaths: (paths: CanvasPath[]) => void;
  calculateAndReportBounds: () => void;
}

export interface DrawingCanvasProps {
  strokeColor: string;
  strokeWidth: number;
  eraserWidth: number;
  aiFeedbackBoxes?: any[];
  showAiFeedbackBoxes: boolean;
  onPathsChange?: (paths: CanvasPath[]) => void;
  isSelectionModeActive: boolean;
  selectionBounds: BoundingBox | null;
  onSelectionChange: (bounds: BoundingBox) => void;
  onConfirmSelection: () => void;
  onCancelSelection: () => void;
  onBoundsCalculate: (bounds: BoundingBox | null) => void;
  isSubmitting: boolean;
  activeTool: 'pen' | 'eraser';
}


type ResizeHandle = 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

// --- COMPONENT ---
const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      strokeColor,
      strokeWidth,
      eraserWidth,
      aiFeedbackBoxes = [],
      showAiFeedbackBoxes,
      onPathsChange,
      isSelectionModeActive,
      selectionBounds,
      onSelectionChange,
      onConfirmSelection,
      onCancelSelection,
      onBoundsCalculate,
      isSubmitting,
      activeTool,
    },
    ref
  ) => {
    const [size, setSize] = useState({ width: 1300, height: 1000 });
    const internalCanvasRef = useRef<ReactSketchCanvasRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    const [isCursorVisible, setIsCursorVisible] = useState(false);

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handlePointerEnter = () => {
      setIsCursorVisible(true);
    };

    const handlePointerLeave = () => {
      setIsCursorVisible(false);
    };

    useEffect(() => {
      if (internalCanvasRef.current) {
        internalCanvasRef.current.eraseMode(activeTool === 'eraser');
      }
    }, [activeTool]);

    const calculateBoundingBox = useCallback((paths: CanvasPath[]): BoundingBox | null => {
      if (!paths.length) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, hasPoints = false;
      paths.forEach(path => {
        if (!path.paths || path.paths.length === 0) return;
        path.paths.forEach(point => {
          hasPoints = true;
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
      });
      if (!hasPoints) return null;
      const padding = 20;
      return { x: minX - padding, y: minY - padding, width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 };
    }, []);

    const handlePathsChange = useCallback((newPaths: CanvasPath[]) => {
      onBoundsCalculate(calculateBoundingBox(newPaths));
      if (onPathsChange) onPathsChange(newPaths);
      const bounds = calculateBoundingBox(newPaths);
      if (bounds) {
        const requiredWidth = bounds.x + bounds.width + 100;
        const requiredHeight = bounds.y + bounds.height + 100;
        setSize(prevSize => ({ width: Math.max(prevSize.width, requiredWidth), height: Math.max(prevSize.height, requiredHeight) }));
      }
    }, [calculateBoundingBox, onBoundsCalculate, onPathsChange]);

    const exportStrokes = useCallback(async (boundsToExport: BoundingBox): Promise<{ image: Blob; bounds: BoundingBox } | null> => {
      if (!internalCanvasRef.current) return null;
      try {
        const imageUrl = await internalCanvasRef.current.exportImage('png');
        const img = new Image();
        img.src = imageUrl;
        await new Promise(resolve => { img.onload = resolve; });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        canvas.width = boundsToExport.width;
        canvas.height = boundsToExport.height;
        ctx.drawImage(img, boundsToExport.x, boundsToExport.y, boundsToExport.width, boundsToExport.height, 0, 0, boundsToExport.width, boundsToExport.height);
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) return null;
        return { image: blob, bounds: { ...boundsToExport } };
      } catch (error) {
        console.error('Error exporting strokes:', error);
        return null;
      }
    }, []);

    const handleResizePointerDown = (e: ReactPointerEvent<HTMLDivElement>, handle: ResizeHandle) => {
      e.stopPropagation();
      if (!selectionBounds) return;

      const startBounds = { ...selectionBounds };
      const startPointerPos = { x: e.clientX, y: e.clientY };

      const onMove = (event: PointerEvent) => {
        const dx = event.clientX - startPointerPos.x;
        const dy = event.clientY - startPointerPos.y;
        
        let newBounds = { ...startBounds };

        if (handle.includes('left')) {
          newBounds.x = startBounds.x + dx;
          newBounds.width = startBounds.width - dx;
        }
        if (handle.includes('right')) {
          newBounds.width = startBounds.width + dx;
        }
        if (handle.includes('top')) {
          newBounds.y = startBounds.y + dy;
          newBounds.height = startBounds.height - dy;
        }
        if (handle.includes('bottom')) {
          newBounds.height = startBounds.height + dy;
        }

        if (newBounds.width < 20) {
          if (handle.includes('left')) {
            newBounds.x = startBounds.x + startBounds.width - 20;
          }
          newBounds.width = 20;
        }
        if (newBounds.height < 20) {
          if (handle.includes('top')) {
            newBounds.y = startBounds.y + startBounds.height - 20;
          }
          newBounds.height = 20;
        }
        
        onSelectionChange(newBounds);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    useImperativeHandle(ref, () => ({
      exportStrokes,
      clearCanvas: () => internalCanvasRef.current?.clearCanvas(),
      undo: () => internalCanvasRef.current?.undo(),
      redo: () => internalCanvasRef.current?.redo(),
      loadPaths: (paths) => internalCanvasRef.current?.loadPaths(paths),
      calculateAndReportBounds: () => {
        internalCanvasRef.current?.exportPaths()
          .then((paths: CanvasPath[]) => {
            onBoundsCalculate(calculateBoundingBox(paths));
          })
          .catch(e => console.error('Error exporting paths:', e));
      },
    }));

    const handleDragPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!selectionBounds) return;

      const startBounds = { ...selectionBounds };
      const startPointerPos = { x: e.clientX, y: e.clientY };

      const onMove = (event: PointerEvent) => {
        const dx = event.clientX - startPointerPos.x;
        const dy = event.clientY - startPointerPos.y;
        
        const newBounds = {
          ...startBounds,
          x: startBounds.x + dx,
          y: startBounds.y + dy,
        };
        
        onSelectionChange(newBounds);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    const renderResizeHandles = () => {
      if (!selectionBounds) return null;
      const handles: { id: ResizeHandle; cursor: string }[] = [
        { id: 'top-left', cursor: 'nwse-resize' }, { id: 'top', cursor: 'ns-resize' }, { id: 'top-right', cursor: 'nesw-resize' },
        { id: 'left', cursor: 'ew-resize' }, { id: 'right', cursor: 'ew-resize' },
        { id: 'bottom-left', cursor: 'nesw-resize' }, { id: 'bottom', cursor: 'ns-resize' }, { id: 'bottom-right', cursor: 'nwse-resize' },
      ];
      return handles.map(({ id, cursor }) => {
        const style: React.CSSProperties = { position: 'absolute', width: 10, height: 10, border: '1px solid #fff', background: '#3b82f6', cursor };
        if (id.includes('top')) style.top = -5;
        if (id.includes('bottom')) style.bottom = -5;
        if (id.includes('left')) style.left = -5;
        if (id.includes('right')) style.right = -5;
        if (id === 'top' || id === 'bottom') { style.left = 'calc(50% - 5px)'; }
        if (id === 'left' || id === 'right') { style.top = 'calc(50% - 5px)'; }
        return <div key={id} style={style} onPointerDown={(e) => handleResizePointerDown(e, id)} />;
      });
    };

    return (
      <div
        className="w-full h-full bg-white relative overflow-hidden"
        ref={wrapperRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}

      >
        {isCursorVisible && cursorPosition && (() => {
          const cursorSize = activeTool === 'pen' ? strokeWidth : eraserWidth;
          
          const hexToRgba = (hex: string, alpha = 1) => {
            if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return `rgba(0,0,0,${alpha})`;
            let c = hex.substring(1).split('');
            if (c.length === 3) {
              c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            const cInt = parseInt('0x' + c.join(''));
            return `rgba(${[(cInt >> 16) & 255, (cInt >> 8) & 255, cInt & 255].join(',')},${alpha})`;
          };

          const cursorBackgroundColor = activeTool === 'pen' 
            ? hexToRgba(strokeColor, 0.5) 
            : 'rgba(255, 255, 255, 0.7)';
            
          return (
            <div
              style={{
                position: 'absolute',
                left: `${cursorPosition.x}px`,
                top: `${cursorPosition.y}px`,
                width: cursorSize,
                height: cursorSize,
                backgroundColor: cursorBackgroundColor,
                border: '1px solid black',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            />
          );
        })()}
        <div style={{ width: `${size.width}px`, height: `${size.height}px`, position: 'relative' }}>
          <ReactSketchCanvas
            ref={internalCanvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            width={`${size.width}`}
            height={`${size.height}`}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            eraserWidth={eraserWidth}
            onChange={handlePathsChange}
          />
          {isSelectionModeActive && selectionBounds && (
            <div 
              style={{ position: 'absolute', left: selectionBounds.x, top: selectionBounds.y, width: selectionBounds.width, height: selectionBounds.height, cursor: isSubmitting ? 'default' : 'move' }}
              onPointerDown={isSubmitting ? undefined : handleDragPointerDown}
            >
              <div className={`w-full h-full bg-blue-500/20 rounded border-2 border-blue-600 pointer-events-none ${isSubmitting ? 'animate-breathing' : ''}`} />
              {!isSubmitting && renderResizeHandles()}
              {!isSubmitting && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex space-x-2">
                  <button
                    onClick={onConfirmSelection}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold hover:bg-blue-700 transition-colors z-20"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={onCancelSelection}
                    className="bg-white text-gray-800 px-4 py-2 rounded-lg border-gray-200 border shadow-sm text-sm font-bold hover:bg-gray-200 transition-colors z-20"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
          {showAiFeedbackBoxes && aiFeedbackBoxes.map((box, index) => {
            const [x1, y1, x2, y2] = box.box_2d;
            return <div key={index} className="absolute bg-red-500/30 border-2 border-red-600 rounded-lg pointer-events-none z-10" style={{ left: x1, top: y1, width: x2 - x1, height: y2 - y1 }} />;
          })}
        </div>
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;