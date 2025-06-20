// frontend/src/App.tsx
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProblemPage from './pages/ProblemPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900"> {/* Updated Tailwind classes for overall page background */}
        <Header />
        <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Updated Tailwind classes */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problem" element={
              <ProtectedRoute>
                <ProblemPage />
              </ProtectedRoute>
              } />
            <Route path="/login" element={<LoginPage />} />
            {/* You can add a 404 Not Found route later if you wish */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;