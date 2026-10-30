import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';

import type { Trip } from '@/types/trip';
import {
  fetchTripById,
  setTripArchived,
  deleteTripCompletely,
} from '@/lib/trips';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const TripSettingsPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const { user, loading: authLoading } = useAuth();

  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<Trip['type']>('other');

  const [archiveLoading, setArchiveLoading] = React.useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // 👉 Guard за неавторизирани потребители
  React.useEffect(() => {
    if (!authLoading && !user) {
      const target = router.asPath || `/trips/${tripIdStr}/settings`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, router, tripIdStr]);

  // Зареждаме пътуването
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    async function loadTrip() {
      try {
        setLoading(true);
        setError(null);
        const t = await fetchTripById(tripIdStr);
        if (!t) {
          setError('Пътуването не беше намерено.');
          return;
        }
        setTrip(t);
        setName(t.name);
        setType(t.type);
      } catch (err) {
        console.error(err);
        setError('Грешка при зареждане на пътуването.');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [tripIdStr, user]);

  const isDirty =
    !!trip && (name.trim() !== trip.name || type !== trip.type);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trip || trip.ownerId !== user?.uid || !tripIdStr || !isDirty) return;

    try {
      setSaving(true);
      setError(null);

      const trimmedName = name.trim() || trip.name;

      const ref = doc(db, 'trips', tripIdStr);
      await updateDoc(ref, {
        name: trimmedName,
        type: type,
      });

      const updated: Trip = {
        ...trip,
        name: trimmedName,
        type,
      };

      setTrip(updated);
      setName(trimmedName);
      setType(type);
    } catch (err) {
      console.error(err);
      setError('Грешка при запазване на промените.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleArchive() {
    if (!trip || !tripIdStr) return;

    try {
      setArchiveLoading(true);
      await setTripArchived(tripIdStr, !trip.archived);

      const updated: Trip = {
        ...trip,
        archived: !trip.archived,
      };
      setTrip(updated);
    } catch (err) {
      console.error(err);
      alert('Грешка при промяна на статуса на пътуването.');
    } finally {
      setArchiveLoading(false);
    }
  }

  function handleAskDelete() {
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!tripIdStr) return;

    try {
      setDeleteLoading(true);
      await deleteTripCompletely(tripIdStr);
      setDeleteModalOpen(false);
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на пътуване.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const tripName = trip?.name ?? '';

  // Докато auth се зарежда → избягваме мигания
  if (trip && user && trip.ownerId !== user.uid) return <Layout><p>Настройките са достъпни само за организатора.</p></Layout>;

  if (authLoading || !user) {
    return (
      <Layout>
        <p className="text-sm text-eco-text-muted">Зареждане...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="max-w-3xl mx-auto">
        {/* Back button – консистентен с детайлите */}
        <div className="mb-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/trips/${tripIdStr}`)}
          >
            ← Към детайли
          </Button>
        </div>

        <h1 className="text-2xl font-semibold text-eco-text mb-2">
          Настройки на пътуване {tripName ? `„${tripName}“` : ''}
        </h1>

        {loading ? (
          <p className="text-sm text-eco-text-muted mt-4">Зареждане...</p>
        ) : error ? (
          <p className="text-sm text-eco-error mt-4">{error}</p>
        ) : !trip ? (
          <p className="text-sm text-eco-error mt-4">
            Пътуването не беше намерено.
          </p>
        ) : (
          <>
            {/* Форма – основни настройки */}
            <form
              onSubmit={handleSave}
              className="mt-6 space-y-6 border-b border-eco-border/60 pb-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="tripName"
                  className="block text-sm font-medium text-eco-text-muted"
                >
                  Име на пътуването
                </label>
                <input
                  id="tripName"
                  type="text"
                  className="w-full rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Напр. Море 2025, Почивка в планината..."
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="tripType"
                  className="block text-sm font-medium text-eco-text-muted"
                >
                  Тип пътуване
                </label>
                <select
                  id="tripType"
                  className="w-full rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as Trip['type'])
                  }
                >
                  <option value="beach">Море</option>
                  <option value="flight">Екскурзия</option>
                  <option value="other">Друго</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-eco-bg shadow-eco-soft hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  disabled={!isDirty || saving}
                >
                  {saving ? 'Запазване...' : 'Запази промените'}
                </button>
                {!isDirty && (
                  <span className="text-xs text-eco-text-muted">
                    Няма незапазени промени.
                  </span>
                )}
              </div>
            </form>

            {/* Статус на пътуването */}
            <div className="mt-6 border-b border-eco-border/60 pb-6">
              <h2 className="text-lg font-semibold text-eco-text mb-2">
                Статус на пътуването
              </h2>
              <p className="text-sm text-eco-text-muted mb-3">
                В момента пътуването е{' '}
                <span className="font-semibold text-eco-text">
                  {trip.archived ? 'архивирано' : 'активно'}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={handleToggleArchive}
                disabled={archiveLoading}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-500/60 bg-transparent px-4 py-2 text-sm font-medium text-eco-accent hover:bg-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {archiveLoading
                  ? 'Обновяване...'
                  : trip.archived
                  ? 'Върни от архив'
                  : 'Архивирай пътуването'}
              </button>
            </div>

            {/* Опасна зона */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-eco-error mb-2">
                Опасна зона
              </h2>
              <p className="text-sm text-eco-text-muted mb-3">
                Изтриването на пътуването е необратимо. Всички участници,
                разходи и списъци ще бъдат изтрити.
              </p>
              <button
                type="button"
                onClick={handleAskDelete}
                className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-eco-bg shadow-eco-soft hover:bg-red-400 transition-colors"
              >
                Изтрий пътуването
              </button>
            </div>
          </>
        )}
      </Card>

      {/* Модал за изтриване */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Изтриване на пътуване"
        description={
          tripName
            ? `Пътуване „${tripName}“ и всички данни към него ще бъдат изтрити. Сигурен ли си?`
            : 'Пътуването ще бъде изтрито напълно.'
        }
        confirmLabel={deleteLoading ? 'Изтриване...' : 'Изтрий'}
        cancelLabel="Отказ"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteModalOpen(false);
        }}
      />
    </Layout>
  );
};

export default TripSettingsPage;
