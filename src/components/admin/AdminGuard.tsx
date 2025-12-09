import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';

type Props = {
  children: React.ReactNode;
};

const AdminGuard: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <p className="text-slate-300">Зареждане...</p>
        </div>
      </Layout>
    );
  }

  const isAdmin = (user as any)?.isAdmin === true;

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-xl font-semibold text-red-400">
            Нямаш достъп до тази страница.
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Само администраторите могат да виждат Admin панела.
          </p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

export default AdminGuard;
