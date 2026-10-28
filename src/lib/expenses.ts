import type { TripFamily, TripExpense } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';
export type FamilyBalance = Record<string, number>;
export type DebtLine = { fromFamilyId: string; toFamilyId: string; amount: number };

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
      const ids = [...new Set(e.involvedFamilyIds?.length ? e.involvedFamilyIds : families.map(f => f.id))].sort();
      if (!ids.length) continue;
      add(e.paidByFamilyId, amount);
      const share = Math.floor(amount / ids.length), remainder = amount % ids.length;
      ids.forEach((id, i) => add(id, -share - (i < remainder ? 1 : 0)));
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
