import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import TripHeader from '@/components/trips/TripHeader';
import FamiliesSection from '@/components/trips/FamiliesSection';
import ExpensesTable from '@/components/trips/ExpensesTable';
import DebtsSummary from '@/components/trips/DebtsSummary';
import AddFamilyModal from '@/components/trips/AddFamilyModal';
import ShareTripModal from '@/components/trips/ShareTripModal';
import SectionCard from '@/components/ui/SectionCard';
import EditFamilyModal from '@/components/trips/EditFamilyModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Trip, TripFamily, TripExpense } from '@/types/trip';
import {
  fetchFamilies,
  createFamily,
  updateFamilyName,
  deleteFamilyAndExpenses,
} from '@/lib/families';
import { fetchExpenses, createExpense } from '@/lib/expensesStore';
import { fetchTripById } from '@/lib/trips';
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

  // Данни за пътуването
  const [trip, setTrip] = React.useState<Trip | null>(null);

  // Семейства
  const [families, setFamilies] = React.useState<TripFamily[]>([]);
  const [familiesLoading, setFamiliesLoading] = React.useState(false);
  const [showFamilyModal, setShowFamilyModal] = React.useState(false);

  // Разходи
  const [expenses, setExpenses] = React.useState<TripExpense[]>([]);
  const [expensesLoading, setExpensesLoading] = React.useState(false);

  // Share modal
  const [showShareModal, setShowShareModal] = React.useState(false);

  // Edit family modal
  const [editingFamily, setEditingFamily] = React.useState<TripFamily | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Delete family modal
  const [deletingFamily, setDeletingFamily] = React.useState<TripFamily | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Зареждане на пътуване
  React.useEffect(() => {
    if (!tripIdStr) return;

    async function loadTrip() {
      try {
        const t = await fetchTripById(tripIdStr);
        setTrip(t);
      } catch (err) {
        console.error('Грешка при зареждане на пътуването:', err);
      }
    }

    loadTrip();
  }, [tripIdStr]);

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

  // Отваряне на модал за редакция
  function handleEditFamily(family: TripFamily) {
    setEditingFamily(family);
    setIsEditModalOpen(true);
  }

  async function handleSaveEditFamily(newName: string) {
    if (!editingFamily) return;

    try {
      await updateFamilyName(editingFamily.id, newName);
      setFamilies((prev) =>
        prev.map((f) =>
          f.id === editingFamily.id ? { ...f, name: newName } : f
        )
      );
      setIsEditModalOpen(false);
      setEditingFamily(null);
    } catch (err) {
      console.error(err);
      alert('Грешка при редакция на семейство');
    }
  }

  // Отваряне на модал за изтриване
  function handleAskDeleteFamily(family: TripFamily) {
    setDeletingFamily(family);
    setIsDeleteModalOpen(true);
  }

  // Потвърждение за изтриване
  async function handleConfirmDeleteFamily() {
    if (!deletingFamily || !tripIdStr) return;

    try {
      setDeleteLoading(true);
      await deleteFamilyAndExpenses(tripIdStr, deletingFamily.id);

      // махаме семейството от стейта
      setFamilies((prev) => prev.filter((f) => f.id !== deletingFamily.id));

      // махаме всички разходи, свързани с това семейство
      setExpenses((prev) =>
        prev.filter(
          (exp) =>
            exp.paidByFamilyId !== deletingFamily.id &&
            !exp.involvedFamilyIds.includes(deletingFamily.id)
        )
      );

      setIsDeleteModalOpen(false);
      setDeletingFamily(null);
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на семейство');
    } finally {
      setDeleteLoading(false);
    }
  }

  const tripName = trip?.name ?? 'Пътуване';

  return (
    <Layout>
      <TripHeader
        tripName={tripName}
        onAddFamily={() => setShowFamilyModal(true)}
        onOpenLists={() => router.push(`/trips/${tripIdStr}/lists`)}
        onShare={() => setShowShareModal(true)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* УЧАСТНИЦИ */}
        <SectionCard title="Участници" icon="🧑‍🤝‍🧑">
          {familiesLoading ? (
            <p>Зареждане на семейства...</p>
          ) : (
            <FamiliesSection
              families={families}
              onEditFamily={handleEditFamily}
              onDeleteFamily={handleAskDeleteFamily}
            />
          )}
        </SectionCard>

        {/* РАЗХОДИ */}
        <SectionCard title="Разходи" icon="💰">
          {expensesLoading ? (
            <p>Зареждане на разходи...</p>
          ) : (
            <ExpensesTable
              families={families}
              expenses={expenses}
              onAddExpense={handleAddExpense}
            />
          )}
        </SectionCard>

        {/* БАЛАНС */}
        <SectionCard title="Кой на кого колко дължи" icon="📊">
          <DebtsSummary families={families} expenses={expenses} />
        </SectionCard>
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

      <EditFamilyModal
        isOpen={isEditModalOpen}
        initialName={editingFamily?.name ?? ''}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFamily(null);
        }}
        onSave={handleSaveEditFamily}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Изтриване на семейство"
        description={
          deletingFamily
            ? `Семейство "${deletingFamily.name}" и всички разходи, в които участва, ще бъдат изтрити. Сигурен ли си?`
            : ''
        }
        confirmLabel={deleteLoading ? 'Изтриване...' : 'Изтрий'}
        cancelLabel="Отказ"
        onConfirm={handleConfirmDeleteFamily}
        onClose={() => {
          if (deleteLoading) return;
          setIsDeleteModalOpen(false);
          setDeletingFamily(null);
        }}
      />
    </Layout>
  );
};

export default TripPage;
