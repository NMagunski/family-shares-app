import React from 'react';
import { useRouter } from 'next/router';
import type { Trip } from '@/types/trip';
import Button from '@/components/ui/Button';
import styles from './TripCard.module.css';

type Props = {
  trip: Trip;
};

function getTypeIcon(type: Trip['type']) {
  switch (type) {
    case 'beach':
      return '🏖️';
    case 'flight':
      return '✈️';
    default:
      return '🧳';
  }
}

function getTypeLabel(type: Trip['type']) {
  switch (type) {
    case 'beach':
      return 'Море';
    case 'flight':
      return 'Екскурзия';
    default:
      return 'Друго';
  }
}

const TripCard: React.FC<Props> = ({ trip }) => {
  const router = useRouter();

  const createdDate = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('bg-BG')
    : '';

  function handleOpen() {
    router.push(`/trips/${trip.id}`);
  }

  return (
    <div className={styles.card} onClick={handleOpen}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{getTypeIcon(trip.type)}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{trip.name}</h3>
        </div>

        <div className={styles.meta}>
          <span className={styles.type}>
            Тип: <strong>{getTypeLabel(trip.type)}</strong>
          </span>
          {createdDate && (
            <span className={styles.date}>Създадено: {createdDate}</span>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
          >
            Отвори пътуването
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
