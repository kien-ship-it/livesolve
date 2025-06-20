// src/pages/LoginPage.tsx

import { useState } from 'react';
import type { FormEvent } from 'react';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuthAction = async (isSigningUp: boolean) => {
    setError('');
    try {
      let userCredential: UserCredential; // Define a variable to hold the result

      if (isSigningUp) {
        // Store the result of the auth action
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Store the result of the auth action
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      // --- START OF NEW CODE FOR TESTING ---
      if (userCredential.user) {
        // Ask Firebase for the ID token of the currently signed-in user
        const idToken = await userCredential.user.getIdToken();

        console.log("--- Firebase ID Token (for API testing) ---");
        console.log(idToken);
        console.log("-------------------------------------------");
        
        // You can now copy this token from the console and use it in the
        // FastAPI /docs page with the "Bearer " prefix.
      }
      // --- END OF NEW CODE FOR TESTING ---

      navigate('/problem');
    } catch (err: any) {
      setError(err.message);
      console.error("Authentication Error: ", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Welcome to LiveSolve
        </h2>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="mt-4 text-sm text-center text-red-500">{error}</p>}
        <div className="flex justify-between mt-6 space-x-4">
          <button
            onClick={() => handleAuthAction(false)}
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => handleAuthAction(true)}
            className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}