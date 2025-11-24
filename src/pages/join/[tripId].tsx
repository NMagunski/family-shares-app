import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AddFamilyModal from '@/components/trips/AddFamilyModal';
import { useAuth } from '@/context/AuthContext';
import { fetchFamilies, createFamily } from '@/lib/families';
import type { TripFamily } from '@/types/trip';

const JoinTripPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const [families, setFamilies] = React.useState<TripFamily[]>([]);
  const [loadingFamilies, setLoadingFamilies] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  // 👉 Guard: ако не е логнат – пращаме към login с redirect обратно към join
  React.useEffect(() => {
    if (!tripIdStr) return;
    if (!authLoading && !user) {
      const target = router.asPath || `/join/${tripIdStr}`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [tripIdStr, authLoading, user, router]);

  // Зареждаме семействата когато има user
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    async function loadFamilies() {
      try {
        setLoadingFamilies(true);
        const data = await fetchFamilies(tripIdStr);
        setFamilies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFamilies(false);
      }
    }

    loadFamilies();
  }, [tripIdStr, user]);

  // Проверка дали user вече има семейство в това пътуване
  React.useEffect(() => {
    if (!user || !tripIdStr) return;

    if (families.length === 0 && !loadingFamilies) {
      // няма семейства – директно показваме popup
      setShowModal(true);
      return;
    }

    const existing = families.find((f) => f.userId === user.uid);

    if (existing) {
      router.push(`/trips/${tripIdStr}`);
    } else if (!loadingFamilies) {
      setShowModal(true);
    }
  }, [families, user, tripIdStr, loadingFamilies, router]);

  async function handleCreateFamily(name: string) {
    if (!tripIdStr || !user) return;

    try {
      await createFamily(tripIdStr, name, user.uid);
      router.push(`/trips/${tripIdStr}`);
    } catch (err) {
      console.error(err);
      alert('Грешка при присъединяване към пътуването.');
    }
  }

  // Докато auth се зарежда или още нямаме user → показваме само loader
  if (authLoading || !user) {
    return (
      <Layout>
        <h1>Присъединяване към пътуване</h1>
        <p>Зареждане...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>Присъединяване към пътуване</h1>
      {loadingFamilies ? (
        <p>Зареждане...</p>
      ) : (
        <p>Подготвяме твоето семейство за това пътуване...</p>
      )}

      <AddFamilyModal
        isOpen={showModal}
        onClose={() => {}}
        onCreate={handleCreateFamily}
      />
    </Layout>
  );
};

export default JoinTripPage;
