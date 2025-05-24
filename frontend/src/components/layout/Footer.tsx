// frontend/src/components/layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 p-4 text-center mt-auto"> {/* Updated Tailwind classes */}
      <p>© {new Date().getFullYear()} LiveSolve MVP. All rights reserved.</p>
    </footer>
  );
};

export default Footer;