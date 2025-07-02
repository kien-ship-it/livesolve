import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Bot, Scan, Crop, Loader2 } from 'lucide-react';

interface AIChatPanelProps {
  onClose: () => void;
  onCaptureAllWork: () => void;
  isSubmitting: boolean;
  submissionError: string | null;
}

const ANIMATION_DURATION = 200; // ms

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  onClose,
  onCaptureAllWork,
  isSubmitting,
  submissionError,
}) => {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeTab, setActiveTab] = useState('Feedback');

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  };

  if (!show) return null;

  const tabs = [
    { name: 'Chat', icon: <MessageSquare size={16} /> },
    { name: 'Feedback', icon: <Bot size={16} /> },
  ];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl flex flex-col transform transition-all duration-${ANIMATION_DURATION}`}
      style={{
        transform: `translateY(${exiting ? '100%' : '0'})`,
        opacity: exiting ? 0 : 1,
        transition: `transform ${ANIMATION_DURATION}ms ease-out, opacity ${ANIMATION_DURATION}ms ease-out`,
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-neutral-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1.5 transition-colors duration-200 ${
                activeTab === tab.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200">
          <X size={20} />
        </button>
      </header>

      {/* Content */}
      <div className="p-4 flex-grow overflow-y-auto">
        {activeTab === 'Chat' && (
          <div>
            <p>Chat functionality is not yet implemented.</p>
          </div>
        )}

        {activeTab === 'Feedback' && (
          <div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">AI Feedback</h2>
              <p className="text-sm text-gray-500">
                Select your work to get instant feedback.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={onCaptureAllWork}
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Scan size={20} />
                    <span>Select all work</span>
                  </>
                )}
              </button>
              <button
                onClick={() => console.log('Select area clicked')}
                disabled={isSubmitting}
                className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <Crop size={20} />
                <span>Select area</span>
              </button>
            </div>

            {submissionError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{submissionError}</p>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                How to get feedback
              </h3>
              <p className="text-sm text-gray-600">
                Use the buttons above to select the part of your work you want
                feedback on. The AI will analyze the selected area and provide
                suggestions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPanel; 