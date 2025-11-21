import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import type { Trip, TripType } from '@/types/trip';

const TRIPS_COLLECTION = 'trips';
const FAMILIES_COLLECTION = 'families';

export async function createTripForUser(
  ownerId: string,
  type: TripType,
  name: string
): Promise<Trip> {
  const payload = {
    ownerId,
    type,
    name,
    createdAt: new Date().toISOString(),
    archived: false,
  };

  const docRef = await addDoc(collection(db, TRIPS_COLLECTION), payload);

  const trip: Trip = {
    id: docRef.id,
    ...payload,
  };

  return trip;
}

/**
 * Пътувания, създадени от текущия потребител
 */
export async function fetchTripsForUser(ownerId: string): Promise<Trip[]> {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('ownerId', '==', ownerId),
  );

  const snapshot = await getDocs(q);

  const trips: Trip[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      ownerId: data.ownerId,
      type: data.type,
      name: data.name,
      createdAt: data.createdAt ?? '',
      archived: data.archived ?? false,
    };
  });

  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return trips;
}

/**
 * Пътувания, в които потребителят участва чрез семейство (споделени пътувания)
 */
export async function fetchSharedTripsForUser(userId: string): Promise<Trip[]> {
  // 1) намираме всички семейства за този user
  const famQuery = query(
    collection(db, FAMILIES_COLLECTION),
    where('userId', '==', userId)
  );
  const famSnapshot = await getDocs(famQuery);

  const tripIds = Array.from(
    new Set(famSnapshot.docs.map((d) => (d.data() as any).tripId as string))
  );

  if (tripIds.length === 0) {
    return [];
  }

  // 2) взимаме съответните trips по ID
  const trips: Trip[] = [];

  for (const tid of tripIds) {
    const tripRef = doc(db, TRIPS_COLLECTION, tid);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) continue;

    const data = tripSnap.data() as any;
    trips.push({
      id: tripSnap.id,
      ownerId: data.ownerId,
      type: data.type,
      name: data.name,
      createdAt: data.createdAt ?? '',
      archived: data.archived ?? false,
    });
  }

  // сортираме по дата
  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return trips;
}
