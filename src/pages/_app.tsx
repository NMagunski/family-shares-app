import localFont from 'next/font/local';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import '@/styles/globals.css';

const inter = localFont({ src: '../styles/fonts/Inter.ttf', weight: '100 900', variable: '--font-inter', display: 'swap', fallback: ['Arial', 'sans-serif'] });
const serif = localFont({ src: '../styles/fonts/Lora.ttf', weight: '400 700', variable: '--font-serif', display: 'swap', fallback: ['Georgia', 'serif'] });

export default function MyApp({ Component, pageProps }: AppProps) {
  // 👉 Регистрация на Service Worker (PWA)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Service Worker registered:', reg);
          })
          .catch((err) => {
            console.error('Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return (
    <div className={`${inter.variable} ${serif.variable}`}>
    <AuthProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </AuthProvider>
    </div>
  );
}
