import React, { useState } from 'react';
import Icon from '../ui/Icon';

const tools = [
  { name: 'pen', icon: 'Pen', label: 'Pen', group: 'main' },
  { name: 'eraser', icon: 'Eraser', label: 'Eraser', group: 'main' },
  { name: 'undo', icon: 'Undo2', label: 'Undo', group: 'action' },
  { name: 'clear', icon: 'X', label: 'Clear', group: 'action' },
];

const DrawingToolbar: React.FC = () => {
  const [activeTool, setActiveTool] = useState('pen');
  const [pressed, setPressed] = useState<{ [key: string]: boolean }>({});

  const handleActionClick = (toolName: string) => {
    setPressed((prev) => ({ ...prev, [toolName]: true }));
    setTimeout(() => {
      setPressed((prev) => ({ ...prev, [toolName]: false }));
    }, 180);
    // You can add your undo/clear logic here
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-30">
      <div className="flex flex-row gap-2 bg-white rounded-lg shadow-lg p-2 border border-neutral-200">
        {tools.map((tool, idx) => (
          <React.Fragment key={tool.name}>
            {idx === 2 && (
              <div className="mx-1 w-px h-6 bg-neutral-200 self-center" />
            )}
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full transition border-2 text-neutral-700
                ${tool.group === 'main' && activeTool === tool.name ? 'bg-neutral-100 border-white-300 shadow-md' : ''}
                ${tool.group === 'main' && activeTool !== tool.name ? 'bg-white border-transparent hover:bg-neutral-50' : ''}
                ${tool.group === 'action' && tool.name === 'undo' && pressed[tool.name] ? 'bg-blue-200 border-transparent' : ''}
                ${tool.group === 'action' && tool.name === 'clear' && pressed[tool.name] ? 'bg-red-200 border-transparent' : ''}
                ${tool.group === 'action' && !pressed[tool.name] ? 'bg-white border-transparent hover:bg-neutral-50' : ''}
              `}
              title={tool.label}
              onClick={() => {
                if (tool.group === 'main') setActiveTool(tool.name);
                if (tool.group === 'action') handleActionClick(tool.name);
              }}
              type="button"
            >
              <Icon iconName={tool.icon as any} size={16} />
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DrawingToolbar; 