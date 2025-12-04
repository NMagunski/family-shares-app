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
import {
  fetchExpenses,
  createExpense,
  updateExpense,            // 🆕 добавен импорт
} from '@/lib/expensesStore';
import { fetchTripById } from '@/lib/trips';
import { useAuth } from '@/context/AuthContext';

const TripPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  // 👉 Guard: ако не сме логнати, пращаме към /login с redirect
  React.useEffect(() => {
    if (!authLoading && !user) {
      const target = router.asPath || `/trips/${tripIdStr}`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, router, tripIdStr]);

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
  const [editingFamily, setEditingFamily] = React.useState<TripFamily | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Delete family modal
  const [deletingFamily, setDeletingFamily] = React.useState<TripFamily | null>(null);
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

  // 🆕 Редакция на разход
  async function handleUpdateExpense(
    expenseId: string,
    exp: {
      paidByFamilyId: string;
      involvedFamilyIds: string[];
      amount: number;
      currency: 'BGN' | 'EUR';
      comment?: string;
    }
  ) {
    try {
      await updateExpense(expenseId, exp);

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === expenseId
            ? {
                ...e,
                paidByFamilyId: exp.paidByFamilyId,
                involvedFamilyIds: exp.involvedFamilyIds,
                amount: exp.amount,
                currency: exp.currency,
                comment: exp.comment,
              }
            : e
        )
      );
    } catch (err) {
      console.error(err);
      alert('Грешка при редакция на разход.');
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
        prev.map((f) => (f.id === editingFamily.id ? { ...f, name: newName } : f))
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
  const familiesCount = families.length;
  const expensesCount = expenses.length;
  const tripStatus = trip?.archived ? 'Архивирано' : 'Активно';

  // Докато auth се зарежда или правим redirect → не показваме детайлите
  if (authLoading || !user) {
    return (
      <Layout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-eco-text-muted">Зареждане...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* HEADER НА ПЪТУВАНЕТО */}
        <TripHeader
          tripName={tripName}
          onAddFamily={() => setShowFamilyModal(true)}
          onOpenLists={() => router.push(`/trips/${tripIdStr}/lists`)}
          onOpenItinerary={() => router.push(`/trips/${tripIdStr}/itinerary`)}
          onShare={() => setShowShareModal(true)}
          onOpenSettings={() => router.push(`/trips/${tripIdStr}/settings`)}
        />

        {/* GRID LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* ЛЯВА КОЛОНА – основни секции */}
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Участници" icon="🧑‍🤝‍🧑">
              {familiesLoading ? (
                <p className="text-sm text-eco-text-muted">
                  Зареждане на семейства...
                </p>
              ) : (
                <FamiliesSection
                  families={families}
                  onEditFamily={handleEditFamily}
                  onDeleteFamily={handleAskDeleteFamily}
                />
              )}
            </SectionCard>

<SectionCard title="Разходи" icon="ö">
  {expensesLoading ? (
    <p className="text-sm text-eco-text-muted">
      Зареждане на разходи...
    </p>
  ) : (
    <ExpensesTable
      families={families}
      expenses={expenses}
      onAddExpense={handleAddExpense}
      onUpdateExpense={handleUpdateExpense}
    />
  )}
</SectionCard>


            <SectionCard title="Кой на кого колко дължи" icon="📊">
              <DebtsSummary families={families} expenses={expenses} />
            </SectionCard>
          </div>

          {/* ДЯСНА КОЛОНА – резюме и инфо */}
          <div className="space-y-6 lg:col-span-1">
            <SectionCard title="Резюме на пътуването" icon="📌">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                  <span className="text-eco-text-muted">Статус</span>
                  <span className="font-medium text-eco-text">{tripStatus}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                  <span className="text-eco-text-muted">Брой семейства</span>
                  <span className="font-medium text-eco-text">{familiesCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                  <span className="text-eco-text-muted">Брой разходи</span>
                  <span className="font-medium text-eco-text">{expensesCount}</span>
                </div>

                {shareUrl && (
                  <div className="space-y-1 rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                    <span className="text-xs font-medium text-eco-text-muted">
                      Линк за споделяне
                    </span>
                    <span className="break-all text-xs text-eco-text">
                      {shareUrl}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Съвет" icon="💡">
              <p className="text-sm leading-relaxed text-eco-text-muted">
                Добави всички участващи семейства и отбелязвай кой какво плаща.
                Накрая автоматично ще видиш кой на кого колко дължи.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* МОДАЛИ */}
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
