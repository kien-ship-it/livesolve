// frontend/src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md"> {/* Updated Tailwind classes */}
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-slate-300"> {/* Updated Tailwind classes */}
          LiveSolve MVP
        </Link>
        <div>
          <Link
            to="/problem"
            className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" // Updated Tailwind classes
          >
            Problem
          </Link>
          <Link
            to="/login"
            className="ml-2 px-3 py-2 rounded hover:bg-slate-700 transition-colors" // Updated Tailwind classes
          >
            Login
          </Link>
          {/* Placeholder for Logout - will be conditional later */}
          {/* <button className="ml-2 px-3 py-2 rounded hover:bg-slate-700 transition-colors">
            Logout
          </button> */}
        </div>
      </nav>
    </header>
  );
};

export default Header;