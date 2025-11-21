import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type { TripExpense } from '@/types/trip';

const EXPENSES_COLLECTION = 'expenses';

export async function fetchExpenses(tripId: string): Promise<TripExpense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('tripId', '==', tripId)
  );

  const snapshot = await getDocs(q);

  const expenses: TripExpense[] = snapshot.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      tripId: data.tripId,
      paidByFamilyId: data.paidByFamilyId,
      involvedFamilyIds: data.involvedFamilyIds ?? [],
      amount: data.amount,
      currency: data.currency ?? 'BGN',
      comment: data.comment,
      createdAt: data.createdAt ?? '',
    };
  });

  // по-новите най-отгоре
  expenses.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return expenses;
}

export async function createExpense(
  tripId: string,
  input: {
    paidByFamilyId: string;
    involvedFamilyIds: string[];
    amount: number;
    currency: 'BGN' | 'EUR';
    comment?: string;
  }
): Promise<TripExpense> {
  const payload = {
    tripId,
    ...input,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), payload);

  return {
    id: docRef.id,
    ...payload,
  };
}
