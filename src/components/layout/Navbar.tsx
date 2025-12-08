import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleToggleMobile = () => setIsMobileOpen((prev) => !prev);
  const handleCloseMobile = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setIsMobileOpen(false);
    }
  };

  const baseLink = 'text-sm font-medium transition-colors';
  const primaryButton =
    'inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold ' +
    'bg-eco-accent-strong text-eco-bg hover:bg-eco-accent focus:outline-none focus:ring-2 ' +
    'focus:ring-eco-accent/70 focus:ring-offset-2 focus:ring-offset-eco-surface';
  const ghostButton =
    'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium ' +
    'border border-eco-border text-eco-text hover:bg-eco-surface-soft focus:outline-none ' +
    'focus:ring-2 focus:ring-eco-accent/70 focus:ring-offset-2 focus:ring-offset-eco-surface';

  const renderAuthContent = (variant: 'desktop' | 'mobile') => {
    if (loading) return null;

    if (user) {
      return (
        <div
          className={
            variant === 'desktop'
              ? 'hidden md:flex items-center gap-3'
              : 'flex flex-col items-start gap-2 mt-3'
          }
        >
          <span className="text-xs md:text-sm text-eco-text-muted truncate max-w-[200px]">
            {user.email}
          </span>
          <button
            type="button"
            className={ghostButton}
            onClick={handleLogout}
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Изход
          </button>
        </div>
      );
    }

    // not logged in
    return (
      <div
        className={
          variant === 'desktop'
            ? 'hidden md:flex items-center gap-3'
            : 'flex flex-col items-start gap-2 mt-3'
        }
      >
        <Link
          href="/login"
          className={`${baseLink} text-eco-text-muted hover:text-eco-accent`}
          onClick={handleCloseMobile}
        >
          Вход
        </Link>

        <Link
          href="/register"
          className={primaryButton}
          onClick={handleCloseMobile}
        >
          Регистрация
        </Link>
      </div>
    );
  };

  return (
    <header
      className="
        sticky top-0 z-40
        border-b border-eco-border/60
        bg-eco-surface/70
        backdrop-blur-xl
        shadow-[0_20px_40px_rgb(0_0_0/0.45)]
        relative overflow-hidden
      "
    >
      {/* Футуристичен градиент фон */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          opacity-80
          bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.45),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.3),transparent_55%)]
        "
        aria-hidden="true"
      />

      {/* Основно съдържание */}
      <div className="relative max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Лого */}
        <Link
          href="/"
          className="flex items-center gap-2 text-eco-text hover:text-eco-accent transition-colors"
          onClick={handleCloseMobile}
        >
          <div className="flex items-center justify-center rounded-xl bg-eco-surface-soft/90 border border-eco-border/70 p-1.5 shadow-eco-soft">
            <Image
              src="/icons/tripsplitly-192.png"
              alt="TripSplitly logo"
              width={28}
              height={28}
            />
          </div>

          <span className="text-lg font-semibold tracking-tight">
            TripSplitly
          </span>
        </Link>

        {/* Auth desktop */}
        {renderAuthContent('desktop')}

        {/* Mobile toggler */}
        <button
          type="button"
          className="
            md:hidden inline-flex items-center justify-center
            p-2 rounded-lg border border-eco-border/70
            bg-eco-surface-soft/60
            hover:bg-eco-surface-soft
            focus:outline-none focus:ring-2 focus:ring-eco-accent/70
            focus:ring-offset-2 focus:ring-offset-eco-surface
          "
          onClick={handleToggleMobile}
          aria-label="Навигационно меню"
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5 text-eco-text" />
          ) : (
            <Menu className="h-5 w-5 text-eco-text" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`
          md:hidden border-t border-eco-border/60
          bg-eco-surface/80 backdrop-blur-xl
          transition-[max-height,opacity] duration-200 overflow-hidden
          ${isMobileOpen ? 'max-height-64 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="max-w-5xl mx-auto px-4 pb-4 pt-2">
          {renderAuthContent('mobile')}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
