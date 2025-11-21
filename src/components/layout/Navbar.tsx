import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const { user, loading, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Family Shares</Link>
      </div>
      <nav className={styles.links}>
        <Link href="/">Пътувания</Link>

        {loading ? null : user ? (
          <>
            <span className={styles.userEmail}>{user.email}</span>
            <button className={styles.logoutButton} onClick={logout}>
              Изход
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Вход</Link>
            <Link href="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
