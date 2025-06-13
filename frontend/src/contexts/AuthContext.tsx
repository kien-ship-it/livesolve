// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import our auth instance

// Define the shape of the context's value
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// Create the "radio station" with a default empty value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the "broadcaster" component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the magic listener from Firebase.
    // It runs once on load, and then again anytime the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  // Broadcast the value to all children. Don't render children until we've
  // checked the auth state for the first time.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Create a custom hook for components to easily "tune in" to our station
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
