import React from 'react';
import Navbar from './Navbar';
import styles from './Layout.module.css';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(14px)',
          background:
            'linear-gradient(to bottom, rgba(250, 248, 244, 0.95), rgba(250, 248, 244, 0.85))',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <Navbar />
      </div>
      <main className="main-shell">{children}</main>
    </>
  );
};


export default Layout;
