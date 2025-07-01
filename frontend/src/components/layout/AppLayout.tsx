import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import CenterColumn from './CenterColumn';
import AIFloatingButton from '../ai/AIFloatingButton';
import AIChatPanel from '../ai/AIChatPanel';

const AppLayout: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F7F7] relative">
      <LeftSidebar />
      <div className="flex-1 flex min-w-0 transition-all duration-300">
        <CenterColumn />
      </div>
      <AIFloatingButton onClick={() => setAiOpen(true)} show={!aiOpen} />
      {aiOpen && <AIChatPanel onClose={() => setAiOpen(false)} />}
    </div>
  );
};

export default AppLayout; 