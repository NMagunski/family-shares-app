import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  deleteField,
} from 'firebase/firestore';

import type { TripExpense } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';

export type TripExpenseType = 'expense' | 'settlement';

export type ExpenseInput = {
  paidByFamilyId: string;
  involvedFamilyIds: string[];
  amount: number;
  currency: CurrencyCode;
  comment?: string;
  type?: TripExpenseType;

  settlementFromFamilyId?: string;
  settlementToFamilyId?: string;
};

const EXPENSES_COLLECTION = 'expenses';

function asRecord(v: unknown): Record<string, unknown> {
  return (v ?? {}) as Record<string, unknown>;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
}

/**
 * Взима всички разходи за пътуване
 */
export async function fetchExpenses(tripId: string): Promise<TripExpense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('tripId', '==', tripId)
  );

  const snap = await getDocs(q);

  const expenses: TripExpense[] = snap.docs.map((docSnap) => {
    const data = asRecord(docSnap.data());

    // createdAt при теб е string ISO в някои места; пазим го като string
    const createdAt = asString(data.createdAt, '');

    const type = (asString(data.type, 'expense') as TripExpenseType) ?? 'expense';

    return {
      id: docSnap.id,
      tripId: asString(data.tripId, tripId),
      paidByFamilyId: asString(data.paidByFamilyId, ''),
      involvedFamilyIds: asStringArray(data.involvedFamilyIds),
      amount: asNumber(data.amount, 0),
      currency: asString(data.currency, 'EUR') as CurrencyCode,
      comment: asString(data.comment, ''),
      createdAt,
      type,
      settlementFromFamilyId: asString(data.settlementFromFamilyId, ''),
      settlementToFamilyId: asString(data.settlementToFamilyId, ''),
    } as TripExpense;
  });

  // newest first (ако createdAt е ISO)
  expenses.sort((a, b) => ((a.createdAt ?? '') < (b.createdAt ?? '') ? 1 : -1));

  return expenses;
}

/**
 * Създава разход
 */
export async function createExpense(
  tripId: string,
  input: ExpenseInput
): Promise<TripExpense> {
  const createdAt = new Date().toISOString();

  const payload: Record<string, unknown> = {
    tripId,
    paidByFamilyId: input.paidByFamilyId,
    involvedFamilyIds: input.involvedFamilyIds,
    amount: input.amount,
    currency: input.currency,
    comment: input.comment ?? '',
    createdAt,
    type: input.type ?? 'expense',
  };

  if (typeof input.settlementFromFamilyId === 'string') {
    payload.settlementFromFamilyId = input.settlementFromFamilyId;
  }
  if (typeof input.settlementToFamilyId === 'string') {
    payload.settlementToFamilyId = input.settlementToFamilyId;
  }

  const ref = await addDoc(collection(db, EXPENSES_COLLECTION), payload);

  // връщаме TripExpense
  return {
    id: ref.id,
    ...(payload as unknown as Omit<TripExpense, 'id'>),
  } as TripExpense;
}

/**
 * Ъпдейт на разход
 */
export async function updateExpense(
  expenseId: string,
  updates: ExpenseInput
): Promise<void> {
  const ref = doc(db, EXPENSES_COLLECTION, expenseId);

  const updatePayload: Record<string, unknown> = {
    paidByFamilyId: updates.paidByFamilyId,
    involvedFamilyIds: updates.involvedFamilyIds,
    amount: updates.amount,
    currency: updates.currency,
    comment: updates.comment ?? '',
    type: updates.type ?? 'expense',
  };

  // ако не е settlement – чистим settlement полетата
  if ((updates.type ?? 'expense') !== 'settlement') {
    updatePayload.settlementFromFamilyId = deleteField();
    updatePayload.settlementToFamilyId = deleteField();
  } else {
    updatePayload.settlementFromFamilyId = updates.settlementFromFamilyId ?? '';
    updatePayload.settlementToFamilyId = updates.settlementToFamilyId ?? '';
  }

  await updateDoc(ref, updatePayload);
}

/**
 * Изтриване на разход
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
}

/**
 * (По избор) Взима разход по ID – полезно за debug
 */
export async function fetchExpenseById(
  expenseId: string
): Promise<TripExpense | null> {
  const ref = doc(db, EXPENSES_COLLECTION, expenseId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = asRecord(snap.data());
  return {
    id: snap.id,
    tripId: asString(data.tripId, ''),
    paidByFamilyId: asString(data.paidByFamilyId, ''),
    involvedFamilyIds: asStringArray(data.involvedFamilyIds),
    amount: asNumber(data.amount, 0),
    currency: asString(data.currency, 'EUR') as CurrencyCode,
    comment: asString(data.comment, ''),
    createdAt: asString(data.createdAt, ''),
    type: (asString(data.type, 'expense') as TripExpenseType) ?? 'expense',
    settlementFromFamilyId: asString(data.settlementFromFamilyId, ''),
    settlementToFamilyId: asString(data.settlementToFamilyId, ''),
  } as TripExpense;
}
