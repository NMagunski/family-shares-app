import React from 'react';
import Layout from '@/components/layout/Layout';
import TripTypeSelector from '@/components/trips/TripTypeSelector';
import Card from '@/components/ui/Card';
import type { Trip, TripType } from '@/types/trip';
import TripCard from '@/components/trips/TripCard';
import CreateTripModal from '@/components/trips/CreateTripModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import {
  createTripForUser,
  fetchTripsForUser,
  fetchSharedTripsForUser,
} from '@/lib/trips';

const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [ownedTrips, setOwnedTrips] = React.useState<Trip[]>([]);
  const [sharedTrips, setSharedTrips] = React.useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedType, setSelectedType] = React.useState<TripType | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // зареждаме пътуванията за текущия потребител
  React.useEffect(() => {
  if (!user) {
    setOwnedTrips([]);
    setSharedTrips([]);
    return;
  }

  async function loadTrips() {
    try {
      setTripsLoading(true);
      setError(null);

      const [owned, sharedRaw] = await Promise.all([
        fetchTripsForUser(user!.uid),
        fetchSharedTripsForUser(user!.uid),
      ]);

      const shared = sharedRaw.filter((t) => t.ownerId !== user!.uid);

      setOwnedTrips(owned);
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
    if (!user) {
      router.push('/login');
      return;
    }
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

  return (
    <Layout>
      <Card>
        <h1 style={{ marginBottom: 8 }}>Моите пътувания</h1>
        <p style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          Избери тип пътуване, за да създадеш ново, или отвори вече съществуващо.
        </p>
        <TripTypeSelector onSelect={handleSelect} />
      </Card>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {authLoading || tripsLoading ? (
          <p>Зареждане...</p>
        ) : !user ? (
          <p>За да виждаш и създаваш пътувания, първо влез в профила си.</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            {/* МОИ ПЪТУВАНИЯ */}
            <div>
              <h2 style={{ marginBottom: 8 }}>Създадени от мен</h2>
              {ownedTrips.length === 0 ? (
                <p style={{ fontSize: '0.9rem' }}>Все още нямаш създадени пътувания.</p>
              ) : (
                ownedTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
              )}
            </div>

            {/* СПОДЕЛЕНИ С МЕН */}
            <div>
              <h2 style={{ marginBottom: 8 }}>Пътувания, в които участвам</h2>
              {sharedTrips.length === 0 ? (
                <p style={{ fontSize: '0.9rem' }}>
                  В момента не участваш в други пътувания.
                  Сподели линк към някое твое пътуване или използвай линк,
                  който получиш от приятел.
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
    </Layout>
  );
};

export default HomePage;
