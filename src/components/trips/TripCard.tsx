import React from 'react';
import { useRouter } from 'next/router';
import type { Trip } from '@/types/trip';
import { Plane, Luggage, Palmtree, ChevronRight } from 'lucide-react';

type TripRole = 'owner' | 'participant';

type Props = {
  trip: Trip;
  showManageActions?: boolean;
  onArchiveToggle?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
  // индикатор "създадено от мен / участвам"
  role?: TripRole;
};

function getTypeIcon(type: Trip['type']) {
  switch (type) {
    case 'beach':
      return <Palmtree className="h-5 w-5" />;
    case 'flight':
      return <Plane className="h-5 w-5" />;
    default:
      return <Luggage className="h-5 w-5" />;
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
  role,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);

  const createdDate = trip.createdAt
    ? new Date(trip.createdAt).toLocaleDateString('bg-BG')
    : '';

  const isArchived = !!trip.archived;

  function handleToggle() {
    setExpanded((prev) => !prev);
  }

  function handleOpenTrip(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/trips/${trip.id}`);
  }

  function handleArchiveClick(e: React.MouseEvent) {
    e.stopPropagation();
    onArchiveToggle?.(trip);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete?.(trip);
  }

  const roleLabel =
    role === 'owner'
      ? 'Създадено от мен'
      : role === 'participant'
      ? 'Покана / участвам'
      : null;

  return (
    <div
      onClick={handleToggle}
      className="
        w-full cursor-pointer
        rounded-xl border border-eco-border bg-eco-surface
        shadow-eco-soft px-3 py-2
        transition hover:bg-eco-surface-soft
      "
    >
      {/* Кратък ред */}
      <div className="flex items-center gap-3">
        {/* Икона – директно отваря пътуването */}
        <div
          onClick={handleOpenTrip}
          className="
            flex h-10 w-10 flex-shrink-0 items-center justify-center
            rounded-lg bg-eco-surface-soft border border-eco-border
            text-eco-text
          "
        >
          {getTypeIcon(trip.type)}
        </div>

        {/* Име + badge-и */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-eco-text">
              {trip.name}
            </h3>

            {isArchived && (
              <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-300 border border-yellow-500/40">
                Архивирано
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-eco-text-muted">
            <span className="rounded-full border border-eco-border px-2 py-0.5">
              {getTypeLabel(trip.type)}
            </span>

            {roleLabel && (
              <span
                className="
                  rounded-full bg-emerald-500/10 px-2 py-0.5
                  text-[10px] font-semibold text-emerald-200
                  border border-emerald-400/40
                "
              >
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        {/* caret */}
        <div className="flex items-center justify-center pl-1">
          <ChevronRight
            className={`
              h-4 w-4 text-eco-text-muted transition-transform
              ${expanded ? 'rotate-90' : ''}
            `}
          />
        </div>
      </div>

      {/* Детайли при expand */}
      {expanded && (
        <div className="mt-3 space-y-3 text-xs text-eco-text-muted">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleOpenTrip}
              className="
                rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold
                text-white hover:bg-emerald-700 transition
              "
            >
              Отвори пътуване
            </button>

            {showManageActions && (
              <>
                {onArchiveToggle && (
                  <button
                    type="button"
                    onClick={handleArchiveClick}
                    className="
                      rounded-lg border border-eco-border bg-eco-surface-soft
                      px-3 py-1.5 text-xs font-medium text-eco-text
                      hover:bg-eco-surface transition
                    "
                  >
                    {isArchived ? 'Активирай' : 'Архивирай'}
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="
                      rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold
                      text-white hover:bg-red-700 transition
                    "
                  >
                    Изтрий
                  </button>
                )}
              </>
            )}
          </div>

          {createdDate && (
            <p className="text-[11px] text-eco-text-muted/80">
              Създадено: {createdDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TripCard;
