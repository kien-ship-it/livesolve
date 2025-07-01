import React from 'react';
import DrawingToolbar from '../workspace/DrawingToolbar';
import DrawingCanvas from '../workspace/DrawingCanvas';
import Icon from '../ui/Icon';

const currentPath = 'Algebra  /  Linear Systems'; // This would be dynamic in a real app

const CenterColumn: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col min-w-0 h-full bg-white relative">
      {/* Top bar */}
      <div className="w-full h-14 flex items-center px-6 border-b border-neutral-200 bg-white shadow-sm z-10 justify-between">
        <span className="text-sm text-black-400 font-medium truncate max-w-xs">{currentPath}</span>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-neutral-100 transition" title="Star">
            <Icon iconName="Star" size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-neutral-100 transition" title="More options">
            <Icon iconName="MoreVertical" size={20} />
          </button>
        </div>
      </div>
      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-0">
        <DrawingCanvas />
      </div>
      <DrawingToolbar />
    </main>
  );
};

export default CenterColumn; 