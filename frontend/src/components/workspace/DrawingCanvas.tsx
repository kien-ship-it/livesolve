import React from 'react';

const DrawingCanvas: React.FC = () => {
  return (
    <div
      className="flex-1 w-full h-full bg-white rounded-lg shadow border border-neutral-200 relative overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {/* Canvas content will go here */}
    </div>
  );
};

export default DrawingCanvas; 