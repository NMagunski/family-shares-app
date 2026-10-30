import React from 'react';
import Navbar from '@/components/layout/Navbar';
import MobileNavigation from '@/components/layout/MobileNavigation';
import Footer from '@/components/layout/Footer';

type LayoutProps = {
  children: React.ReactNode;
  onNewTrip?: () => void;
};

const Layout: React.FC<LayoutProps> = ({ children, onNewTrip }) => {
  return (
    <div className="app-shell min-h-screen bg-eco-bg text-eco-text">
      {/* Глобален футуристичен фон + layout */}
      <div
        className="
          min-h-screen
          flex flex-col
          bg-eco-bg
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
        <MobileNavigation onNewTrip={onNewTrip} />
      </div>
    </div>
  );
};

export default Layout;
