import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import SectionCard from '@/components/ui/SectionCard';
import TripItinerary from '@/components/trips/TripItinerary';
import type { Trip, TripItineraryItem } from '@/types/trip';
import { fetchTripById, updateTripItinerary } from '@/lib/trips';
import styles from '@/components/trips/TripDetails.module.css';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const TripItineraryPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const { user, loading: authLoading } = useAuth();

  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [itinerary, setItinerary] = React.useState<TripItineraryItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // 👉 Guard за неавторизирани потребители
  React.useEffect(() => {
    if (!authLoading && !user) {
      const target = router.asPath || `/trips/${tripIdStr}/itinerary`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, router, tripIdStr]);

  // Зареждаме пътуването и програмата САМО ако има user
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    async function loadTrip() {
      try {
        setLoading(true);
        const t = await fetchTripById(tripIdStr);
        setTrip(t);
        setItinerary(t?.itinerary || []);
      } catch (err) {
        console.error('Грешка при зареждане на пътуването:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [tripIdStr, user]);

  const tripName = trip?.name ?? 'Пътуване';

  // Докато auth се зарежда или правим redirect → не показваме съдържанието
  if (authLoading || !user) {
    return (
      <Layout>
        <p className={styles.mutedText}>Зареждане...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.pageWrapper}>
        {/* прост header за страницата с програма */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 className={styles.pageTitle}>{tripName}</h1>
            <p className={styles.mutedText}>Програма на пътуването</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/trips/${tripIdStr}`)}
          >
            ← Към детайли
          </Button>
        </div>

        <div className={styles.sectionsGrid}>
          <div className={styles.mainColumn}>
            <SectionCard title="Програма по дни" icon="🗓">
              {loading ? (
                <p className={styles.mutedText}>Зареждане...</p>
              ) : (
                <TripItinerary
                  items={itinerary}
                  onChange={async (updated) => {
                    setItinerary(updated);
                    if (!tripIdStr) return;

                    try {
                      await updateTripItinerary(tripIdStr, updated);
                    } catch (err) {
                      console.error('Грешка при записване на програмата:', err);
                      alert('Грешка при записване на програмата.');
                    }
                  }}
                />
              )}
            </SectionCard>
          </div>

          {/* дясна колона – инфо/съвет */}
          <div className={styles.sideColumn}>
            <SectionCard title="Съвет" icon="💡">
              <p className={styles.mutedText}>
                Използвай програмата, за да разпишеш ден по ден какво ще правите –
                така всички в групата ще знаят плана предварително.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripItineraryPage;
