// frontend/src/pages/ProblemPage.tsx
import React from 'react';

const ProblemPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Problem View</h1>
      <div className="bg-white p-6 rounded-lg shadow"> {/* Updated Tailwind classes */}
        <p className="text-slate-700"> {/* Updated Tailwind classes */}
          This is where the (currently hardcoded) problem statement will be displayed.
        </p>
        <p className="mt-4 text-slate-700"> {/* Updated Tailwind classes */}
          (Image upload UI will go here in a later phase)
        </p>
      </div>
    </div>
  );
};

export default ProblemPage;