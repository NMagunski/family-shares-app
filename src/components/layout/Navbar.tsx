import { TRIP_INVITATIONS_ENABLED } from '@/lib/features';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut, Compass } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [needsUsername, setNeedsUsername] = React.useState(false);
  React.useEffect(() => {
    if (!user || !TRIP_INVITATIONS_ENABLED) return;
    return onSnapshot(doc(db, 'publicProfiles', user.uid), snap => setNeedsUsername(!snap.exists()), () => setNeedsUsername(true));
  }, [user]);
  const [pending, setPending] = React.useState(0);
  React.useEffect(() => {
    if (!user || !TRIP_INVITATIONS_ENABLED) return;
    return onSnapshot(query(collection(db, 'tripInvitations'), where('targetId', '==', user.uid)), snap => setPending(snap.docs.filter(d => d.data().status === 'pending' && d.data().expiresAt > Date.now()).length), () => setPending(0));
  }, [user]);
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

  const isAdmin = user?.isAdmin === true;

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
      const containerClass =
        variant === 'desktop'
          ? 'hidden md:flex items-center gap-3'
          : 'flex flex-col items-start gap-2 mt-3';

      return (
        <div className={containerClass}>
          <span className="text-xs md:text-sm text-eco-text-muted truncate max-w-[200px]">
            {user.email}
          </span>

          {TRIP_INVITATIONS_ENABLED && <Link href="/invitations" className={ghostButton} onClick={handleCloseMobile}>Покани ({pending})</Link>}
          {TRIP_INVITATIONS_ENABLED && <Link href="/profile" className={ghostButton} onClick={handleCloseMobile}>{needsUsername ? 'Избери username' : 'Профил'}</Link>}
          {/* 🔥 Admin бутон – вижда се само ако user е admin */}
          {isAdmin && (
            <Link
              href="/admin"
              className={
                variant === 'desktop'
                  ? ghostButton
                  : `${ghostButton} w-full justify-start`
              }
              onClick={handleCloseMobile}
            >
              Admin
            </Link>
          )}

          <button
            type="button"
            className={
              variant === 'desktop'
                ? ghostButton
                : `${ghostButton} w-full justify-start`
            }
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
        shadow-sm
        relative overflow-hidden
      "
    >
      {/* Основно съдържание */}
      <div className="relative max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Лого */}
        <Link
          href="/"
          className="flex items-center gap-2 text-eco-text hover:text-eco-accent transition-colors"
          onClick={handleCloseMobile}
        >
          <div className="flex items-center justify-center rounded-xl bg-eco-surface-soft/90 border border-eco-border/70 p-1.5 shadow-eco-soft">
            <span className="brand-mark"><Compass aria-hidden="true" size={24} /></span>
          </div>

          <span className="text-lg font-semibold tracking-tight">
            TripSplitly
          </span>
        </Link>

        {/* Auth desktop (вкл. Admin бутон) */}
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
        inert={!isMobileOpen}
        aria-hidden={!isMobileOpen}
        className={`
          md:hidden border-t border-eco-border/60
          bg-eco-surface/80 backdrop-blur-xl
          transition-[max-height,opacity] duration-200 overflow-hidden
          ${isMobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
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
