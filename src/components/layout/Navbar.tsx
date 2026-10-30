import { TRIP_INVITATIONS_ENABLED } from '@/lib/features';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { Menu, X, LogOut, Compass, UserRound } from 'lucide-react';

const Navbar: React.FC = () => {
  const router = useRouter();
  const menuToggle = React.useRef<HTMLButtonElement>(null);
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

  React.useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsMobileOpen(false); menuToggle.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobileOpen]);

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

  const baseLink = 'min-h-[44px] inline-flex items-center text-sm font-medium transition-colors';
  const primaryButton =
    'inline-flex items-center justify-center min-h-[44px] rounded-full px-4 py-1.5 text-sm font-semibold ' +
    'bg-eco-accent-strong text-eco-bg hover:brightness-95 focus:outline-none focus:ring-2 ' +
    'focus:ring-eco-accent/70 focus:ring-offset-2 focus:ring-offset-eco-surface';
  const ghostButton =
    'inline-flex items-center justify-center min-h-[44px] rounded-full px-3 py-1.5 text-sm font-medium ' +
    'border border-eco-border text-eco-text hover:bg-eco-surface-soft focus:outline-none ' +
    'focus:ring-2 focus:ring-eco-accent/70 focus:ring-offset-2 focus:ring-offset-eco-surface';

  const renderAuthContent = (variant: 'desktop' | 'mobile') => {
    if (loading) return null;

    if (user) {
      const containerClass =
        variant === 'desktop'
          ? 'hidden lg:flex items-center gap-3'
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
            ? 'hidden lg:flex items-center gap-3'
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
    <header className="app-header">
      {/* Основно съдържание */}
      <div className="relative max-w-5xl mx-auto px-4 min-h-16 flex items-center justify-between gap-3">
        {/* Лого */}
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-2 text-eco-text hover:text-eco-accent transition-colors"
          onClick={handleCloseMobile}
        >
          <div className="flex items-center justify-center">
            <span className="brand-mark"><Compass aria-hidden="true" size={24} /></span>
          </div>

          <span className="brand-title">TripSplitly{(router.pathname === '/' || router.pathname.startsWith('/trips/')) && <span className="brand-context">{router.pathname === '/' ? 'Пътувания' : 'Разходи'}</span>}</span>
        </Link>

        {/* Auth desktop (вкл. Admin бутон) */}
        {renderAuthContent('desktop')}

        {/* Mobile toggler */}
        <div className="flex items-center gap-1 lg:hidden">
        {user && TRIP_INVITATIONS_ENABLED && <Link href="/profile" className="mobile-profile" aria-label={needsUsername ? 'Избери username' : 'Профил'}><UserRound size={20} aria-hidden="true" /></Link>}
        <button ref={menuToggle}
          type="button"
          className="
            lg:hidden inline-flex items-center justify-center
            min-h-[44px] min-w-[44px] p-2 rounded-full
            bg-eco-surface-soft/60
            hover:bg-eco-surface-soft
            focus:outline-none focus:ring-2 focus:ring-eco-accent/70
            focus:ring-offset-2 focus:ring-offset-eco-surface
          "
          onClick={handleToggleMobile}
          aria-label="Навигационно меню"
          aria-expanded={isMobileOpen}
          aria-controls="navigation-menu"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5 text-eco-text" />
          ) : (
            <Menu className="h-5 w-5 text-eco-text" />
          )}
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="navigation-menu"
        inert={!isMobileOpen}
        aria-hidden={!isMobileOpen}
        className={`
          lg:hidden border-t border-eco-border/60
          bg-eco-surface/80 backdrop-blur-xl
          transition-[max-height,opacity] duration-200 overflow-hidden
          ${isMobileOpen ? 'max-h-[70dvh] overflow-y-auto opacity-100' : 'max-h-0 opacity-0'}
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
