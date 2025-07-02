// src/pages/LoginPage.tsx

import { useState } from 'react';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import visualization from '../assets/Hands Reaching for Object.jpg';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    setError('');
    setIsLoading(true);
    try {
      let userCredential: UserCredential;
      if (isLoginView) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      if (userCredential.user) {
        const idToken = await userCredential.user.getIdToken();
        console.log("Firebase ID Token:", idToken);
      }

      navigate('/problem');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="relative flex min-h-screen font-sans overflow-hidden bg-white">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img 
          src={visualization}
          alt="Collaborative workspace"  
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Background with enhanced dot pattern */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
          
          {/* Prominent dot pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
            opacity: 0.5,
          }}></div>
          
          {/* Top-left gradient accent */}
          <div className="absolute -top-64 -left-64 w-[800px] h-[800px] bg-gradient-to-br from-blue-200 via-blue-100 to-transparent rounded-full filter blur-[100px] opacity-80"></div>
          
          {/* Bottom-right gradient accent */}
          <div className="absolute -bottom-64 -right-64 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-200 via-indigo-100 to-transparent rounded-full filter blur-[100px] opacity-80"></div>
          
          {/* Top curved line */}
          <div className="absolute top-10 left-0 w-full overflow-hidden">
            <svg className="w-full h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path 
                d="M0,60 Q360,0 720,60 T1440,60" 
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="10,8"
                opacity="0.7"
              />
            </svg>
          </div>
          
          {/* Middle curved line */}
          <div className="absolute top-1/2 left-0 w-full overflow-hidden transform -translate-y-1/2">
            <svg className="w-full h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path 
                d="M0,60 Q360,120 720,60 T1440,60" 
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="15,10"
                opacity="0.5"
              />
            </svg>
          </div>
          
          {/* Bottom curved line */}
          <div className="absolute bottom-10 left-0 w-full overflow-hidden">
            <svg className="w-full h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path 
                d="M0,60 Q360,0 720,60 T1440,60" 
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="10,8"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-6 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LiveSolve</h1>
          <p className="mt-3 text-sm text-gray-600">
            {isLoginView ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-10 text-gray-800 bg-gray-100 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-center text-red-600">{error}</p>
        )}

        <div>
          <button
            onClick={handleAuthAction}
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:shadow-md disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </button>
        </div>

        <div className="text-sm text-center text-gray-600">
          <button onClick={toggleView} className="font-medium text-blue-600 hover:text-blue-500">
            {isLoginView ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}