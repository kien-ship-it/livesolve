// frontend/src/App.tsx
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import WorkspacePage from './pages/WorkspacePage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        {/* Redirect all other routes to /workspace if logged in, else to /login */}
        <Route path="*" element={<Navigate to="/workspace" replace />} />
      </Routes>
    </Router>
  );
};

export default App;