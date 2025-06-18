// frontend/src/pages/ProblemPage.tsx
import React, { useState } from 'react';
import type { ChangeEvent } from 'react';

const ProblemPage: React.FC = () => {
  // State to hold the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Hardcoded problem details for the MVP
  const problem = {
    id: 'problem_1_algebra',
    title: 'Algebra Challenge: Solve for x',
    statement: 'Find the value of x in the following equation:',
    equation: '2x + 5 = 11',
  };

  // Handler for when a file is selected
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  // Placeholder handler for the submission
  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    // In a future step, this will send the file to the backend.
    // For now, we just log it to the console.
    console.log("Submitting file:", selectedFile.name);
    alert(`(Pretend) Submitting: ${selectedFile.name}`);
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl px-6 pb-12"> {/* Added pb-12 for spacing */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          
          {/* Problem Statement Section */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
          <p className="text-gray-600 mb-6">{problem.statement}</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-8">
            <p className="text-2xl font-mono text-center text-blue-900">
              {problem.equation}
            </p>
          </div>
          
          <hr className="my-8" />

          {/* --- Image Upload UI Section --- */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Your Solution</h2>
            
            <div className="flex flex-col items-center space-y-4">
              {/* Custom-styled File Input Button */}
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
                <span>Select an image</span>
                <input 
                  type="file" 
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
              </label>

              {/* Display selected file name */}
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected file: <span className="font-medium text-gray-800">{selectedFile.name}</span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                onClick={handleSubmit}
                disabled={!selectedFile}
                className="w-full max-w-xs bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit for Feedback
              </button>
            </div>
          </div>
          {/* --- End of Image Upload UI Section --- */}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;