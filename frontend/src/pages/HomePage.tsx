// frontend/src/pages/HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to LiveSolve!</h1>
      <p className="text-lg text-slate-700"> {/* Updated Tailwind classes */}
        Upload your handwritten solutions and get AI-powered feedback.
      </p>
    </div>
  );
};

export default HomePage;