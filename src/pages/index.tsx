import React from 'react';
import Layout from '@/components/layout/Layout';
import TripTypeSelector from '@/components/trips/TripTypeSelector';
import Card from '@/components/ui/Card';
import TripCard from '@/components/trips/TripCard';
import CreateTripModal from '@/components/trips/CreateTripModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import type { Trip, TripType } from '@/types/trip';
import {
  createTripForUser,
  fetchTripsForUser,
  fetchSharedTripsForUser,
  setTripArchived,
  deleteTripCompletely,
} from '@/lib/trips';

const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

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

  React.useEffect(() => {
    if (!user) {
      setOwnedTrips([]);
      setArchivedTrips([]);
      setSharedTrips([]);
      return;
    }

    async function loadTrips() {
      try {
        setTripsLoading(true);
        setError(null);

if (!user) {
  setOwnedTrips([]);
  setArchivedTrips([]);
  setSharedTrips([]);
  return;
}

const userId = user.uid;

const [owned, sharedRaw] = await Promise.all([
  fetchTripsForUser(userId),
  fetchSharedTripsForUser(userId),
]);

const activeOwned = owned.filter((t) => !t.archived);
const archived = owned.filter((t) => t.archived);
const shared = sharedRaw.filter((t) => t.ownerId !== userId);

setOwnedTrips(activeOwned);
setArchivedTrips(archived);
setSharedTrips(shared);


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

    loadTrips();
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

  async function handleArchiveToggle(trip: Trip) {
    try {
      await setTripArchived(trip.id, !trip.archived);

      if (trip.archived) {
        // връщаме от архив → към активните
        setArchivedTrips((prev) => prev.filter((t) => t.id !== trip.id));
        setOwnedTrips((prev) => [{ ...trip, archived: false }, ...prev]);
      } else {
        // архивираме → махаме от активните, слагаме в архив
        setOwnedTrips((prev) => prev.filter((t) => t.id !== trip.id));
        setArchivedTrips((prev) => [{ ...trip, archived: true }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert('Грешка при промяна на статуса на пътуването.');
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

  return (
    <Layout>
      <Card>
        <h1 style={{ marginBottom: 8 }}>Моите пътувания</h1>
        <p style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          Избери тип пътуване, за да създадеш ново, или отвори вече съществуващо.
        </p>
        <TripTypeSelector onSelect={handleSelect} />
      </Card>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {authLoading || tripsLoading ? (
          <p>Зареждане...</p>
        ) : !user ? (
          <p>За да виждаш и създаваш пътувания, първо влез в профила си.</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            {/* МОИ АКТИВНИ ПЪТУВАНИЯ */}
            <div>
              <h2 style={{ marginBottom: 8 }}>Създадени от мен</h2>
              {ownedTrips.length === 0 ? (
                <p style={{ fontSize: '0.9rem' }}>
                  Все още нямаш активни пътувания.
                </p>
              ) : (
                ownedTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showManageActions
                    onArchiveToggle={handleArchiveToggle}
                    onDelete={handleAskDeleteTrip}
                  />
                ))
              )}
            </div>

            {/* АРХИВИРАНИ ПЪТУВАНИЯ */}
            <div>
              <h2 style={{ marginBottom: 8 }}>Архивирани пътувания</h2>
              {archivedTrips.length === 0 ? (
                <p style={{ fontSize: '0.9rem' }}>Нямаш архивирани пътувания.</p>
              ) : (
                archivedTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showManageActions
                    onArchiveToggle={handleArchiveToggle}
                    onDelete={handleAskDeleteTrip}
                  />
                ))
              )}
            </div>

            {/* ПЪТУВАНИЯ, В КОИТО УЧАСТВАМ */}
            <div>
              <h2 style={{ marginBottom: 8 }}>Пътувания, в които участвам</h2>
              {sharedTrips.length === 0 ? (
                <p style={{ fontSize: '0.9rem' }}>
                  В момента не участваш в други пътувания. Сподели линк към
                  някое твое пътуване или използвай линк, който получиш от
                  приятел.
                </p>
              ) : (
                sharedTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
              )}
            </div>
          </>
        )}
      </div>

      {selectedType && (
        <CreateTripModal
          isOpen={isModalOpen}
          type={selectedType}
          onClose={handleCloseModal}
          onCreate={handleCreateTrip}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Изтриване на пътуване"
        description={
          tripToDelete
            ? `Пътуването "${tripToDelete.name}" и всички свързани данни (семейства, разходи, списъци) ще бъдат изтрити. Сигурен ли си?`
            : ''
        }
        confirmLabel={deleteLoading ? 'Изтриване...' : 'Изтрий'}
        cancelLabel="Отказ"
        onConfirm={handleConfirmDeleteTrip}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteModalOpen(false);
          setTripToDelete(null);
        }}
      />
    </Layout>
  );
};

export default HomePage;
