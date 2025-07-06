import React from 'react';
import UserProfile from '../sidebar/UserProfile';
import WorkspaceList from '../sidebar/WorkspaceList';
import UtilityBar from '../sidebar/UtilityBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <aside className={`h-full bg-gray-50 border-r border-neutral-200 flex flex-col justify-between transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className={isCollapsed ? 'hidden' : 'block'}>
        <UserProfile />
        <WorkspaceList />
      </div>
      <div className={isCollapsed ? 'hidden' : 'block'}>
        <UtilityBar />
      </div>
      <button onClick={onToggle} className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border-2 border-gray-200 rounded-full p-1 z-30">
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default LeftSidebar;