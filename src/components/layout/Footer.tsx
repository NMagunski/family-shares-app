// src/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-eco-border/60 bg-black/30">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 text-xs text-eco-text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-eco-text">
            TripSplitly
          </span>
          <span>·</span>
          <span>© {currentYear}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/privacy"
            className="hover:text-emerald-300 transition-colors"
          >
            Политика за поверителност
          </Link>
          <span className="hidden sm:inline text-eco-text-muted">·</span>
          <Link
            href="/terms"
            className="hover:text-emerald-300 transition-colors"
          >
            Общи условия
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
