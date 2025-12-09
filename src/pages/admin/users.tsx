// pages/admin/users.tsx
import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
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

  React.useEffect(() => {
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
          const data = docSnap.data() as any;
          const createdAt =
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toLocaleDateString('bg-BG')
              : undefined;

          const lastLogin =
            data.lastLogin && data.lastLogin.toDate
              ? data.lastLogin.toDate().toLocaleString('bg-BG')
              : undefined;

          return {
            id: docSnap.id,
            email: data.email || '—',
            displayName: data.displayName,
            tripsCount: 0, // ще го попълним по-долу
            isAdmin: data.isAdmin === true,
            createdAt,
            lastLogin,
          };
        });

        // 2) Зареждаме всички trips и броим по ownerId
        const tripsSnap = await getDocs(collection(firestore, 'trips'));

        // ⚠️ Смени 'ownerId' ако при теб полето се казва по друг начин (например 'userId' или 'createdBy')
        const countsByUserId: Record<string, number> = {};

        tripsSnap.forEach((tripDoc) => {
          const tripData = tripDoc.data() as any;
          const ownerId = tripData.ownerId; // <-- тук е важното поле

          if (!ownerId) return;

          if (!countsByUserId[ownerId]) {
            countsByUserId[ownerId] = 0;
          }
          countsByUserId[ownerId] += 1;
        });

        // 3) Мържваме tripsCount в usersData
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
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-200">Users</h1>
          <p className="mt-1 text-sm text-eco-text-muted">
            Списък с всички регистрирани потребители и броя пътувания, които са създали.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-700/40 bg-slate-900/70">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Име
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Брой пътувания
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Създаден
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Последно влизане
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-400"
                  >
                    Зареждане на потребители...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-400"
                  >
                    Няма намерени потребители.
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/70">
                    <td className="px-4 py-3 text-slate-100">{user.email}</td>
                    <td className="px-4 py-3 text-slate-200">
                      {user.displayName || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {user.tripsCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {user.isAdmin ? 'Да' : 'Не'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.createdAt || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
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
