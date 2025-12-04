import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc, // 🆕 за изтриване
} from 'firebase/firestore';
import type { TripExpense } from '@/types/trip';

const EXPENSES_COLLECTION = 'expenses';

export async function fetchExpenses(tripId: string): Promise<TripExpense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('tripId', '==', tripId)
  );

  const snapshot = await getDocs(q);

  const expenses: TripExpense[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as any;

    const createdAt =
      typeof data.createdAt === 'string' ? data.createdAt : undefined;

    return {
      id: docSnap.id,
      tripId: data.tripId,
      paidByFamilyId: data.paidByFamilyId,
      involvedFamilyIds: data.involvedFamilyIds ?? [],
      amount: data.amount,
      currency: data.currency ?? 'BGN',
      comment: data.comment,
      createdAt,
    };
  });

  // по-новите най-отгоре, без да чупим записи без createdAt
  expenses.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return a.createdAt < b.createdAt ? 1 : -1;
    }
    if (a.createdAt && !b.createdAt) return -1;
    if (!a.createdAt && b.createdAt) return 1;
    return 0;
  });

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
  const createdAt = new Date().toISOString();

  const payload = {
    tripId,
    ...input,
    createdAt,
  };

  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), payload);

  return {
    id: docRef.id,
    ...payload,
  };
}

// Редакция на вече съществуващ разход
export async function updateExpense(
  expenseId: string,
  updates: {
    paidByFamilyId: string;
    involvedFamilyIds: string[];
    amount: number;
    currency: 'BGN' | 'EUR';
    comment?: string;
  }
): Promise<void> {
  const ref = doc(db, EXPENSES_COLLECTION, expenseId);

  // Не пипаме tripId и createdAt – само съдържанието на разхода
  await updateDoc(ref, {
    paidByFamilyId: updates.paidByFamilyId,
    involvedFamilyIds: updates.involvedFamilyIds,
    amount: updates.amount,
    currency: updates.currency,
    comment: updates.comment ?? '',
  });
}

// 🆕 Изтриване на разход
export async function deleteExpense(expenseId: string): Promise<void> {
  const ref = doc(db, EXPENSES_COLLECTION, expenseId);
  await deleteDoc(ref);
}
