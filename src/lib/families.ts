import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type { TripFamily } from '@/types/trip';

const FAMILIES_COLLECTION = 'families';

export async function fetchFamilies(tripId: string): Promise<TripFamily[]> {
  const q = query(
    collection(db, FAMILIES_COLLECTION),
    where('tripId', '==', tripId)
  );

  const snapshot = await getDocs(q);

  const families: TripFamily[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      tripId: data.tripId,
      name: data.name,
      userId: data.userId ?? '',       // за старите записи може да е празно
      createdAt: data.createdAt,
    };
  });

  families.sort((a, b) => a.name.localeCompare(b.name));

  return families;
}

export async function createFamily(
  tripId: string,
  name: string,
  userId: string
): Promise<TripFamily> {
  const payload = {
    tripId,
    name,
    userId,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, FAMILIES_COLLECTION), payload);

  return {
    id: docRef.id,
    ...payload,
  };
}
