import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import TripTypeSelector from '@/components/trips/TripTypeSelector';
import Card from '@/components/ui/Card';
import TripCard from '@/components/trips/TripCard';
import CreateTripModal from '@/components/trips/CreateTripModal';
import { useAuth } from '@/context/AuthContext';
import type { Trip, TripType } from '@/types/trip';
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

  const [selectedType, setSelectedType] = React.useState<TripType | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Изтриване на пътуване
  const [tripToDelete, setTripToDelete] = React.useState<Trip | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Архивиране / връщане от архив
  const [tripToArchive, setTripToArchive] = React.useState<Trip | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [archiveLoading, setArchiveLoading] = React.useState(false);

React.useEffect(() => {
  // ако няма логнат → чистим стейта и излизаме
  if (!user) {
    setOwnedTrips([]);
    setArchivedTrips([]);
    setSharedTrips([]);
    return;
  }

  const userId = user.uid;

  async function loadTrips(forUserId: string) {
    try {
      setTripsLoading(true);
      setError(null);

      const [owned, sharedRaw] = await Promise.all([
        fetchTripsForUser(forUserId),
        fetchSharedTripsForUser(forUserId),
      ]);

      const activeOwned = owned.filter((t) => !t.archived);
      const archived = owned.filter((t) => t.archived);
      const shared = sharedRaw.filter((t) => t.ownerId !== forUserId);

      setOwnedTrips(activeOwned);
      setArchivedTrips(archived);
      setSharedTrips(shared);
    } catch (err) {
      console.error(err);
      setError('Проблем при зареждане на пътуванията.');
    } finally {
      setTripsLoading(false);
    }
  }

  loadTrips(userId);
}, [user]);


  function handleSelect(type: TripType) {
    if (!user) return;
    setSelectedType(type);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedType(null);
  }

  async function handleCreateTrip(name: string) {
    if (!selectedType || !user) return;

    try {
      const newTrip = await createTripForUser(user.uid, selectedType, name);
      setOwnedTrips((prev) => [newTrip, ...prev]);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Възникна грешка при създаване на пътуване.');
    }
  }

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
                <div className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
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
                      className="h-16 w-16 text-emerald-300"
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
    <Layout>
      <div className="space-y-6">
        {/* HERO: избор на тип пътуване */}
        <Card>
          <h1 className="text-2xl font-semibold text-eco-text">
            Вид пътуване
          </h1>
          <p className="mt-2 text-sm text-eco-text-muted max-w-2xl">
            Избери тип пътуване, за да създадеш ново, или отвори вече съществуващо.
          </p>
          <div className="mt-4">
            <TripTypeSelector onSelect={handleSelect} />
          </div>
        </Card>

        {/* Секции с пътувания – по-сбит layout за мобилно */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Активни пътувания (моите + тези, в които участвам) */}
          <section className="rounded-2xl border border-eco-border bg-eco-surface-soft/80 p-4 shadow-eco-soft">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-eco-text">
                Активни пътувания
              </h2>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            {tripsLoading ? (
              <p className="mt-2 text-sm text-eco-text-muted">Зареждане...</p>
            ) : error ? (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            ) : activeTrips.length === 0 ? (
              <p className="mt-2 text-sm text-eco-text-muted">
                Все още нямаш активни пътувания. Създай ново или влез с линк,
                който ти е изпратен от приятел.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {activeTrips.map((trip) => {
                  const isOwner = trip.ownerId === userId;
                  return (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      showManageActions={isOwner}
                      onArchiveToggle={isOwner ? handleAskArchiveTrip : undefined}
                      onDelete={isOwner ? handleAskDeleteTrip : undefined}
                      // 🧩 нов проп, който ще използваме в TripCard за бейдж
                      role={isOwner ? 'owner' : 'participant'}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Архивирани пътувания (само създадени от мен) */}
          <section className="rounded-2xl border border-eco-border bg-eco-surface-soft/80 p-4 shadow-eco-soft">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-eco-text">
                Архивирани пътувания
              </h2>
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            </div>

            {tripsLoading ? (
              <p className="mt-2 text-sm text-eco-text-muted">Зареждане...</p>
            ) : archivedTrips.length === 0 ? (
              <p className="mt-2 text-sm text-eco-text-muted">
                Нямаш архивирани пътувания.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {archivedTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showManageActions
                    onArchiveToggle={handleAskArchiveTrip}
                    onDelete={handleAskDeleteTrip}
                    role="owner"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedType && (
        <CreateTripModal
          isOpen={isModalOpen}
          type={selectedType}
          onClose={handleCloseModal}
          onCreate={handleCreateTrip}
        />
      )}

      {/* Модал за ИЗТРИВАНЕ */}
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

      {/* Модал за АРХИВИРАНЕ / ВРЪЩАНЕ ОТ АРХИВ */}
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
    </Layout>
  );
};

export default HomePage;
