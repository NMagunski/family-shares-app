// src/lib/trips.ts
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type { Trip, TripType } from '@/types/trip';

const TRIPS_COLLECTION = 'trips';

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

export async function fetchTripsForUser(ownerId: string): Promise<Trip[]> {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('ownerId', '==', ownerId),
  );

  const snapshot = await getDocs(q);

  const trips: Trip[] = snapshot.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ownerId: data.ownerId,
      type: data.type,
      name: data.name,
      createdAt: data.createdAt ?? '',
      archived: data.archived ?? false,
    };
  });

  // сортиране по дата (по-новите отгоре)
  trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return trips;
}
