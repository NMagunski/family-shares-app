import React from 'react';
import { useRouter } from 'next/router';
import type { Trip } from '@/types/trip';

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
    <div
      onClick={handleOpen}
      className="
        w-full
        cursor-pointer 
        bg-eco-surface 
        border border-eco-border
        shadow-eco-soft
        rounded-xl 
        p-4 
        flex 
        gap-4
        hover:bg-eco-surface-soft 
        transition
        box-border
      "
    >
      {/* Икона */}
      <div
        className="
          flex items-center justify-center
          h-14 w-14
          rounded-xl 
          bg-eco-surface-soft 
          border border-eco-border
          text-3xl
          flex-shrink-0
        "
      >
        {getTypeIcon(trip.type)}
      </div>

      {/* Съдържание */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-eco-text mb-1 truncate">
              {trip.name}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-sm text-eco-text-muted">
              {/* Badge за типа */}
              <span className="px-2 py-0.5 rounded-full bg-eco-surface-soft border border-eco-border">
                {getTypeLabel(trip.type)}
              </span>

              {createdDate && (
                <span className="text-xs text-eco-text-muted">
                  Създадено: {createdDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Управление */}
        {showManageActions && (
          <div className="flex flex-wrap gap-3 mt-4">
            {onArchiveToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchiveToggle(trip);
                }}
                className="
                  text-sm px-3 py-1.5
                  rounded-lg
                  bg-eco-surface-soft
                  border border-eco-border
                  text-eco-text
                  hover:bg-eco-surface 
                  transition
                "
              >
                {isArchived ? 'Активирай' : 'Архивирай'}
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(trip);
                }}
                className="
                  text-sm px-3 py-1.5
                  rounded-lg
                  bg-red-600 
                  text-white 
                  hover:bg-red-700 
                  transition
                  flex-shrink-0
                "
              >
                Изтрий
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCard;
