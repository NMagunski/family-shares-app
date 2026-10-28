import type { TripFamily, TripExpense } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';
export type FamilyBalance = Record<string, number>;
export type DebtLine = { fromFamilyId: string; toFamilyId: string; amount: number };

type ShareExpense = Pick<TripExpense, 'amount' | 'involvedFamilyIds' | 'allocationMode' | 'type'>;
export function expenseShares(familyIds: string[], expense: ShareExpense): FamilyBalance {
  if (expense.type === 'settlement') return {};
  const amount = Math.round(expense.amount * 100);
  if (!Number.isSafeInteger(amount) || amount <= 0) return {};
  // Only old untyped empty arrays mean all; new explicit selections never do.
  const ids = [...new Set(expense.involvedFamilyIds?.length ? expense.involvedFamilyIds : expense.allocationMode ? [] : familyIds)].sort();
  if (!ids.length) return {};
  const share = Math.floor(amount / ids.length), remainder = amount % ids.length;
  return Object.fromEntries(ids.map((id, index) => [id, (share + (index < remainder ? 1 : 0)) / 100]));
}
export function calculateFamilyShares(families: Pick<TripFamily, 'id'>[], expenses: TripExpense[], currency: CurrencyCode): FamilyBalance {
  const cents: FamilyBalance = Object.fromEntries(families.map(f => [f.id, 0]));
  for (const expense of expenses) {
    if (expense.currency !== currency) continue;
    for (const [id, share] of Object.entries(expenseShares(families.map(f => f.id), expense))) cents[id] = (cents[id] ?? 0) + Math.round(share * 100);
  }
  return Object.fromEntries(Object.entries(cents).map(([id, amount]) => [id, amount / 100]));
}
export function totalPurchaseAmount(expenses: TripExpense[], currency: CurrencyCode): number {
  return expenses.filter(e => e.type !== 'settlement' && e.currency === currency && Number.isFinite(e.amount) && e.amount > 0)
    .reduce((sum, e) => sum + Math.round(e.amount * 100), 0) / 100;
}

/** All arithmetic uses integer cents. Remainders go to sorted participant IDs. */
export function calculateFamilyBalances(families: TripFamily[], expenses: TripExpense[], currency?: CurrencyCode): FamilyBalance {
  const cents: FamilyBalance = Object.fromEntries(families.map(f => [f.id, 0]));
  const add = (id: string, value: number) => { cents[id] = (cents[id] ?? 0) + value; };
  for (const e of expenses) {
    if (currency && e.currency !== currency) continue;
    const amount = Math.round(e.amount * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0 || !e.paidByFamilyId) continue;
    if (e.type === 'settlement') {
      const from = e.settlementFromFamilyId ?? e.paidByFamilyId;
      const to = e.settlementToFamilyId ?? e.involvedFamilyIds?.[0];
      if (!to || from === to) continue;
      add(from, amount); add(to, -amount);
    } else {
      const shares = expenseShares(families.map(f => f.id), e);
      if (!Object.keys(shares).length) continue;
      add(e.paidByFamilyId, amount);
      for (const [id, share] of Object.entries(shares)) add(id, -Math.round(share * 100));
    }
  }
  return Object.fromEntries(Object.entries(cents).map(([id, value]) => [id, value / 100]));
}
export function calculateDebts(_families: TripFamily[], balances: FamilyBalance): DebtLine[] {
  const entries = Object.entries(balances).map(([familyId, amount]) => ({ familyId, amount: Math.round(amount * 100) }));
  const creditors = entries.filter(e => e.amount > 0);
  const debtors = entries.filter(e => e.amount < 0).map(e => ({ ...e, amount: -e.amount }));
  const result: DebtLine[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    result.push({ fromFamilyId: debtors[i].familyId, toFamilyId: creditors[j].familyId, amount: amount / 100 });
    debtors[i].amount -= amount; creditors[j].amount -= amount;
    if (!debtors[i].amount) i++;
    if (!creditors[j].amount) j++;
  }
  return result;
}
