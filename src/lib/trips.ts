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
import type { Trip, TripType, TripItineraryItem } from '@/types/trip';

const TRIPS_COLLECTION = 'trips';
const FAMILIES_COLLECTION = 'families';
const EXPENSES_COLLECTION = 'expenses';
const LISTS_COLLECTION = 'lists';

/**
 * Създаване на ново пътуване за даден потребител
 * country & currency са по избор – ако ги няма, взимаме BG / BGN.
 */
export async function createTripForUser(
  ownerId: string,
  type: TripType,
  name: string,
  country: string = 'BG',
  currency: 'BGN' | 'EUR' = 'BGN'
): Promise<Trip> {
  const payload = {
    ownerId,
    type,
    name,
    country,
    currency,
    createdAt: new Date().toISOString(),
    archived: false,
    // itinerary не е задължително поле – може да го пропуснем
  };

  const docRef = await addDoc(collection(db, TRIPS_COLLECTION), payload);

  const trip: Trip = {
    id: docRef.id,
    ...payload,
  };

  return trip;
}

/**
 * Пътувания, които потребителят е създал (той е owner)
 */
export async function fetchTripsForUser(ownerId: string): Promise<Trip[]> {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('ownerId', '==', ownerId)
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
      country: data.country ?? 'BG',
      currency: (data.currency as 'BGN' | 'EUR' | undefined) ?? 'BGN',
      // itinerary не ни трябва в списъка – оставяме го undefined
    };
  });

  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return trips;
}

/**
 * Пътувания, в които потребителят участва чрез семейства (споделени trips)
 */
export async function fetchSharedTripsForUser(userId: string): Promise<Trip[]> {
  const famQuery = query(
    collection(db, FAMILIES_COLLECTION),
    where('userId', '==', userId)
  );
  const famSnapshot = await getDocs(famQuery);

  const tripIds = Array.from(
    new Set(
      famSnapshot.docs.map((d) => (d.data() as any).tripId as string)
    )
  );

  if (tripIds.length === 0) {
    return [];
  }

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
      country: data.country ?? 'BG',
      currency: (data.currency as 'BGN' | 'EUR' | undefined) ?? 'BGN',
      // itinerary тук също не е нужен
    });
  }

  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return trips;
}

/**
 * Взима конкретно пътуване по ID (за заглавието на екрана и детайла)
 */
export async function fetchTripById(tripId: string): Promise<Trip | null> {
  const ref = doc(db, TRIPS_COLLECTION, tripId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as any;

  const trip: Trip = {
    id: snap.id,
    ownerId: data.ownerId,
    type: data.type,
    name: data.name,
    createdAt: data.createdAt ?? '',
    archived: data.archived ?? false,
    country: data.country ?? 'BG',
    currency: (data.currency as 'BGN' | 'EUR' | undefined) ?? 'BGN',
    // 👉 ако вече има itinerary в документа – взимаме го, иначе оставяме undefined
    itinerary: (data.itinerary as TripItineraryItem[] | undefined) ?? undefined,
  };

  return trip;
}

/**
 * Архивира / деархивира пътуване
 */
export async function setTripArchived(
  tripId: string,
  archived: boolean
): Promise<void> {
  const ref = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(ref, { archived });
}

/**
 * Обновява програмата (itinerary) на пътуването
 */
export async function updateTripItinerary(
  tripId: string,
  items: TripItineraryItem[]
): Promise<void> {
  const ref = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(ref, {
    itinerary: items,
  });
}

/**
 * Изтрива пътуване + всички свързани семейства, разходи и списъци
 */
export async function deleteTripCompletely(tripId: string): Promise<void> {
  // трием всички семейства за това пътуване
  const famQuery = query(
    collection(db, FAMILIES_COLLECTION),
    where('tripId', '==', tripId)
  );
  const famSnap = await getDocs(famQuery);

  const famDeletions: Promise<void>[] = [];
  famSnap.forEach((docSnap) => {
    famDeletions.push(deleteDoc(docSnap.ref));
  });

  // трием всички разходи за това пътуване
  const expQuery = query(
    collection(db, EXPENSES_COLLECTION),
    where('tripId', '==', tripId)
  );
  const expSnap = await getDocs(expQuery);

  const expDeletions: Promise<void>[] = [];
  expSnap.forEach((docSnap) => {
    expDeletions.push(deleteDoc(docSnap.ref));
  });

  // трием всички списъци за това пътуване (ако има)
  const listQuery = query(
    collection(db, LISTS_COLLECTION),
    where('tripId', '==', tripId)
  );
  const listSnap = await getDocs(listQuery);

  const listDeletions: Promise<void>[] = [];
  listSnap.forEach((docSnap) => {
    listDeletions.push(deleteDoc(docSnap.ref));
  });

  await Promise.all([...famDeletions, ...expDeletions, ...listDeletions]);

  // трием самото пътуване
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  await deleteDoc(tripRef);
}
