// frontend/src/components/problem/FeedbackDisplay.tsx

import React from 'react';
import type { SubmissionResult } from '../../services/apiService'; // Import the type

interface FeedbackDisplayProps {
  result: SubmissionResult;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ result }) => {
  return (
    <div className="mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Analysis Results</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Uploaded Image */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Your Submission</h4>
          <img 
            src={result.image_gcs_url} 
            alt="User's handwritten solution" 
            className="rounded-md border border-gray-300 w-full object-contain"
          />
        </div>

        {/* Right Column: OCR and AI Feedback */}
        <div className="space-y-6">
          {/* OCR Text Section */}
          <div>
            <h4 className="font-semibold text-gray-700">Extracted Text (OCR)</h4>
            <pre className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-wrap font-mono border border-gray-200 h-40 overflow-y-auto">
              {result.ocr_text || "(No text detected)"}
            </pre>
          </div>

          {/* AI Feedback Section */}
          <div>
            <h4 className="font-semibold text-gray-700">AI Feedback</h4>
            <pre className="mt-1 p-3 bg-blue-50 rounded-md text-sm text-blue-900 whitespace-pre-wrap font-sans border border-blue-200 h-56 overflow-y-auto">
              {result.ai_feedback || "(No feedback generated)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;