import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import styles from './TripSettingsPage.module.css';

import type { Trip } from '@/types/trip';
import { fetchTripById, setTripArchived, deleteTripCompletely } from '@/lib/trips';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const TripSettingsPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<Trip['type']>('other');

  const [archiveLoading, setArchiveLoading] = React.useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Зареждаме пътуването
  React.useEffect(() => {
    if (!tripIdStr) return;

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
  }, [tripIdStr]);

  const isDirty =
    !!trip && (name.trim() !== trip.name || type !== trip.type);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trip || !tripIdStr || !isDirty) return;

    try {
      setSaving(true);
      setError(null);

      const trimmedName = name.trim() || trip.name;

      // директен update в колекция "trips"
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
      // връщаме към списъка с пътувания
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на пътуване.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const tripName = trip?.name ?? '';

  return (
    <Layout>
      <Card>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => router.push(`/trips/${tripIdStr}`)}
        >
          ← Назад към пътуването
        </button>

        <h1 className={styles.pageTitle}>
          Настройки на пътуване {tripName ? `„${tripName}“` : ''}
        </h1>

        {loading ? (
          <p className={styles.statusText}>Зареждане...</p>
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : !trip ? (
          <p className={styles.errorText}>Пътуването не беше намерено.</p>
        ) : (
          <>
            {/* Основни настройки */}
            <form className={styles.form} onSubmit={handleSave}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="tripName">
                  Име на пътуването
                </label>
                <input
                  id="tripName"
                  type="text"
                  className={styles.textInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Напр. Море 2025, Почивка в планината..."
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="tripType">
                  Тип пътуване
                </label>
                <select
                  id="tripType"
                  className={styles.select}
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

              <div className={styles.actionsRow}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!isDirty || saving}
                >
                  {saving ? 'Запазване...' : 'Запази промените'}
                </button>
                {!isDirty && (
                  <span className={styles.helperText}>
                    Няма незапазени промени.
                  </span>
                )}
              </div>
            </form>

            {/* Статус: архивирано/активно */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Статус на пътуването</h2>
              <p className={styles.sectionText}>
                В момента пътуването е{' '}
                <strong>
                  {trip.archived ? 'архивирано' : 'активно'}
                </strong>
                .
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleToggleArchive}
                disabled={archiveLoading}
              >
                {archiveLoading
                  ? 'Обновяване...'
                  : trip.archived
                  ? 'Върни от архив'
                  : 'Архивирай пътуването'}
              </button>
            </div>

            {/* Опасна зона */}
            <div className={styles.dangerSection}>
              <h2 className={styles.sectionTitle}>Опасна зона</h2>
              <p className={styles.sectionText}>
                Изтриването на пътуването е необратимо. Всички участници,
                разходи и списъци, свързани с него, ще бъдат изтрити.
              </p>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleAskDelete}
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
            : 'Пътуването и всички данни към него ще бъдат изтрити. Сигурен ли си?'
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
