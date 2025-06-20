// frontend/src/pages/HomePage.tsx

import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [backendMessage, setBackendMessage] = useState<string>('Loading message from backend...');
  const [backendError, setBackendError] = useState<string | null>(null);

  // --- CHANGE 1: Define the base URL from environment variables ---
  // This makes the component reusable and configurable without changing code.
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // --- CHANGE 2: Ensure the base URL is defined before fetching ---
    if (!apiBaseUrl) {
      console.error("VITE_API_BASE_URL is not defined. Please check your .env.local file.");
      setBackendError("Frontend configuration error: API URL is missing.");
      setBackendMessage("Cannot connect to backend.");
      return; // Stop the effect if the URL is missing
    }
    
    // This is the URL for the backend's root/health-check endpoint
    const backendHealthCheckUrl = `${apiBaseUrl}/`; // Or just apiBaseUrl

    const fetchBackendMessage = async () => {
      try {
        console.log("HomePage useEffect triggered. Attempting to fetch...");
        // --- CHANGE 3: Use the new, correct URL ---
        console.log('Fetching backend message from:', backendHealthCheckUrl);
        const response = await fetch(backendHealthCheckUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Backend error: ${response.status} ${response.statusText}`, errorText);
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
        }
        // Set a user-friendly message when an error occurs
        setBackendMessage('Could not retrieve message from the server.');
      }
    };
    fetchBackendMessage();
  }, [apiBaseUrl]); // --- CHANGE 4: The dependency is now the base URL ---

  return (
    <div className="container mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold mb-4 text-sky-700">Welcome to LiveSolve!</h1>
    <p className="text-lg text-slate-700 mb-8">
      Upload your handwritten solutions and get AI-powered feedback.
    </p>

    <div className="mt-6 p-4 border border-sky-300 rounded-lg bg-sky-50 shadow">
      <h2 className="text-xl font-semibold text-sky-600 mb-3">
        Backend Connectivity Status:
      </h2>
      {backendError && (
        <div className="mb-3 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{backendError}</p>
        </div>
      )}
      <div className="p-3 text-slate-800 bg-white rounded-md shadow-sm">
        <p>
          <strong className="font-medium">Message from Backend:</strong> {backendMessage}
        </p>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        <small>
          {/* --- CHANGE 5: Updated help text to be more useful --- */}
          This message comes from the backend server. If it fails, check the browser console and ensure the backend service is running and the URL in <code>.env.local</code> is correct.
        </small>
      </p>
    </div>
  </div>
  );
};

export default HomePage;