import React from 'react';
import UserProfile from '../sidebar/UserProfile';
import Navigation from '../sidebar/Navigation';
import WorkspaceList from '../sidebar/WorkspaceList';
import UtilityBar from '../sidebar/UtilityBar';

const LeftSidebar: React.FC = () => {
  return (
    <aside className="w-60 h-full bg-grey border-r border-neutral-200 flex-shrink-0 flex flex-col justify-between">
      <div>
        <UserProfile />
        <WorkspaceList />
      </div>
      <UtilityBar />
    </aside>
  );
};

export default LeftSidebar; 