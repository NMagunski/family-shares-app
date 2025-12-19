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
  deleteDoc,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type { Trip, TripType, TripItineraryItem } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';

const TRIPS_COLLECTION = 'trips';
const FAMILIES_COLLECTION = 'families';
const EXPENSES_COLLECTION = 'expenses';
const LISTS_COLLECTION = 'lists';

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
  userId: string
): Promise<Trip[]> {
  const famQuery = query(
    collection(db, FAMILIES_COLLECTION),
    where('userId', '==', userId)
  );
  const famSnapshot = await getDocs(famQuery);

  const tripIds = Array.from(
    new Set(
      famSnapshot.docs
        .map((d) => {
          const data = d.data() as DocumentData;
          return typeof data.tripId === 'string' ? data.tripId : null;
        })
        .filter((id): id is string => Boolean(id))
    )
  );

  if (tripIds.length === 0) return [];

  const trips: Trip[] = [];

  for (const tripId of tripIds) {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripSnap = await getDoc(tripRef);
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
  items: TripItineraryItem[]
): Promise<void> {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    itinerary: items,
  });
}

/**
 * Изтрива пътуване + всичко свързано
 */
export async function deleteTripCompletely(
  tripId: string
): Promise<void> {
  const collections = [
    FAMILIES_COLLECTION,
    EXPENSES_COLLECTION,
    LISTS_COLLECTION,
  ];

  for (const col of collections) {
    const q = query(collection(db, col), where('tripId', '==', tripId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }

  await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
}
