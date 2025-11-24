import React from 'react';
import Navbar from '@/components/layout/Navbar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#020a08] text-eco-text">
      {/* Глобален футуристичен фон */}
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_60%)]">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
