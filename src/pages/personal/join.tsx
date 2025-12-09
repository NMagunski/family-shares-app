import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  joinPersonalListByToken,
  type PersonalExpenseList,
} from '@/lib/personalExpenses';
import { fetchTripById } from '@/lib/trips';

const JoinPersonalListPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState<PersonalExpenseList | null>(null);
  const [tripName, setTripName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Зареждаме списъка по токен
  React.useEffect(() => {
    async function load() {
      if (!token || typeof token !== 'string') {
        setError('Невалиден линк или липсващ токен.');
        setLoading(false);
        return;
      }

      try {
        const data = await joinPersonalListByToken(token, user?.uid || '');
        if (!data) {
          setError('Не е намерен личен списък за този линк.');
          setLoading(false);
          return;
        }

        setList(data);

        // Зареждаме името на пътуването за UX
        const trip = await fetchTripById(data.tripId);
        if (trip) setTripName(trip.name || '');

      } catch (err) {
        console.error(err);
        setError('Грешка при зареждане на списъка.');
      } finally {
        setLoading(false);
      }
    }

    // Изчакваме auth да се зареди
    if (!authLoading) {
      if (!user) {
        // Пренасочваме да се логне преди да join-не
        const redirect = `/personal/join?token=${encodeURIComponent(
          token as string
        )}`;
        router.replace(`/login?redirect=${redirect}`);
      } else {
        load();
      }
    }
  }, [token, authLoading, user, router]);

  function handleGo() {
    if (!list) return;
    router.push(`/trips/${list.tripId}/personal`);
  }

  return (
    <Layout>
      <Card>
        {loading ? (
          <p className="text-sm text-eco-text-muted">Зареждане...</p>
        ) : error ? (
          <div>
            <h1 className="text-xl font-semibold text-red-400 mb-2">Грешка</h1>
            <p className="text-sm text-eco-text-muted">{error}</p>
          </div>
        ) : list ? (
          <div>
            <h1 className="text-xl font-semibold text-eco-text mb-3">
              Присъедини се към личен списък
            </h1>

            <p className="text-sm text-eco-text-muted mb-4">
              Беше поканен/а да се присъединиш към личен разходен списък за
              пътуването{' '}
              <span className="font-medium text-eco-text">
                {tripName || '...'}
              </span>
              .
            </p>

            <div className="mb-6">
              <p className="text-base font-semibold text-eco-text">
                Списък: {list.name}
              </p>
              <p className="text-xs text-eco-text-muted mt-1">
                Собственик: {list.ownerUserId}
              </p>
            </div>

            <Button onClick={handleGo} className="px-4 py-2">
              Влизам в списъка →
            </Button>
          </div>
        ) : null}
      </Card>
    </Layout>
  );
};

export default JoinPersonalListPage;
