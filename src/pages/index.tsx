import React from 'react';
import Layout from '@/components/layout/Layout';
import TripTypeSelector from '@/components/trips/TripTypeSelector';
import Card from '@/components/ui/Card';
import type { Trip, TripType } from '@/types/trip';
import TripCard from '@/components/trips/TripCard';
import CreateTripModal from '@/components/trips/CreateTripModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { createTripForUser, fetchTripsForUser } from '@/lib/trips';

const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedType, setSelectedType] = React.useState<TripType | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Зареждаме пътуванията от Firestore, когато имаме логнат потребител
  React.useEffect(() => {
    if (!user) {
      setTrips([]);
      return;
    }

    async function loadTrips() {
      try {
        setError(null);
        setTripsLoading(true);
        const data = await fetchTripsForUser(user!.uid);
        setTrips(data);
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
      // ако не е логнат → към login
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
      setTrips((prev) => [newTrip, ...prev]);
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
          Избери тип пътуване, за да създадеш ново, или отвори миналите пътувания.
        </p>
        <TripTypeSelector onSelect={handleSelect} />
      </Card>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2>Минали пътувания</h2>

        {authLoading || tripsLoading ? (
          <p>Зареждане...</p>
        ) : !user ? (
          <p>За да виждаш пътуванията си, първо влез в профила си.</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : trips.length === 0 ? (
          <p>Все още нямаш запазени пътувания.</p>
        ) : (
          trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
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
