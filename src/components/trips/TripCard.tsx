import React from 'react';
import Link from 'next/link';
import type { Trip } from '@/types/trip';
import { Plane, Luggage, Palmtree, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

type Props = {
  trip: Trip;
  showManageActions?: boolean;
  onArchiveToggle?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
  role?: 'owner' | 'participant';
};

export default function TripCard({ trip, showManageActions = false, onArchiveToggle, onDelete, role }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const id = React.useId();
  const Icon = trip.type === 'beach' ? Palmtree : trip.type === 'flight' ? Plane : Luggage;
  const typeLabel = trip.type === 'beach' ? 'Море' : trip.type === 'flight' ? 'Екскурзия' : 'Друго';
  return <article className={`trip-card ${trip.archived ? 'is-archived' : ''}`}>
    <div className="trip-card-top">
      <Link href={`/trips/${trip.id}`} className="trip-type-icon" aria-label={`Отвори ${trip.name}`}><Icon size={25} aria-hidden="true" /></Link>
      <button type="button" className="trip-card-toggle" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls={id}>
        <span className="min-w-0"><span className="trip-name">{trip.name}</span><span className="trip-badges"><span>{typeLabel}</span>{role && <span className="trip-role">{role === 'owner' ? 'Създадено от мен' : 'Покана / участвам'}</span>}{trip.archived && <span className="trip-archived-badge">Архивирано</span>}</span></span>
        <ChevronRight size={20} aria-hidden="true" className={expanded ? 'rotate-90' : ''} />
      </button>
    </div>
    <div id={id} hidden={!expanded} className="trip-card-details">
      <div className="flex flex-wrap gap-2"><Link className="trip-open-link" href={`/trips/${trip.id}`}>Отвори пътуване</Link>
        {showManageActions && <>{onArchiveToggle && <Button variant="secondary" onClick={() => onArchiveToggle(trip)}>{trip.archived ? 'Активирай' : 'Архивирай'}</Button>}{onDelete && <Button variant="danger" onClick={() => onDelete(trip)}>Изтрий</Button>}</>}
      </div>
      {trip.createdAt && <p className="mt-3 text-xs text-eco-text-muted">Създадено: {new Date(trip.createdAt).toLocaleDateString('bg-BG')}</p>}
    </div>
  </article>;
}
