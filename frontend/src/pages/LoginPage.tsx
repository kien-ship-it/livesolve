// frontend/src/pages/LoginPage.tsx
import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg"> {/* Updated Tailwind classes */}
        <p className="text-slate-800 text-center"> {/* Updated Tailwind classes */}
          Firebase Authentication Login/Signup form will go here.
        </p>
        {/* Basic form structure placeholder */}
        <form className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700"> {/* Updated Tailwind classes */}
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Updated Tailwind classes
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700"> {/* Updated Tailwind classes */}
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Updated Tailwind classes
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" // Updated Tailwind classes
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;