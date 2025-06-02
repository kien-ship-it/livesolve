// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [backendMessage, setBackendMessage] = useState<string>('Loading message from backend...');
  const [backendError, setBackendError] = useState<string | null>(null);
  const backendHelloUrl: string = 'https://livesolve-backend-mvp-899268025543.asia-southeast1.run.app/api/hello';

  useEffect(() => {
    const fetchBackendMessage = async () => {
      try {
        console.log("HomePage useEffect triggered. Attempting to fetch...");
        console.log('Fetching backend message from:', backendHelloUrl);
        const response = await fetch(backendHelloUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error: ${response.status} ${response.statusText}', errorText);
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Server response: ${errorText.substring(0,100)}...`);
        }
        const data = await response.json();
        setBackendMessage(data.message || 'No message received from backend');
        setBackendError(null);
      }
      catch (error) {
        console.error('Error fetching backend message:', error);
        if (error instanceof Error) {
          setBackendError(error.message);
        }
        else {
          setBackendError('An unknown error occurred');
          setBackendMessage('Error fetching backend message');
        }
      }
    };
    fetchBackendMessage();
  }, [backendHelloUrl]);

  return (
    <div className="container mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold mb-4 text-sky-700">Welcome to LiveSolve!</h1> {/* Added some color */}
    <p className="text-lg text-slate-700 mb-8"> {/* mb-8 for more space */}
      Upload your handwritten solutions and get AI-powered feedback.
    </p>

    {/* Section to display the backend connectivity test message */}
    <div className="mt-6 p-4 border border-sky-300 rounded-lg bg-sky-50 shadow"> {/* Enhanced styling */}
      <h2 className="text-xl font-semibold text-sky-600 mb-3">
        Backend Connectivity Status:
      </h2>
      {/* Display error message if backendError has a value */}
      {backendError && (
        <div className="mb-3 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{backendError}</p>
        </div>
      )}
      {/* Display backend message */}
      <div className="p-3 text-slate-800 bg-white rounded-md shadow-sm">
        <p>
          <strong className="font-medium">Message from Backend:</strong> {backendMessage}
        </p>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        <small>
          If you see a 'CORS error' or 'Failed to fetch' in the browser console or above,
          ensure your FastAPI backend has CORSMiddleware configured correctly,
          is deployed, and the URL <code>{backendHelloUrl}</code> is correct and accessible.
        </small>
      </p>
    </div>
  </div>
  );
};

export default HomePage;
