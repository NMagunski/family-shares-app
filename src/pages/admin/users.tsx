import { useAuth } from '@/context/AuthContext';
// pages/admin/users.tsx
import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

type AdminUser = {
  id: string;
  email: string;
  displayName?: string;
  tripsCount?: number;
  lastLogin?: string;
  isAdmin?: boolean;
  createdAt?: string;
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (authLoading || !user?.isAdmin) return;
    const loadUsersAndTrips = async () => {
      try {
        // 1) Зареждаме всички потребители
        let userDocs;
        try {
          const q = query(
            collection(firestore, 'users'),
            orderBy('createdAt', 'desc')
          );
          userDocs = await getDocs(q);
        } catch {
          userDocs = await getDocs(collection(firestore, 'users'));
        }

        const usersData: AdminUser[] = userDocs.docs.map((docSnap) => {
          const data = docSnap.data() as DocumentData;

          const createdAt =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toLocaleDateString('bg-BG')
              : undefined;

          const lastLogin =
            data.lastLogin instanceof Timestamp
              ? data.lastLogin.toDate().toLocaleString('bg-BG')
              : undefined;

          return {
            id: docSnap.id,
            email: typeof data.email === 'string' ? data.email : '—',
            displayName:
              typeof data.displayName === 'string'
                ? data.displayName
                : undefined,
            tripsCount: 0, // ще се попълни по-долу
            isAdmin: data.isAdmin === true,
            createdAt,
            lastLogin,
          };
        });

        // 2) Зареждаме всички trips и броим по ownerId
        const tripsSnap = await getDocs(collection(firestore, 'trips'));

        const countsByUserId: Record<string, number> = {};

        tripsSnap.forEach((tripDoc) => {
          const tripData = tripDoc.data() as DocumentData;
          const ownerId =
            typeof tripData.ownerId === 'string'
              ? tripData.ownerId
              : undefined;

          if (!ownerId) return;

          countsByUserId[ownerId] =
            (countsByUserId[ownerId] ?? 0) + 1;
        });

        // 3) Мържваме tripsCount
        const merged = usersData.map((u) => ({
          ...u,
          tripsCount: countsByUserId[u.id] ?? 0,
        }));

        setUsers(merged);
      } catch (err) {
        console.error('Error loading users or trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsersAndTrips();
  }, [user, authLoading]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-200">Users</h1>
          <p className="mt-1 text-sm text-eco-text-muted">
            Списък с всички регистрирани потребители и броя пътувания, които са създали.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-700/40 bg-eco-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-eco-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-eco-text-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-eco-text-muted">
                  Име
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-eco-text-muted">
                  Брой пътувания
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-eco-text-muted">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-eco-text-muted">
                  Създаден
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-eco-text-muted">
                  Последно влизане
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-eco-text-muted"
                  >
                    Зареждане на потребители...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-eco-text-muted"
                  >
                    Няма намерени потребители.
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-eco-surface">
                    <td className="px-4 py-3 text-eco-text">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-eco-text">
                      {user.displayName || '—'}
                    </td>
                    <td className="px-4 py-3 text-eco-text">
                      {user.tripsCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-eco-text">
                      {user.isAdmin ? 'Да' : 'Не'}
                    </td>
                    <td className="px-4 py-3 text-eco-text">
                      {user.createdAt || '—'}
                    </td>
                    <td className="px-4 py-3 text-eco-text">
                      {user.lastLogin || '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminUsersPage;
