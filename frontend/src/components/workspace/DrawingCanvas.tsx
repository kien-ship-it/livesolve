import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ReactSketchCanvas, type ReactSketchCanvasRef, type CanvasPath } from 'react-sketch-canvas';

export interface DrawingCanvasRef extends ReactSketchCanvasRef {
  exportStrokes: () => Promise<{
    image: Blob;
    bounds: { x: number; y: number; width: number; height: number };
  } | null>;
}

interface DrawingCanvasProps {
  strokeWidth?: number;
  strokeColor?: string;
  eraserWidth?: number;
  showBoundingBox?: boolean;
  onPathsChange?: (paths: CanvasPath[]) => void;
}

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ 
  strokeWidth = 2, 
  strokeColor = 'black',
  eraserWidth = 8,
  showBoundingBox = true,
  onPathsChange
}, ref) => {
  const [size] = useState({ width: 1300, height: 1000 });
  const [paths, setPaths] = useState<CanvasPath[]>([]);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  
  const internalCanvasRef = useRef<ReactSketchCanvasRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPanRef = useRef<Point>({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);

  // Enhanced wheel handler for smooth omni-directional scrolling
  const handleWheel = useCallback((event: WheelEvent) => {
    // Don't interfere with drawing
    if (isDrawingRef.current) return;
    
    // Prevent default only if we're going to handle it
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;
    
    // If there's significant diagonal movement, enhance the scroll
    if (Math.abs(deltaX) > 0 && Math.abs(deltaY) > 0) {
      event.preventDefault();
      
      if (wrapperRef.current) {
        const wrapper = wrapperRef.current;
        
        // Apply smooth scrolling with enhanced diagonal support
        wrapper.scrollBy({
          left: deltaX,
          top: deltaY,
          behavior: 'smooth'
        });
      }
    }
    // Otherwise, let the browser handle normal scrolling
  }, []);

  // Pan gesture support for mobile and mouse
  const handlePointerDown = useCallback((event: PointerEvent) => {
    // Only handle middle mouse button (wheel click) or touch for panning
    if (event.button === 1 || event.pointerType === 'touch') {
      event.preventDefault();
      isPanningRef.current = true;
      lastPanRef.current = { x: event.clientX, y: event.clientY };
      
      // Change cursor to indicate panning
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = 'grabbing';
      }
    }
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (isPanningRef.current) {
      event.preventDefault();
      
      const deltaX = event.clientX - lastPanRef.current.x;
      const deltaY = event.clientY - lastPanRef.current.y;
      
      if (wrapperRef.current) {
        wrapperRef.current.scrollBy({
          left: -deltaX,
          top: -deltaY,
          behavior: 'auto' // Instant for smooth panning
        });
      }
      
      lastPanRef.current = { x: event.clientX, y: event.clientY };
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      
      // Reset cursor
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = 'default';
      }
    }
  }, []);

  // Keyboard navigation for precise control
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isDrawingRef.current) return; // Don't scroll while drawing
    
    const scrollAmount = 100; // pixels per key press
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (wrapperRef.current) {
          wrapperRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (wrapperRef.current) {
          wrapperRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (wrapperRef.current) {
          wrapperRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (wrapperRef.current) {
          wrapperRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
        break;
      case 'Home':
        event.preventDefault();
        if (wrapperRef.current) {
          wrapperRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        }
        break;
      case 'End':
        event.preventDefault();
        if (wrapperRef.current) {
          wrapperRef.current.scrollTo({ 
            left: wrapperRef.current.scrollWidth - wrapperRef.current.clientWidth,
            top: wrapperRef.current.scrollHeight - wrapperRef.current.clientHeight,
            behavior: 'smooth' 
          });
        }
        break;
    }
  }, []);

  // Calculate bounding box from paths
  const calculateBoundingBox = useCallback((paths: CanvasPath[]): BoundingBox | null => {
    if (!paths.length) return null;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let hasPoints = false;
    
    paths.forEach(path => {
      // Access the points array safely
      const points = (path as any).points || [];
      // Points are stored as [x1, y1, x2, y2, ...] in the path
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        if (x === undefined || y === undefined) continue;
        
        hasPoints = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    });
    
    if (!hasPoints) return null;
    
    // Add some padding around the strokes
    const padding = 20;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: Math.max(0, maxX - minX + padding * 2),
      height: Math.max(0, maxY - minY + padding * 2)
    };
  }, []);

  // Update bounding box when paths change
  useEffect(() => {
    const newBoundingBox = calculateBoundingBox(paths);
    setBoundingBox(newBoundingBox);
  }, [paths, calculateBoundingBox]);

  // Handle paths change
  const handlePathsChange = useCallback((updatedPaths: CanvasPath[]) => {
    setPaths(updatedPaths);
    onPathsChange?.(updatedPaths);
  }, [onPathsChange]);

  // Attach event listeners to the wrapper div
  useEffect(() => {
    const wrapperDiv = wrapperRef.current;
    if (!wrapperDiv) return;

    // Add event listeners
    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    const pointerDownHandler = (e: PointerEvent) => handlePointerDown(e);
    const pointerMoveHandler = (e: PointerEvent) => handlePointerMove(e);
    const keyDownHandler = (e: KeyboardEvent) => handleKeyDown(e);

    wrapperDiv.addEventListener('wheel', wheelHandler, { passive: false });
    wrapperDiv.addEventListener('pointerdown', pointerDownHandler, { passive: false });
    wrapperDiv.addEventListener('pointermove', pointerMoveHandler, { passive: false });
    wrapperDiv.addEventListener('pointerup', handlePointerUp, { passive: true });
    wrapperDiv.addEventListener('pointerleave', handlePointerUp, { passive: true });
    
    // Keyboard event listener
    document.addEventListener('keydown', keyDownHandler);

    return () => {
      wrapperDiv.removeEventListener('wheel', wheelHandler);
      wrapperDiv.removeEventListener('pointerdown', pointerDownHandler);
      wrapperDiv.removeEventListener('pointermove', pointerMoveHandler);
      wrapperDiv.removeEventListener('pointerup', handlePointerUp);
      wrapperDiv.removeEventListener('pointerleave', handlePointerUp);
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [handleWheel, handlePointerDown, handlePointerMove, handlePointerUp, handleKeyDown]);

  // Debug: Add a visual indicator to see the current size
  useEffect(() => {
    console.log('Canvas size updated:', size);
  }, [size]);

  // Export the area containing all strokes
  const exportStrokes = useCallback(async () => {
    if (!internalCanvasRef.current || !boundingBox) return null;
    
    try {
      // First, export the entire canvas as an image
      const imageUrl = await internalCanvasRef.current.exportImage('png');
      
      // Create an image element to load the exported image
      const img = new Image();
      img.src = imageUrl;
      
      // Wait for the image to load
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Handle potential loading errors
      });
      
      // Create a canvas to draw the cropped portion
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Set canvas size to match the bounding box
      canvas.width = boundingBox.width;
      canvas.height = boundingBox.height;
      
      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
        0,
        0,
        boundingBox.width,
        boundingBox.height
      );
      
      // Convert the canvas to a blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
      
      if (!blob) return null;
      
      return {
        image: blob,
        bounds: { ...boundingBox }
      };
    } catch (error) {
      console.error('Error exporting strokes:', error);
      return null;
    }
  }, [internalCanvasRef, boundingBox]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    ...(internalCanvasRef.current || {} as ReactSketchCanvasRef),
    exportStrokes
  }), [exportStrokes]);

  return (
    <div
      className="w-full h-full bg-white relative overflow-hidden"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        ref={wrapperRef}
        className="flex-1 overflow-auto bg-white"
      >
        <div
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            position: 'relative',
          }}
        >
          <ReactSketchCanvas
            ref={internalCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'none',
            }}
            width={`${size.width}`}
            height={`${size.height}`}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            eraserWidth={eraserWidth}
            onChange={handlePathsChange}
          />
          
          {showBoundingBox && boundingBox && (
            <div
              style={{
                position: 'absolute',
                left: `${boundingBox.x}px`,
                top: `${boundingBox.y}px`,
                width: `${boundingBox.width}px`,
                height: `${boundingBox.height}px`,
                border: '2px dashed #3b82f6',
                pointerEvents: 'none',
                zIndex: 10,
                transition: 'all 0.2s ease-out',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;