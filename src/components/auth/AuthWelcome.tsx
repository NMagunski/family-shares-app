import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Compass, Wallet, Users } from 'lucide-react';
import { localRedirect } from '@/lib/redirect';

type Mode = 'login' | 'register' | 'recovery';
export default function AuthWelcome({ mode }: { mode: Mode }) {
  const [playing, setPlaying] = React.useState(false);
  const router = useRouter();
  const redirect = localRedirect(router.query.redirect, '');
  const suffix = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
  return <div className="auth-welcome">
    <div className="auth-art">
      <button type="button" className={`auth-orbit ${playing ? 'playing' : ''}`} onClick={() => setPlaying(true)} onAnimationEnd={() => setPlaying(false)} aria-label="Раздвижи компаса">
        <span className="auth-orbit-center"><Compass size={44} aria-hidden="true" /></span>
        <span className="auth-satellite people"><Users size={25} aria-hidden="true" /></span>
        <span className="auth-satellite wallet"><Wallet size={25} aria-hidden="true" /></span>
        <span className="auth-satellite compass"><Compass size={25} aria-hidden="true" /></span>
      </button>
      <h2>Повече спомени.<br/><span>По-малко сметки.</span></h2>
      <p>Планирай с приятели. Разделяй спокойно и прозрачно на път.</p>
    </div>
    {mode !== 'recovery' && <nav className="auth-tabs" aria-label="Вход или регистрация">
      <span className={`auth-slider ${mode === 'register' ? 'register' : ''}`} aria-hidden="true" />
      <Link href={`/login${suffix}`} aria-current={mode === 'login' ? 'page' : undefined}>Вход</Link>
      <Link href={`/register${suffix}`} aria-current={mode === 'register' ? 'page' : undefined}>Регистрация</Link>
    </nav>}
  </div>;
}
