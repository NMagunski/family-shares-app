import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import SectionCard from '@/components/ui/SectionCard';
import TripItinerary from '@/components/trips/TripItinerary';
import type { Trip, TripItineraryItem } from '@/types/trip';
import { fetchTripById, updateTripItinerary } from '@/lib/trips';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { CalendarRange, Lightbulb, MapPinned } from 'lucide-react';

const TripItineraryPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const { user, loading: authLoading } = useAuth();

  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [itinerary, setItinerary] = React.useState<TripItineraryItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      const target = router.asPath || `/trips/${tripIdStr}/itinerary`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, router, tripIdStr]);

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

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-sm text-eco-text-muted">Зареждане...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 lg:space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-eco-text">
              {tripName}
            </h1>
            <p className="mt-1 text-sm text-eco-text-muted flex items-center gap-1.5">
              <MapPinned className="h-4 w-4" />
              <span>Програма на пътуването</span>
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/trips/${tripIdStr}`)}
          >
            ← Към детайли
          </Button>
        </div>

        {/* GRID: main + side */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* ЛЯВА КОЛОНА */}
          <div className="space-y-6">
            <SectionCard
              title="Програма по дни"
              icon={CalendarRange}   // 👈 подаваме компонент, не <CalendarRange />
            >
              {loading ? (
                <p className="text-sm text-eco-text-muted">Зареждане...</p>
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

          {/* ДЯСНА КОЛОНА – инфо/съвет */}
          <div className="space-y-6">
            <SectionCard
              title="Съвет"
              icon={Lightbulb}       // 👈 също тук
            >
              <p className="text-sm text-eco-text-muted">
                Използвай програмата, за да разпишеш ден по ден какво ще
                правите – така всички в групата ще знаят плана предварително.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripItineraryPage;
