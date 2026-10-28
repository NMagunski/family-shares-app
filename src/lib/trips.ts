import { availableResults } from '@/lib/availableResults';
import { community } from '@/lib/community';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type { Trip, TripType, TripItineraryItem } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';

const TRIPS_COLLECTION = 'trips';
const FAMILIES_COLLECTION = 'families';

/**
 * Създаване на ново пътуване
 */
export async function createTripForUser(
  ownerId: string,
  type: TripType,
  name: string,
  country: string,
  currency: CurrencyCode
): Promise<Trip> {
  const payload = {
    ownerId,
    type,
    name: name.trim(),
    country,
    currency,
    createdAt: new Date().toISOString(),
    archived: false,
  };

  const docRef = await addDoc(collection(db, TRIPS_COLLECTION), payload);

  return {
    id: docRef.id,
    ...payload,
  };
}

/**
 * Пътувания, създадени от потребителя
 */
export async function fetchTripsForUser(ownerId: string): Promise<Trip[]> {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('ownerId', '==', ownerId)
  );

  const snapshot = await getDocs(q);

  const trips: Trip[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData;

    return {
      id: docSnap.id,
      ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
      type: data.type as TripType,
      name: typeof data.name === 'string' ? data.name : '',
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
      archived: Boolean(data.archived),
      country: typeof data.country === 'string' ? data.country : 'BG',
      currency:
        typeof data.currency === 'string'
          ? (data.currency as CurrencyCode)
          : 'BGN',
    };
  });

  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return trips;
}

/**
 * Споделени пътувания (чрез семейства)
 */
export async function fetchSharedTripsForUser(
  userId: string,
  onPartialFailure?: (error: unknown) => void
): Promise<Trip[]> {
  const sources = await availableResults([
    getDocs(query(collection(db, 'tripMemberships'), where('userId', '==', userId))).then(s => s.docs),
    getDocs(query(collection(db, FAMILIES_COLLECTION), where('userId', '==', userId))).then(s => s.docs),
  ]);
  sources.errors.forEach(error => onPartialFailure?.(error));
  const tripIds = [...new Set(sources.values
    .map(d => d.data().tripId as unknown).filter((id): id is string => typeof id === 'string' && !!id))];

  if (tripIds.length === 0) return [];

  const trips: Trip[] = [];

  for (const tripId of tripIds) {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    // A revoked or obsolete reference must not hide other accessible trips.
    let tripSnap;
    try { tripSnap = await getDoc(tripRef); }
    catch (error) { onPartialFailure?.(error); continue; }
    if (!tripSnap.exists()) continue;

    const data = tripSnap.data() as DocumentData;

    trips.push({
      id: tripSnap.id,
      ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
      type: data.type as TripType,
      name: typeof data.name === 'string' ? data.name : '',
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
      archived: Boolean(data.archived),
      country: typeof data.country === 'string' ? data.country : 'BG',
      currency:
        typeof data.currency === 'string'
          ? (data.currency as CurrencyCode)
          : 'BGN',
    });
  }

  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return trips;
}

/**
 * Конкретно пътуване по ID
 */
export async function fetchTripById(
  tripId: string
): Promise<Trip | null> {
  const ref = doc(db, TRIPS_COLLECTION, tripId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as DocumentData;

  return {
    id: snap.id,
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    type: data.type as TripType,
    name: typeof data.name === 'string' ? data.name : '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    archived: Boolean(data.archived),
    country: typeof data.country === 'string' ? data.country : 'BG',
    currency:
      typeof data.currency === 'string'
        ? (data.currency as CurrencyCode)
        : 'BGN',
    itinerary: Array.isArray(data.itinerary)
      ? (data.itinerary as TripItineraryItem[])
      : undefined,
  };
}

/**
 * Архивира / деархивира пътуване
 */
export async function setTripArchived(
  tripId: string,
  archived: boolean
): Promise<void> {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), { archived });
}

/**
 * Обновява itinerary
 */
export async function updateTripItinerary(
  tripId: string,
  items: TripItineraryItem[],
  base: TripItineraryItem[]
): Promise<void> {
  const ref = doc(db, TRIPS_COLLECTION, tripId);
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists() || snap.data().archived) throw new Error('Пътуването не е активно.');
    const current = (snap.data().itinerary ?? []) as TripItineraryItem[];
    const next = new Map(current.map(item => [item.id, item]));
    for (const old of base) {
      if (!items.some(item => item.id === old.id)) {
        if (JSON.stringify(next.get(old.id)) !== JSON.stringify(old)) throw new Error('Денят е променен от друг участник. Презареди програмата.');
        next.delete(old.id);
      }
    }
    for (const item of items) {
      const old = base.find(v => v.id === item.id);
      if (JSON.stringify(old) === JSON.stringify(item)) continue;
      const live = next.get(item.id);
      if (old && !live) throw new Error('Денят вече е изтрит.');
      const merged = { ...live, ...item };
      if (old && live) {
        for (const key of Object.keys(item) as (keyof TripItineraryItem)[]) {
          if (item[key] === old[key]) Object.assign(merged, { [key]: live[key] });
          else if (live[key] !== old[key] && live[key] !== item[key]) throw new Error('Конфликт при редакция. Презареди програмата.');
        }
      }
      next.set(item.id, merged);
    }
    tx.update(ref, { itinerary: [...next.values()] });
  });
}

/**
 * Изтрива пътуване + всичко свързано
 */
export async function deleteTripCompletely(
  tripId: string
): Promise<void> {
  await community({ action: 'deleteTrip', tripId });
}
