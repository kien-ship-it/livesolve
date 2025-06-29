import React from 'react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmitAll: () => void;
  onSelectArea: () => void;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmitAll,
  onSelectArea,
}) => {
  if (!isOpen) {
    return null;
  }

  // Prevents closing the modal when clicking inside the content area
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // The Modal Overlay
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300"
    >
      {/* The Modal Content */}
      <div
        onClick={handleContentClick}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">How would you like to submit?</h2>
        <p className="text-center text-gray-600 mb-8">
          You can submit your entire drawing or select a specific area for a more focused analysis.
        </p>

        <div className="flex flex-col space-y-4">
          <button
            onClick={onSelectArea}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Select Area to Submit
          </button>
          <button
            onClick={onConfirmSubmitAll}
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Submit All Handwriting
          </button>
        </div>
        
        <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

// We need a simple CSS animation for the fade-in effect.
// I'll add a helper to inject this into the document head to avoid creating a new CSS file.
const InjectKeyframes = () => {
    React.useEffect(() => {
        const styleId = 'modal-keyframes';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes fade-in-scale {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);
    return null;
}

const ModalWithAnimation: React.FC<SubmissionModalProps> = (props) => (
    <>
        <InjectKeyframes />
        <SubmissionModal {...props} />
    </>
);


export default ModalWithAnimation;