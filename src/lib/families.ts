import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import type { TripFamily } from '@/types/trip';

const FAMILIES_COLLECTION = 'families';
const EXPENSES_COLLECTION = 'expenses';

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
      userId: data.userId ?? '',
      isOwnerFamily: data.isOwnerFamily ?? false,
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
 * Изтрива семейство + всички разходи в това пътуване, в които участва
 */
export async function deleteFamilyAndExpenses(
  tripId: string,
  familyId: string
): Promise<void> {
  // 1) трием самото семейство
  const famRef = doc(db, FAMILIES_COLLECTION, familyId);
  await deleteDoc(famRef);

  // 2) трием всички разходи в това пътуване, в които участва
  const expensesQuery = query(
    collection(db, EXPENSES_COLLECTION),
    where('tripId', '==', tripId)
  );
  const expensesSnap = await getDocs(expensesQuery);

  const deletions: Promise<void>[] = [];

  expensesSnap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    const isPayer = data.paidByFamilyId === familyId;
    const isInvolved =
      Array.isArray(data.involvedFamilyIds) &&
      data.involvedFamilyIds.includes(familyId);

    if (isPayer || isInvolved) {
      deletions.push(deleteDoc(docSnap.ref));
    }
  });

  await Promise.all(deletions);
}
