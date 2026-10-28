import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/trips', label: 'Trips' },
];

const AdminLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-eco-surface backdrop-blur">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-emerald-800/50 bg-eco-surface px-4 py-6 md:flex md:flex-col">
        <h2 className="mb-6 text-lg font-semibold text-eco-accent">
          Admin Panel
        </h2>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-eco-text hover:bg-eco-surface hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 text-xs text-eco-text-muted">
          TripSplitly · Admin
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
