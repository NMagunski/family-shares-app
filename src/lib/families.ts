import { community } from '@/lib/community';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import type { TripFamily } from '@/types/trip';

const FAMILIES_COLLECTION = 'families';

export async function fetchFamilies(tripId: string): Promise<TripFamily[]> {
  const q = query(
    collection(db, FAMILIES_COLLECTION),
    where('tripId', '==', tripId)
  );

  const snapshot = await getDocs(q);

  const families: TripFamily[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData;

    return {
      id: docSnap.id,
      tripId: typeof data.tripId === 'string' ? data.tripId : tripId,
      name: typeof data.name === 'string' ? data.name : '',
      userId: typeof data.userId === 'string' ? data.userId : '',
      isOwnerFamily: Boolean(data.isOwnerFamily),
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
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
    isOwnerFamily: false,
  };
}

/**
 * Редактира име на семейство
 */
export async function updateFamilyName(
  familyId: string,
  newName: string
): Promise<void> {
  const ref = doc(db, FAMILIES_COLLECTION, familyId);
  await updateDoc(ref, { name: newName });
}

/**
 * Премахва празно семейство; отказва при финансова история.
 */
export async function deleteFamilyAndExpenses(
  tripId: string,
  familyId: string
): Promise<void> {
  await community({ action: 'deleteFamily', tripId, familyId });
}
