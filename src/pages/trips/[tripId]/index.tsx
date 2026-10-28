import { db } from '@/lib/firebase';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import TripHeader from '@/components/trips/TripHeader';
import FamiliesSection from '@/components/trips/FamiliesSection';
import DebtsSummary from '@/components/trips/DebtsSummary';
import AddFamilyModal from '@/components/trips/AddFamilyModal';
import ShareTripModal from '@/components/trips/ShareTripModal';
import SectionCard from '@/components/ui/SectionCard';
import EditFamilyModal from '@/components/trips/EditFamilyModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
//import Button from '@/components/ui/Button';

import type { Trip, TripFamily, TripExpense } from '@/types/trip';
import ExpensesTable from '@/components/trips/ExpensesTable';
import type { BaseExpenseInput } from '@/components/trips/AddExpenseForm';

import {
  createFamily,
  updateFamilyName,
  deleteFamilyAndExpenses,
} from '@/lib/families';
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/lib/expensesStore';
import { useAuth } from '@/context/AuthContext';
import { Users, Scale, Receipt, Info, Lightbulb } from 'lucide-react';
import type { CurrencyCode } from '@/lib/currencies';
import { convertToEur, getCurrencySymbol } from '@/lib/currencies';

const TripPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  // Guard за неавторизирани
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

  // Пътуване
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
  const [deletingFamily, setDeletingFamily] =
    React.useState<TripFamily | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const [loadError, setLoadError] = React.useState('');
  React.useEffect(() => {
    if (!tripIdStr || authLoading || !user) return;
    setTrip(null); setFamilies([]); setExpenses([]); setLoadError('');
    setFamiliesLoading(true); setExpensesLoading(true);
    const failed = () => { setLoadError('Данните не могат да се заредят. Провери достъпа си и презареди.'); setFamiliesLoading(false); setExpensesLoading(false); };
    const unsubscribeTrip = onSnapshot(doc(db, 'trips', tripIdStr), snap => setTrip(snap.exists() ? { ...snap.data(), id: snap.id } as Trip : null), failed);
    const unsubscribeFamilies = onSnapshot(query(collection(db, 'families'), where('tripId', '==', tripIdStr)), snap => {
      setFamilies(snap.docs.map(d => ({...d.data(),id:d.id} as TripFamily)).sort((a,b) => a.name.localeCompare(b.name)));
      setFamiliesLoading(false);
    }, failed);
    const unsubscribeExpenses = onSnapshot(query(collection(db, 'expenses'), where('tripId', '==', tripIdStr)), snap => {
      setExpenses(snap.docs.map(d => ({...d.data(),id:d.id} as TripExpense)).sort((a,b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')));
      setExpensesLoading(false);
    }, failed);
    return () => { unsubscribeTrip(); unsubscribeFamilies(); unsubscribeExpenses(); };
  }, [tripIdStr, authLoading, user]);

  // Добавяне на разход
  async function handleAddExpense(exp: BaseExpenseInput) {
    if (!tripIdStr) return;

    try {
      const created = await createExpense(tripIdStr, exp);
      setExpenses((prev) => [created, ...prev.filter(e => e.id !== created.id)]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Редакция на разход
  async function handleUpdateExpense(expenseId: string, exp: BaseExpenseInput) {
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
                type: exp.type,
                settlementFromFamilyId: exp.settlementFromFamilyId,
                settlementToFamilyId: exp.settlementToFamilyId,
              }
            : e
        )
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Изтриване на разход
  async function handleDeleteExpense(expenseId: string) {
    try {
      await deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на разход.');
    }
  }

  // Добавяне на семейство
  async function handleCreateFamily(name: string) {
    if (!tripIdStr || !user) return;

    try {
      const fam = await createFamily(tripIdStr, name, user.uid);
      setFamilies((prev) => [...prev.filter(f => f.id !== fam.id), fam]);
      setShowFamilyModal(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Редакция на семейство
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

  // Изтриване на семейство
  function handleAskDeleteFamily(family: TripFamily) {
    setDeletingFamily(family);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmDeleteFamily() {
    if (!deletingFamily || !tripIdStr) return;

    try {
      setDeleteLoading(true);
      await deleteFamilyAndExpenses(tripIdStr, deletingFamily.id);

      setFamilies((prev) => prev.filter((f) => f.id !== deletingFamily.id));
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

  // 🔁 Централизирано: валутата на пътуването
  const tripCurrency: CurrencyCode =
    (trip?.currency as CurrencyCode) || 'EUR';

  // 🔢 Данни за резюмето – реално похарчено след разделянето
  const [showSummaryInEur, setShowSummaryInEur] = React.useState(false);
  const canToggleToEur = tripCurrency === 'BGN';

  // само разходи в валутата на пътуването и които са "expense", не "settlement"
  const expensesInTripCurrency = React.useMemo(
    () =>
      expenses.filter(
        (e) =>
          e.currency === tripCurrency &&
          (e.type ?? 'expense') !== 'settlement'
      ),
    [expenses, tripCurrency]
  );

  const perFamilyShare: Record<string, number> = React.useMemo(() => {
    const result: Record<string, number> = {};

    families.forEach((f) => {
      result[f.id] = 0;
    });

    for (const e of expensesInTripCurrency) {
      const participants = [...new Set(e.involvedFamilyIds?.length ? e.involvedFamilyIds : families.map(f => f.id))].sort();

      if (participants.length === 0) continue;

      const cents = Math.round(e.amount * 100);
      const share = Math.floor(cents / participants.length);
      for (const [index, fid] of participants.entries()) {
        if (result[fid] == null) result[fid] = 0;
        result[fid] += (share + (index < cents % participants.length ? 1 : 0)) / 100;
      }
    }

    return result;
  }, [families, expensesInTripCurrency]);

  function formatSummaryAmount(amount: number): string {
    if (showSummaryInEur && tripCurrency !== 'EUR') {
      const eur = convertToEur(amount, tripCurrency);
      return eur.toFixed(2);
    }
    return amount.toFixed(2);
  }

  const summaryCurrencyLabel =
    showSummaryInEur || tripCurrency === 'EUR'
      ? '€'
      : getCurrencySymbol(tripCurrency);

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
        {loadError && <p role="alert">{loadError}</p>}
        {/* HEADER */}
        <TripHeader
          tripName={tripName}
          isOwner={trip?.ownerId === user.uid}
          onAddExpense={() => {
            const entry = document.getElementById('expense-entry') as HTMLDetailsElement | null;
            if (entry) { entry.open = true; entry.scrollIntoView({ block: 'start' }); entry.querySelector('select')?.focus(); }
          }}
          familiesCount={families.length}
          total={`${(expensesInTripCurrency.reduce((sum, e) => sum + Math.round(e.amount * 100), 0) / 100).toFixed(2)} ${getCurrencySymbol(tripCurrency)}`}
          onAddFamily={() => setShowFamilyModal(true)}
          onOpenLists={() => router.push(`/trips/${tripIdStr}/lists`)}
          onOpenItinerary={() =>
            router.push(`/trips/${tripIdStr}/itinerary`)
          }
          onOpenPersonalExpenses={() =>
            router.push(`/trips/${tripIdStr}/personal`)
          }
          onShare={() => setShowShareModal(true)}
          onOpenSettings={() =>
            router.push(`/trips/${tripIdStr}/settings`)
          }
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Лява колона */}
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Разходи" icon={Receipt}>
              {expensesLoading ? (
                <p className="text-sm text-eco-text-muted">
                  Зареждане на разходи...
                </p>
              ) : (
                <ExpensesTable
                  families={families}
                  expenses={expenses}
                  tripCurrency={tripCurrency}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}
            </SectionCard>
            <SectionCard title="Участници" icon={Users}>
              {familiesLoading ? (
                <p className="text-sm text-eco-text-muted">
                  Зареждане на семейства...
                </p>
              ) : (
                <FamiliesSection
                  families={families}
                  onEditFamily={trip?.ownerId === user.uid ? handleEditFamily : undefined}
                  onDeleteFamily={trip?.ownerId === user.uid ? handleAskDeleteFamily : undefined}
                />
              )}
            </SectionCard>





          </div>

          {/* Дясна колона */}
          <div className="space-y-6 lg:col-span-1">
            <SectionCard title="Кой на кого колко дължи" icon={Scale}>
              <DebtsSummary
                families={families}
                expenses={expenses}
                currency={tripCurrency}
              />
            </SectionCard>
            <SectionCard title="Резюме на пътуването" icon={Info}>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                  <span className="text-eco-text-muted">Статус</span>
                  <span className="font-medium text-eco-text">
                    {tripStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                  <span className="text-eco-text-muted">
                    Брой семейства
                  </span>
                  <span className="font-medium text-eco-text">
                    {familiesCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
                  <span className="text-eco-text-muted">
                    Брой разходи
                  </span>
                  <span className="font-medium text-eco-text">
                    {expensesCount}
                  </span>
                </div>

                {trip?.ownerId === user.uid && <button type="button" className="text-eco-accent" onClick={() => setShowShareModal(true)}>Покани по username</button>}

                {/* Реално похарчено по семейства */}
                {families.length > 0 &&
                  expensesInTripCurrency.length > 0 && (
                    <div className="mt-1 border-t border-eco-border/60 pt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-eco-text">
                          Реално похарчено по семейства
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            canToggleToEur &&
                            setShowSummaryInEur((prev) => !prev)
                          }
                          disabled={!canToggleToEur}
                          className={`text-xs px-2 py-1 rounded-md border ${
                            canToggleToEur
                              ? 'border-eco-accent text-eco-accent hover:bg-eco-accent/10 transition'
                              : 'border-eco-border text-eco-text-muted cursor-default'
                          }`}
                        >
                          {summaryCurrencyLabel}
                        </button>
                      </div>

                      <p className="text-xs text-eco-text-muted">
                        Показва колко реално е похарчило всяко семейство
                        след разделянето на общите разходи.
                        {tripCurrency !== 'EUR' &&
                          ' Кликни върху валутата, за да видиш сумите в евро.'}
                      </p>

                      <div className="space-y-1.5">
                        {families.map((f) => {
                          const base = perFamilyShare[f.id] || 0;
                          return (
                            <div
                              key={f.id}
                              className="flex items-center justify-between rounded-lg bg-eco-surface-soft px-3 py-1.5 text-sm"
                            >
                              <span className="text-eco-text">
                                {f.name}
                              </span>
                              <span className="font-medium text-eco-text">
                                {formatSummaryAmount(base)}{' '}
                                {summaryCurrencyLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </SectionCard>

            <SectionCard title="Съвет" icon={Lightbulb}>
              <p className="text-sm leading-relaxed text-eco-text-muted">
                Добави всички участващи семейства и отбелязвай кой какво
                плаща. Накрая автоматично ще видиш кой на кого колко
                дължи.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Модали */}
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
            ? `Семейство "${deletingFamily.name}" ще бъде премахнато само ако няма свързани разходи. Членството на потребителя се запазва. Продължи?`
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
