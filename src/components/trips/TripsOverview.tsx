import { Compass, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import TripCard from './TripCard';
import type { Trip } from '@/types/trip';

type Props = {
  activeTrips: Trip[];
  archivedTrips: Trip[];
  userId: string;
  loading: boolean;
  error: string | null;
  onNewTrip: () => void;
  onArchive: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
};

export default function TripsOverview({ activeTrips, archivedTrips, userId, loading, error, onNewTrip, onArchive, onDelete }: Props) {
  return <div className="trips-overview">
    <div className="flex justify-center"><Button className="new-trip-cta" onClick={onNewTrip}><PlusCircle size={22} aria-hidden="true" />Ново пътуване</Button></div>
    <div className="trips-glance" aria-label="Общ преглед">
      <span className="glance-icon"><Compass size={22} aria-hidden="true" /></span>
      <div className="min-w-0"><p className="glance-label">Общ преглед</p><p className="font-semibold">{loading ? 'Зареждане…' : `${activeTrips.length} активни пътувания`}</p></div>
      {!loading && <span className="glance-archive">{archivedTrips.length} архивирани</span>}
    </div>
    {!loading && !error && !activeTrips.length && !archivedTrips.length && <div className="trips-empty"><h1>Още нямаш пътувания.</h1><p>Създай първото си пътуване и раздели разходите честно между семейства и приятели – без листчета, без калкулатори и без спорове.</p></div>}
    <div className="trips-columns">
      {[{ title: 'Активни пътувания', trips: activeTrips, archived: false }, { title: 'Архивирани пътувания', trips: archivedTrips, archived: true }].map(({ title, trips, archived }) => <section className="trips-section" key={title} aria-label={title}>
        <div className="trips-section-heading"><h2>{title}</h2><span className={`trip-status ${archived ? 'archived' : ''}`} aria-hidden="true" /><span className="trip-count" aria-label={`${trips.length} пътувания`}>{loading ? '…' : trips.length}</span></div>
        {loading ? <p role="status" className="text-sm text-eco-text-muted">Зареждане...</p> : !trips.length ? <p className="text-sm text-eco-text-muted">{error ? `Няма заредени ${archived ? 'архивирани' : 'активни'} пътувания.` : archived ? 'Нямаш архивирани пътувания.' : 'Нямаш активни пътувания. Създай ново или приеми покана от приятел.'}</p> : <div className="space-y-3">{trips.map(trip => <TripCard key={trip.id} trip={trip} role={trip.ownerId === userId ? 'owner' : 'participant'} showManageActions={trip.ownerId === userId} onArchiveToggle={trip.ownerId === userId ? onArchive : undefined} onDelete={trip.ownerId === userId ? onDelete : undefined} />)}</div>}
      </section>)}
    </div>
  </div>;
}
