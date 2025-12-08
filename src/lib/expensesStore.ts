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
import type { TripExpense, TripExpenseType } from '@/types/trip';

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

    const type = (data.type as TripExpenseType | undefined) ?? undefined;
    const settlementFromFamilyId =
      typeof data.settlementFromFamilyId === 'string'
        ? data.settlementFromFamilyId
        : undefined;
    const settlementToFamilyId =
      typeof data.settlementToFamilyId === 'string'
        ? data.settlementToFamilyId
        : undefined;

    return {
      id: docSnap.id,
      tripId: data.tripId,
      paidByFamilyId: data.paidByFamilyId,
      involvedFamilyIds: data.involvedFamilyIds ?? [],
      amount: data.amount,
      currency: data.currency ?? 'BGN',
      comment: data.comment,
      createdAt,
      type,
      settlementFromFamilyId,
      settlementToFamilyId,
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

type ExpenseInput = {
  paidByFamilyId: string;
  involvedFamilyIds: string[];
  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;
  type?: TripExpenseType; // 'expense' | 'settlement'
  settlementFromFamilyId?: string;
  settlementToFamilyId?: string;
};

export async function createExpense(
  tripId: string,
  input: ExpenseInput
): Promise<TripExpense> {
  const createdAt = new Date().toISOString();

  const payload: any = {
    tripId,
    paidByFamilyId: input.paidByFamilyId,
    involvedFamilyIds: input.involvedFamilyIds,
    amount: input.amount,
    currency: input.currency,
    comment: input.comment ?? '',
    createdAt,
  };

  // добавяме само ако имат стойност
  if (input.type) {
    payload.type = input.type;
  }
  if (input.settlementFromFamilyId) {
    payload.settlementFromFamilyId = input.settlementFromFamilyId;
  }
  if (input.settlementToFamilyId) {
    payload.settlementToFamilyId = input.settlementToFamilyId;
  }

  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), payload);

  return {
    id: docRef.id,
    ...payload,
  };
}

// Редакция на вече съществуващ разход
export async function updateExpense(
  expenseId: string,
  updates: ExpenseInput
): Promise<void> {
  const ref = doc(db, EXPENSES_COLLECTION, expenseId);

  const updatePayload: any = {
    paidByFamilyId: updates.paidByFamilyId,
    involvedFamilyIds: updates.involvedFamilyIds,
    amount: updates.amount,
    currency: updates.currency,
    comment: updates.comment ?? '',
  };

  if (typeof updates.type !== 'undefined') {
    updatePayload.type = updates.type;
  }
  if (typeof updates.settlementFromFamilyId !== 'undefined') {
    updatePayload.settlementFromFamilyId = updates.settlementFromFamilyId;
  }
  if (typeof updates.settlementToFamilyId !== 'undefined') {
    updatePayload.settlementToFamilyId = updates.settlementToFamilyId;
  }

  await updateDoc(ref, updatePayload);
}

// Изтриване на разход
export async function deleteExpense(expenseId: string): Promise<void> {
  const ref = doc(db, EXPENSES_COLLECTION, expenseId);
  await deleteDoc(ref);
}
