import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="flex flex-col gap-2 px-2 mt-2">
      <button className="w-full px-4 py-2 rounded-md text-left font-medium text-neutral-800 hover:bg-neutral-200 transition">Home</button>
      <button className="w-full px-4 py-2 rounded-md text-left font-medium text-neutral-800 hover:bg-neutral-200 transition">Analytics</button>
    </nav>
  );
};

export default Navigation; 