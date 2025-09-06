import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Bot, Scan, Crop, Loader2, Send } from 'lucide-react';

interface AIChatPanelProps {
  onClose: () => void;
  onCaptureAllWork: () => void;
  isSubmitting: boolean;
  submissionError: string | null;
  isTestingMode: boolean;
  onToggleTestingMode: () => void;
}

const ANIMATION_DURATION = 200; // ms

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  onClose,
  onCaptureAllWork,
  isSubmitting,
  submissionError,
  isTestingMode,
  onToggleTestingMode,
}) => {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeTab, setActiveTab] = useState('Feedback');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai'|'typing', content: string}[]>([]);

  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  // Helper to scroll textarea to bottom
  const scrollTextareaToBottom = () => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  // Prevent scroll events from bubbling to the canvas when chat can scroll
  const handleMessagesWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      (e.deltaY < 0 && el.scrollTop > 0) ||
      (e.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight)
    ) {
      e.stopPropagation();
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-96 max-w-[50vw] max-h-[50vh] bg-white rounded-lg shadow-2xl flex flex-col transform transition-all duration-${ANIMATION_DURATION}`}
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
        <div className="flex items-center space-x-2">
          {/* Testing Mode Toggle */}
          <button
            onClick={onToggleTestingMode}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
              isTestingMode
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}
            title={isTestingMode ? 'Testing Mode: No database storage' : 'Production Mode: Full database storage'}
          >
            {isTestingMode ? '🧪 Test' : '🚀 Live'}
          </button>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow flex flex-col min-h-0">
        {activeTab === 'Chat' && (
          <div className="flex flex-col flex-1 min-h-0">
            <div ref={messagesContainerRef} className="flex-1 flex flex-col min-h-0 custom-scrollbar-chat-panel p-4" onWheel={handleMessagesWheel}>
              {chatMessages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center flex-col">
                  <p className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none mb-3">
                    How can I help you?
                  </p>
                  <div className="flex flex-row gap-3 justify-center">
                    <div className="flex flex-col items-center border border-gray-200 bg-white rounded-lg px-3 py-2 min-w-[70px] cursor-pointer hover:bg-blue-50 transition">
                      <Bot className="text-blue-400 mb-1" size={18} />
                      <span className="text-xs font-normal text-gray-600">Feedback</span>
                    </div>
                    <div className="flex flex-col items-center border border-gray-200 bg-white rounded-lg px-3 py-2 min-w-[70px] cursor-pointer hover:bg-purple-50 transition">
                      <Scan className="text-purple-400 mb-1" size={18} />
                      <span className="text-xs font-normal text-gray-600">Hint</span>
                    </div>
                    <div className="flex flex-col items-center border border-gray-200 bg-white rounded-lg px-3 py-2 min-w-[70px] cursor-pointer hover:bg-pink-50 transition">
                      <MessageSquare className="text-pink-400 mb-1" size={18} />
                      <span className="text-xs font-normal text-gray-600">Full Answer</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  {chatMessages.map((msg, idx) => {
                    if (msg.role === 'typing') {
                      return (
                        <div key={idx} className="flex justify-start">
                          <div className="px-4 py-2 rounded-2xl max-w-[70%] text-sm bg-gray-200 text-gray-800 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`inline-block align-top px-4 py-2 rounded-2xl text-sm whitespace-pre-line break-words ${msg.role === 'user' ? 'bg-blue-500 text-white text-right' : 'bg-gray-200 text-gray-800 text-left'}`}
                          style={{ maxWidth: '20rem', wordBreak: 'break-word' }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <form
              className="flex items-start space-x-2 pt-4 pb-4 px-4 border-t border-gray-200"
              onSubmit={e => {
                e.preventDefault();
                if (chatInput.trim()) {
                  setChatMessages(prev => [
                    ...prev,
                    { role: 'user', content: chatInput },
                    { role: 'typing', content: '' }
                  ]);
                  setChatInput('');

                  setTimeout(() => {
                    setChatMessages(prev => {
                      // Remove the last typing message and add the AI reply
                      const lastTypingIdx = prev.findIndex(m => m.role === 'typing');
                      const newMsgs = lastTypingIdx !== -1 ? prev.slice(0, lastTypingIdx) : prev;
                      return [
                        ...newMsgs,
                        { role: 'ai', content: 'Sorry, this feature is not implemented yet! 😩' }
                      ];
                    });

                  }, 1200);
                }
              }}
            >
              <textarea
                ref={textareaRef}
                className="flex-1 resize-none rounded-md border border-neutral-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 overflow-y-auto custom-scrollbar box-border"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => {
                  setChatInput(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    const maxHeight = 3 * 24 + 16; // 3 lines * line-height (24px) + padding (8px top + 8px bottom)
                    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
                    // Always scroll to bottom if scrollable
                    setTimeout(scrollTextareaToBottom, 0);
                  }
                }}
                disabled={isSubmitting}
                rows={1}
                style={{ maxHeight: '6.75rem', boxSizing: 'border-box' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (chatInput.trim()) {
                      // Manually trigger submit
                      e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }
                }}
              />
              <button
                type="submit"
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white p-2 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={!chatInput.trim() || isSubmitting}
                aria-label="Send"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'Feedback' && (
          <div className="overflow-y-auto custom-scrollbar-chat-panel h-full p-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">AI Feedback</h2>
              <p className="text-sm text-gray-500">
                Select your work to get instant feedback.
              </p>
              {/* Testing Mode Indicator */}
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                isTestingMode
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}>
                {isTestingMode ? '🧪 Testing Mode (No Database)' : '🚀 Production Mode (Full Storage)'}
              </div>
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