import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#020a08] text-eco-text">
      {/* Глобален футуристичен фон + layout */}
      <div
        className="
          min-h-screen
          flex flex-col
          bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_60%)]
        "
      >
        <Navbar />

        <main
          className="
            flex-1
            mx-auto 
            w-full 
            max-w-4xl 
            px-4 sm:px-5 
            py-6 md:py-8
          "
        >
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
