// src/components/layout/Header.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function Header() {
  const { currentUser } = useAuth(); // Tune in to our auth station!

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Logout Error:", error));
  };

  return (
    <header className="flex items-center justify-between p-4 bg-blue-100">
      <Link to="/" className="text-xl font-bold text-blue-600">
        LiveSolve
      </Link>
      <nav>
        {currentUser ? (
          // If user exists, show their email and a logout button
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600"
            >
              Logout
            </button>
          </div>
        ) : (
          // If no user, show a link to the login page
          <Link
            to="/login"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
