// pages/admin/trips.tsx
import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

type AdminTrip = {
  id: string;
  name: string;
  type: string;
  ownerId?: string;
  ownerEmail?: string;
  status: 'active' | 'archived';
  createdAt?: string;
};

function formatCreatedAt(value: unknown): string | undefined {
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString('bg-BG');
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString('bg-BG');
  }
  return undefined;
}

const AdminTripsPage: React.FC = () => {
  const [trips, setTrips] = React.useState<AdminTrip[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadTrips = async () => {
      try {
        // 1) Зареждаме всички потребители, за да покажем email на собственика
        const usersSnap = await getDocs(collection(firestore, 'users'));
        const usersMap = new Map<string, string>(); // uid -> email

        usersSnap.forEach((docSnap) => {
          const data = docSnap.data() as DocumentData;
          const email = typeof data.email === 'string' ? data.email : '—';
          usersMap.set(docSnap.id, email);
        });

        // 2) Зареждаме всички trips, сортирани по createdAt (ако го има)
        let tripsSnap;
        try {
          const q = query(
            collection(firestore, 'trips'),
            orderBy('createdAt', 'desc')
          );
          tripsSnap = await getDocs(q);
        } catch {
          tripsSnap = await getDocs(collection(firestore, 'trips'));
        }

        const tripsData: AdminTrip[] = tripsSnap.docs.map((docSnap) => {
          const data = docSnap.data() as DocumentData;

          const name = typeof data.name === 'string' ? data.name : '—';
          const type = typeof data.type === 'string' ? data.type : 'other';

          const archived = data.archived === true;

          const ownerId =
            typeof data.ownerId === 'string' ? data.ownerId : undefined;

          const ownerEmail = ownerId ? usersMap.get(ownerId) || '—' : '—';

          return {
            id: docSnap.id,
            name,
            type,
            ownerId,
            ownerEmail,
            status: archived ? 'archived' : 'active',
            createdAt: formatCreatedAt(data.createdAt),
          };
        });

        setTrips(tripsData);
      } catch (err) {
        console.error('Error loading trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-200">Trips</h1>
            <p className="mt-1 text-sm text-eco-text-muted">
              Управлявай всички пътувания в системата. Виж кой ги е създал и какъв е статусът им.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-700/40 bg-slate-900/70">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Име
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Тип
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Собственик
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Създадено на
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Действия
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
                    Зареждане на пътувания...
                  </td>
                </tr>
              )}

              {!loading && trips.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-400"
                  >
                    Няма намерени пътувания.
                  </td>
                </tr>
              )}

              {!loading &&
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-800/70">
                    <td className="px-4 py-3 text-slate-100">{trip.name}</td>
                    <td className="px-4 py-3 text-slate-300">{trip.type}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {trip.ownerEmail || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {trip.status === 'archived' ? 'Архивирано' : 'Активно'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {trip.createdAt || '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="rounded-lg bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700/80"
                        >
                          View
                        </Link>
                        {/* по-късно: Archive / Delete бутони */}
                      </div>
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

export default AdminTripsPage;
