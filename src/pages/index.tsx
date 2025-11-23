import React from 'react';
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

  // Архивиране / връщане от архив
  const [tripToArchive, setTripToArchive] = React.useState<Trip | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [archiveLoading, setArchiveLoading] = React.useState(false);

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
          setError('Не си влязъл в профила си.');
          setTripsLoading(false);
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

  // 👉 Отваряме модала за архивиране
  function handleAskArchiveTrip(trip: Trip) {
    setTripToArchive(trip);
    setArchiveModalOpen(true);
  }

  // 👉 Потвърждение за архивиране / връщане от архив
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

  // 👉 Отваряме модала за изтриване
  function handleAskDeleteTrip(trip: Trip) {
    setTripToDelete(trip);
    setDeleteModalOpen(true);
  }

  // 👉 Потвърждение за изтриване
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
                    onArchiveToggle={handleAskArchiveTrip}
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
                    onArchiveToggle={handleAskArchiveTrip}
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
