import React from 'react';
import { useRouter } from 'next/router';
import type { Trip } from '@/types/trip';
import Button from '@/components/ui/Button';
import styles from './TripCard.module.css';

type Props = {
  trip: Trip;
  showManageActions?: boolean;
  onArchiveToggle?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
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

const TripCard: React.FC<Props> = ({
  trip,
  showManageActions = false,
  onArchiveToggle,
  onDelete,
}) => {
  const router = useRouter();

  const createdDate = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('bg-BG')
    : '';

  function handleOpen() {
    router.push(`/trips/${trip.id}`);
  }

  const isArchived = !!trip.archived;

  return (
    <div className={styles.card} onClick={handleOpen}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{getTypeIcon(trip.type)}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>{trip.name}</h3>
            <div className={styles.subtitleRow}>
              <span className={styles.typeBadge}>{getTypeLabel(trip.type)}</span>
              {createdDate && (
                <span className={styles.metaText}>Създадено: {createdDate}</span>
              )}
            </div>
          </div>

          {isArchived && (
            <span className={styles.archivedBadge}>Архивирано</span>
          )}
        </div>

        <div className={styles.footerRow}>
          <div className={styles.primaryAction}>
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

          {showManageActions && (
            <div className={styles.manageRow}>
              {onArchiveToggle && (
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveToggle(trip);
                  }}
                >
                  {isArchived ? 'Върни от архив' : 'Архивирай'}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(trip);
                  }}
                >
                  Изтрий
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
