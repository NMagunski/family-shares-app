import { TRIP_INVITATIONS_ENABLED } from '@/lib/features';
import { availableResults } from '@/lib/availableResults';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import TripsOverview from '@/components/trips/TripsOverview';
import { useAuth } from '@/context/AuthContext';
import type { Trip } from '@/types/trip';
import NewTripWizard from '@/components/trips/NewTripWizard';
import type { CurrencyCode } from '@/lib/currencies';

import {
  createTripForUser,
  fetchTripsForUser,
  fetchSharedTripsForUser,
  setTripArchived,
  deleteTripCompletely,
} from '@/lib/trips';
import DeleteModal from '@/components/trips/DeleteModal';
import ArchiveModal from '@/components/trips/ArchiveModal';
import Button from '@/components/ui/Button';

const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [ownedTrips, setOwnedTrips] = React.useState<Trip[]>([]);
  const [archivedTrips, setArchivedTrips] = React.useState<Trip[]>([]);
  const [sharedTrips, setSharedTrips] = React.useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Контрол на wizard-а за ново пътуване
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Изтриване на пътуване
  const [tripToDelete, setTripToDelete] = React.useState<Trip | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Архивиране / връщане от архив
  const [tripToArchive, setTripToArchive] = React.useState<Trip | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [archiveLoading, setArchiveLoading] = React.useState(false);

  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (authLoading) return;
    // ако няма логнат → чистим стейта и излизаме
    if (!user) {
      setOwnedTrips([]);
      setArchivedTrips([]);
      setSharedTrips([]);
      return;
    }

    const userId = user.uid;
    let generation = 0;
    let active = true;

    async function loadTrips(forUserId: string) {
      const request = ++generation;
      try {
        setTripsLoading(true);
        setError(null);

        const partialErrors: unknown[] = [];
        const result = await availableResults([
          fetchTripsForUser(forUserId),
          fetchSharedTripsForUser(forUserId, error => partialErrors.push(error)),
        ]);
        if (!active || request !== generation) return;
        const trips = [...new Map(result.values.map(trip => [trip.id, trip])).values()];
        const activeOwned = trips.filter(t => t.ownerId === forUserId && !t.archived);
        const archived = trips.filter(t => t.archived);
        const shared = trips.filter(t => t.ownerId !== forUserId && !t.archived);
        const errors = [...result.errors, ...partialErrors];
        if (errors.length) {
          console.error('Trip sources unavailable:', errors);
          setError(trips.length
            ? 'Част от пътуванията не могат да се заредят. Показани са достъпните.'
            : 'Пътуванията не могат да се заредят напълно. Провери достъпа и конфигурацията на Firebase.');
        }

        setOwnedTrips(activeOwned);
        setArchivedTrips(archived);
        setSharedTrips(shared);
      } catch (err) {
        console.error(err);
        if (active && request === generation) setError('Проблем при зареждане на пътуванията.');
      } finally {
        if (active && request === generation) setTripsLoading(false);
      }
    }

    const unsubscribe = onSnapshot(query(collection(db, TRIP_INVITATIONS_ENABLED ? 'tripMemberships' : 'families'), where('userId', '==', userId)), () => void loadTrips(userId), err => { console.warn('Trip access listener unavailable:', err); if (active) void loadTrips(userId); });
    void loadTrips(userId);
    return () => { active = false; unsubscribe(); };
  }, [user, authLoading, reloadKey]);

  function handleAskArchiveTrip(trip: Trip) {
    setTripToArchive(trip);
    setArchiveModalOpen(true);
  }

  async function handleConfirmArchiveTrip() {
    if (!tripToArchive) return;

    try {
      setArchiveLoading(true);

      await setTripArchived(tripToArchive.id, !tripToArchive.archived);

      if (tripToArchive.archived) {
        // връщаме от архив → към активните
        setArchivedTrips((prev) => prev.filter((t) => t.id !== tripToArchive.id));
        setOwnedTrips((prev) => [
          { ...tripToArchive, archived: false },
          ...prev,
        ]);
      } else {
        // архивираме → махаме от активните, слагаме в архив
        setOwnedTrips((prev) => prev.filter((t) => t.id !== tripToArchive.id));
        setArchivedTrips((prev) => [
          { ...tripToArchive, archived: true },
          ...prev,
        ]);
      }

      setArchiveModalOpen(false);
      setTripToArchive(null);
    } catch (err) {
      console.error(err);
      alert('Грешка при промяна на статуса на пътуването.');
    } finally {
      setArchiveLoading(false);
    }
  }

  function handleAskDeleteTrip(trip: Trip) {
    setTripToDelete(trip);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDeleteTrip() {
    if (!tripToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteTripCompletely(tripToDelete.id);

      setOwnedTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setArchivedTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));

      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на пътуване.');
    } finally {
      setDeleteLoading(false);
    }
  }

  // Обединени активни пътувания (моите + тези, в които участвам)
  const activeTrips = React.useMemo(() => {
    const merged = [...ownedTrips, ...sharedTrips];
    // по-новите най-отгоре, ако имаме createdAt
    merged.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      return 0;
    });
    return merged;
  }, [ownedTrips, sharedTrips]);

  // 👉 1) Докато auth се зарежда
  if (authLoading) {
    return (
      <Layout>
        <p className="text-sm text-eco-text-muted">Зареждане...</p>
      </Layout>
    );
  }

  // 👉 2) Ако потребителят НЕ е логнат → landing
  if (!user) {
    return (
      <Layout>
        <div
          className="
            min-h-[80vh]
            flex items-center justify-center
            px-4
            bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_55%)]
          "
        >
          <Card className="w-full max-w-4xl mx-auto bg-eco-surface-soft/80 backdrop-blur-md border border-eco-border shadow-eco-soft">
            <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
              {/* Лява колона – текст + CTA */}
              <div>
                <div className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-eco-accent">
                  Разделяй разходите честно · без калкулатор
                </div>

                <h1 className="mt-3 text-3xl font-semibold text-eco-text">
                  Добре дошъл в TripSplitly
                </h1>

                <p className="mt-3 text-sm text-eco-text-muted leading-relaxed">
                  TripSplitly ти помага да планираш пътуванията си, да разделяш разходите
                  справедливо между семействата и да знаеш по всяко време
                  <span className="font-semibold text-eco-text">
                    {' '}
                    кой на кого колко дължи.
                  </span>
                </p>

                <ul className="mt-4 space-y-2 text-sm text-eco-text-muted">
                  <li>✅ Добавяш семейства и участници за секунди.</li>
                  <li>✅ Отбелязваш всички разходи – храна, гориво, нощувки.</li>
                  <li>✅ Накрая виждаш ясен баланс без спорове и листчета.</li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => router.push('/login')}
                  >
                    Вход
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/register')}
                  >
                    Създай акаунт
                  </Button>
                </div>

                <p className="mt-3 text-xs text-eco-text-muted">
                  Нямаш регистрация? Създай акаунт за по-малко от минута и започни
                  да организираш следващото си пътуване.
                </p>
              </div>

              {/* Дясна колона – минималистична „илюстрация“ */}
              <div className="relative hidden md:block">
                <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.3),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_55%)] opacity-80" />
                <div className="relative flex h-full items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-eco-surface border border-eco-border shadow-eco-soft">
                    <svg
                      className="h-16 w-16 text-eco-accent"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 3l6 2.4 5-2.4v15l-5 2.4-6-2.4-5 2.4v-15z" />
                      <path d="M9 3v15" />
                      <path d="M15 5.4v15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // 👉 3) Логнат потребител → hero + активни / архивирани пътувания
  const userId = user.uid;


  return (
    <Layout onNewTrip={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {error && <div role="alert" className="rounded-xl border border-eco-border bg-eco-surface p-4 text-sm">
          <p>{error}</p><button type="button" className="mt-2 font-semibold text-eco-accent" disabled={tripsLoading} onClick={() => setReloadKey(key => key + 1)}>Опитай отново</button>
        </div>}
        <TripsOverview activeTrips={activeTrips} archivedTrips={archivedTrips} userId={userId} loading={tripsLoading} error={error} onNewTrip={() => setIsModalOpen(true)} onArchive={handleAskArchiveTrip} onDelete={handleAskDeleteTrip} />

        {/* NewTripWizard – централизирана логика за ново пътуване */}
        <NewTripWizard
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onCreateTrip={async (
    type,
    name,
    country,
    currency: CurrencyCode
  ) => {
    if (!user) return;

    try {
      // ВАЖНО: подаваме валутата директно, без да я сменяме на BGN/EUR
      const newTrip = await createTripForUser(
        user.uid,
        type,
        name,
        country,
        currency
      );

      setOwnedTrips((prev) => [newTrip, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Грешка при създаване на пътуване.');
    }
  }}
/>
        {/* Модали за изтриване / архивиране */}
        {tripToDelete && (
          <DeleteModal
            open={deleteModalOpen}
            trip={tripToDelete}
            onConfirm={handleConfirmDeleteTrip}
            onClose={() => {
              if (deleteLoading) return;
              setDeleteModalOpen(false);
              setTripToDelete(null);
            }}
          />
        )}

        {tripToArchive && (
          <ArchiveModal
            open={archiveModalOpen}
            trip={tripToArchive}
            onConfirm={handleConfirmArchiveTrip}
            onClose={() => {
              if (archiveLoading) return;
              setArchiveModalOpen(false);
              setTripToArchive(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
