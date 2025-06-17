// src/components/auth/ProtectedRoute.tsx

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// This component will accept other components as "children"
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // We "tune in" to our AuthContext radio station
  const { currentUser, loading } = useAuth();

  // === The Bouncer's Logic ===

  // 1. First, we wait for the initial "ID check" from Firebase to complete.
  //    While `loading` is true, we don't know the user's status yet.
  //    So we show a simple loading message.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  // 2. Once the check is done, if there is NO `currentUser`...
  //    ...the bouncer denies entry and sends them to the `/login` page.
  if (!currentUser) {
    // `Navigate` is a component from react-router-dom that declaratively
    // redirects the user. The `replace` prop is a nice touch: it
    // prevents the user from clicking the "back" button and ending
    // up on the protected page again.
    return <Navigate to="/login" replace />;
  }

  // 3. If the check is done AND there is a `currentUser`...
  //    ...the bouncer lets them in! We render the `children` components.
  //    In our case, this will be the `<ProblemPage />`.
  return <>{children}</>;
};

export default ProtectedRoute;
