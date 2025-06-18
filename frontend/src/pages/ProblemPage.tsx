// frontend/src/pages/ProblemPage.tsx
import React from 'react';

const ProblemPage: React.FC = () => {
  //hardcoded problem statement
  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Problem',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl px-6">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          
          {/* Problem Statement Section */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
          <p className="text-gray-600 mb-6">{problem.statement}</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-8">
            <p className="text-2xl font-mono text-center text-blue-900">
              {problem.equation}
            </p>
          </div>

          {/* Placeholder for the next step */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700">Your Solution</h2>
            <p className="text-sm text-gray-500 mt-2">
              (The file upload component will be added here in the next step.)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;