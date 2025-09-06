// // frontend/src/components/problem/FeedbackDisplay.tsx

// import React from 'react';
// import type { SubmissionResult } from '../../services/apiService'; // Import the type

// interface FeedbackDisplayProps {
//   result: SubmissionResult;
// }

// const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ result }) => {
//   return (
//     <div className="mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
//       <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Analysis Results</h3>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Left Column: Uploaded Image */}
//         <div>
//           <h4 className="font-semibold text-gray-700 mb-2">Your Submission</h4>
//           <img 
//             src={result.image_gcs_url} 
//             alt="User's handwritten solution" 
//             className="rounded-md border border-gray-300 w-full object-contain"
//           />
//         </div>

//         {/* Right Column: Translation and Error Analysis */}
//         <div className="space-y-6">
//           {/* Translated Handwriting Section */}
//           <div>
//             <h4 className="font-semibold text-gray-700">Translated Handwriting</h4>
//             <pre className="mt-1 p-3 bg-green-50 rounded-md text-sm text-green-900 whitespace-pre-wrap font-mono border border-green-200 h-40 overflow-y-auto">
//               {result.ai_feedback_data?.translated_handwriting || "(No translation available)"}
//             </pre>
//           </div>

//           {/* Error Analysis Section */}
//           <div>
//             <h4 className="font-semibold text-gray-700">Error Analysis</h4>
//             {result.ai_feedback_data?.errors && result.ai_feedback_data.errors.length > 0 ? (
//               <div className="mt-1 space-y-3 max-h-56 overflow-y-auto">
//                 {result.ai_feedback_data.errors.map((error, index) => (
//                   <div key={index} className="p-3 bg-red-50 rounded-md border border-red-200">
//                     <div className="text-sm text-red-900 font-medium mb-1">
//                       Error {index + 1}:
//                     </div>
//                     <div className="text-sm text-red-800 font-mono">
//                       "{error.error_text}"
//                     </div>
//                     <div className="text-xs text-red-600 mt-1">
//                       Location: [{error.box_2d.join(', ')}]
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="mt-1 p-3 bg-green-50 rounded-md text-sm text-green-900 border border-green-200">
//                 No errors detected! Great work!
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeedbackDisplay;