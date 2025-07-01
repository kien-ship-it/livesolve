import React from 'react';
import Icon from '../ui/Icon';

const UserProfile: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-3 cursor-pointer rounded-md hover:bg-neutral-100 transition">
      <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center font-bold text-base text-white">
        JD
      </div>
      <div className="font-medium text-sm text-neutral-900">Jane Doe</div>
      <Icon iconName="ChevronDown" size={16} className="text-neutral-400" />
    </div>
  );
};

export default UserProfile; 