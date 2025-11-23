import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleToggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setIsMobileOpen(false);
    }
  };

  const authContent = loading
    ? null
    : user
    ? (
        <>
          <span className={styles.userEmail}>{user.email}</span>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Изход
          </button>
        </>
      )
    : (
        <>
          <Link href="/login" className={styles.authLink} onClick={handleCloseMobile}>
            Вход
          </Link>
          <Link
            href="/register"
            className={styles.authPrimaryLink}
            onClick={handleCloseMobile}
          >
            Регистрация
          </Link>
        </>
      );

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* ЛОГО / БРАНД */}
        <Link href="/" className={styles.brand} onClick={handleCloseMobile}>
          <Image
            src="/tripsplitly-logo.png"   // сложи файла в /public с това име
            alt="TripSplitly logo"
            width={32}
            height={32}
            className={styles.logoIcon}
          />
          <span className={styles.logoText}>TripSplitly</span>
        </Link>

        {/* ГЛАВНИ ЛИНКОВЕ – десктоп */}
        <nav className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Пътувания
          </Link>
        </nav>

        {/* АВТЕНТИКАЦИЯ – десктоп */}
        <div className={styles.authArea}>{authContent}</div>

        {/* БУРГЕР БУТОН – мобилен */}
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={handleToggleMobile}
          aria-label="Навигационно меню"
          aria-expanded={isMobileOpen}
        >
          <span className={styles.mobileToggleBar} />
          <span className={styles.mobileToggleBar} />
          <span className={styles.mobileToggleBar} />
        </button>
      </div>

      {/* МОБИЛНО МЕНЮ */}
      <div
        className={`${styles.mobileMenu} ${
          isMobileOpen ? styles.mobileMenuOpen : ''
        }`}
      >
        <nav className={styles.mobileNavSection}>
          <Link
            href="/"
            className={styles.mobileNavLink}
            onClick={handleCloseMobile}
          >
            Пътувания
          </Link>
        </nav>

        <div className={styles.mobileAuthSection}>{authContent}</div>
      </div>
    </header>
  );
};

export default Navbar;
