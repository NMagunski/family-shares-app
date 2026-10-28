import React from 'react';
import Link from 'next/link';
import { Compass, Wallet, MapPin, Users } from 'lucide-react';
export default function AuthWelcome({ mode }: { mode: 'login' | 'register' }) {
 const [playing, setPlaying] = React.useState(false);
 return <div className="auth-welcome"><div className="auth-art"><button type="button" className={playing ? 'auth-orbit playing' : 'auth-orbit'} onClick={() => setPlaying(true)} onAnimationEnd={() => setPlaying(false)} aria-label="Раздвижи компаса"><Compass size={52}/><span><Wallet/></span><span><MapPin/></span><span><Users/></span></button><h2>Повече спомени.<br/>По-малко сметки.</h2><p>Планирай с приятели. Разделяй спокойно.</p></div><nav className="auth-tabs" aria-label="Вход или регистрация"><span className={`auth-slider ${mode === 'register' ? 'register' : ''}`}/><Link href="/login" aria-current={mode === 'login' ? 'page' : undefined}>Вход</Link><Link href="/register" aria-current={mode === 'register' ? 'page' : undefined}>Регистрация</Link></nav></div>;
}
