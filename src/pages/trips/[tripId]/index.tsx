import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import TripHeader from '@/components/trips/TripHeader';
import FamiliesSection from '@/components/trips/FamiliesSection';
import ExpensesTable from '@/components/trips/ExpensesTable';
import DebtsSummary from '@/components/trips/DebtsSummary';
import AddFamilyModal from '@/components/trips/AddFamilyModal';
import ShareTripModal from '@/components/trips/ShareTripModal';
import type { TripFamily, TripExpense } from '@/types/trip';
import { fetchFamilies, createFamily } from '@/lib/families';
import { fetchExpenses, createExpense } from '@/lib/expensesStore';
import { useAuth } from '@/context/AuthContext';

const TripPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const { user } = useAuth();

  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  // URL за споделяне
  const [origin, setOrigin] = React.useState('');
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);
  const shareUrl = tripIdStr ? `${origin}/join/${tripIdStr}` : '';

  // Семейства
  const [families, setFamilies] = React.useState<TripFamily[]>([]);
  const [familiesLoading, setFamiliesLoading] = React.useState(false);
  const [showFamilyModal, setShowFamilyModal] = React.useState(false);

  // Разходи
  const [expenses, setExpenses] = React.useState<TripExpense[]>([]);
  const [expensesLoading, setExpensesLoading] = React.useState(false);

  // Share modal
  const [showShareModal, setShowShareModal] = React.useState(false);

  // Зареждане на семейства
  React.useEffect(() => {
    if (!tripIdStr) return;

    async function loadFamilies() {
      try {
        setFamiliesLoading(true);
        const data = await fetchFamilies(tripIdStr);
        setFamilies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setFamiliesLoading(false);
      }
    }

    loadFamilies();
  }, [tripIdStr]);

  // Зареждане на разходи
  React.useEffect(() => {
    if (!tripIdStr) return;

    async function loadExpenses() {
      try {
        setExpensesLoading(true);
        const data = await fetchExpenses(tripIdStr);
        setExpenses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setExpensesLoading(false);
      }
    }

    loadExpenses();
  }, [tripIdStr]);

  // Добавяне на разход
  async function handleAddExpense(exp: {
    paidByFamilyId: string;
    involvedFamilyIds: string[];
    amount: number;
    currency: 'BGN' | 'EUR';
    comment?: string;
  }) {
    if (!tripIdStr) return;

    try {
      const created = await createExpense(tripIdStr, exp);
      setExpenses((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Грешка при добавяне на разход');
    }
  }

  // Добавяне на семейство
  async function handleCreateFamily(name: string) {
    if (!tripIdStr || !user) return;

    try {
      const fam = await createFamily(tripIdStr, name, user.uid);
      setFamilies((prev) => [...prev, fam]);
      setShowFamilyModal(false);
    } catch (err) {
      console.error(err);
      alert('Грешка при добавяне на семейство');
    }
  }

  const tripName = tripIdStr ? `Пътуване ${tripIdStr}` : 'Пътуване';

  return (
    <Layout>
      <TripHeader
        name={tripName}
        onAddFamily={() => setShowFamilyModal(true)}
        onOpenLists={() => router.push(`/trips/${tripIdStr}/lists`)}
        onShare={() => setShowShareModal(true)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {familiesLoading ? (
          <p>Зареждане на семейства...</p>
        ) : (
          <FamiliesSection families={families} />
        )}

        {expensesLoading ? (
          <p>Зареждане на разходи...</p>
        ) : (
          <ExpensesTable
            families={families}
            expenses={expenses}
            onAddExpense={handleAddExpense}
          />
        )}

        <DebtsSummary families={families} expenses={expenses} />
      </div>

      <AddFamilyModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        onCreate={handleCreateFamily}
      />

      <ShareTripModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
      />
    </Layout>
  );
};

export default TripPage;
