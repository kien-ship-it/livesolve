import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';

const tabs = [
  { name: 'Feedback', icon: 'MessageSquare', label: 'Feedback' },
  { name: 'Hint', icon: 'Lightbulb', label: 'Hint' },
  { name: 'FullAnswer', icon: 'FileText', label: 'Full Answer' },
];

interface AIChatPanelProps {
  onClose: () => void;
}

const ANIMATION_DURATION = 200; // ms

const AIChatPanel: React.FC<AIChatPanelProps> = ({ onClose }) => {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeTab, setActiveTab] = useState('Feedback');
  const [input, setInput] = useState('');

  const handleRefresh = () => {
    // Add refresh logic here if needed
  };

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 w-[360px] h-[50vh] bg-white rounded-xl shadow-2xl border border-neutral-200 flex flex-col
        transition-opacity duration-100 ease-out
        ${show && !exiting ? 'opacity-100' : 'opacity-0'} scale-100
      `}
      style={{ minHeight: 320, maxHeight: 480, transformOrigin: 'bottom right' }}
    >
      {/* Top right controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          className="text-neutral-400 hover:text-black focus:outline-none"
          onClick={handleRefresh}
          aria-label="Refresh AI Session"
          type="button"
        >
          <Icon iconName="RefreshCcw" size={20} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:text-black hover:bg-neutral-200 focus:outline-none"
          onClick={handleClose}
          aria-label="Close AI Panel"
          type="button"
        >
          <Icon iconName="X" size={20} />
        </button>
      </div>
      {/* Welcome message */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-neutral-700">
        <div className="text-lg font-semibold mb-4">How can I help you today?</div>
        {/* Tabs below welcome message */}
        <div className="flex flex-row justify-center items-center gap-2 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition text-xs font-medium
                ${activeTab === tab.name ? 'bg-neutral-100 text-black' : 'text-neutral-500 hover:bg-neutral-50'}`}
              onClick={() => setActiveTab(tab.name)}
              type="button"
            >
              <Icon iconName={tab.icon as any} size={18} />
              <span className="mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Input area */}
      <form className="flex items-center gap-2 px-4 pb-4 pt-2" onSubmit={e => e.preventDefault()}>
        <input
          className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 bg-neutral-50"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 transition"
        >
          <Icon iconName="Send" size={18} />
        </button>
      </form>
    </div>
  );
};

export default AIChatPanel; 