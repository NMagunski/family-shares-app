// pages/admin/index.tsx
import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboardPage: React.FC = () => {
  const [usersCount, setUsersCount] = React.useState<number>(0);
  const [tripsCount, setTripsCount] = React.useState<number>(0);
  const [activeTripsCount, setActiveTripsCount] = React.useState<number>(0);
  const [archivedTripsCount, setArchivedTripsCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);

  type TripDoc = {
  archived?: boolean;
};

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        // 🔹 Брой потребители
        const usersSnap = await getDocs(collection(firestore, 'users'));
        setUsersCount(usersSnap.size);

        // 🔹 Пътувания + статуси
        const tripsSnap = await getDocs(collection(firestore, 'trips'));

        let total = 0;
        let active = 0;
        let archived = 0;

        tripsSnap.forEach((docSnap) => {
          total += 1;
          const data = docSnap.data() as TripDoc;
          const isArchived = data.archived === true;

          if (isArchived) archived += 1;
          else active += 1;
        });

        setTripsCount(total);
        setActiveTripsCount(active);
        setArchivedTripsCount(archived);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-emerald-200">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-eco-text-muted">
            Обобщена информация за потребители и пътувания.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Зареждане на статистики...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="ОБЩО ПОТРЕБИТЕЛИ"
              value={usersCount}
              sublabel="Регистрирани в системата"
            />
            <StatCard
              label="ОБЩО ПЪТУВАНИЯ"
              value={tripsCount}
              sublabel="Създадени от всички потребители"
            />
            <StatCard
              label="АКТИВНИ ПЪТУВАНИЯ"
              value={activeTripsCount}
              sublabel="Текущи / неархивирани"
            />
            <StatCard
              label="АРХИВИРАНИ ПЪТУВАНИЯ"
              value={archivedTripsCount}
              sublabel="Завършени / архивирани"
            />
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboardPage;
