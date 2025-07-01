import React from 'react';
import Icon from '../ui/Icon';

const utilities = [
  { icon: 'Settings', label: 'Settings' },
  { icon: 'Trash', label: 'Trash' },
];
const helpUtility = { icon: 'HelpCircle', label: 'Help' };

const UtilityBar: React.FC = () => {
  return (
    <div className="flex flex-row items-center gap-2 p-2 w-full">
      {utilities.map((util) => (
        <button
          key={util.icon}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 transition"
          title={util.label}
        >
          <Icon iconName={util.icon as any} size={15} />
        </button>
      ))}
      <div className="flex-1" />
      <button
        key={helpUtility.icon}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-200 transition ml-auto"
        title={helpUtility.label}
      >
        <Icon iconName={helpUtility.icon as any} size={15} />
      </button>
    </div>
  );
};

export default UtilityBar; 