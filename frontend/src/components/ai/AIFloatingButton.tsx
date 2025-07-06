import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

interface AIFloatingButtonProps {
  onClick: () => void;
  show?: boolean;
}

const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ onClick, show = true }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [show]);

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 p-[2.5px] rounded-full bg-[conic-gradient(at_top_left,_#f871a0_0%,_#a21caf_14%,_#60a5fa_28%,_#34d399_42%,_#fde047_57%,_#fb923c_71%,_#ef4444_85%,_#f871a0_100%)]
        transition-opacity duration-200
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
    >
      <button
        className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        onClick={onClick}
        aria-label="Open AI Assistant"
        type="button"
      >
        <Icon iconName="MessageCircle" size={28} />
      </button>
    </div>
  );
};

export default AIFloatingButton; 