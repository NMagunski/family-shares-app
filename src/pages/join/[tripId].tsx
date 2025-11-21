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

  // ако не е логнат – пращаме към login (redirect още не обработваме, но е ок за MVP)
  React.useEffect(() => {
      if (!tripIdStr) return;
      if (!authLoading && !user) {
       router.push(`/login?redirect=/join/${tripIdStr}`);
}
  }, [tripIdStr, authLoading, user, router]);

  // зареждаме семействата когато има user
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

  // проверка дали user вече има семейство в това пътуване
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

  return (
    <Layout>
      <h1>Присъединяване към пътуване</h1>
      {authLoading || loadingFamilies ? (
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
