import type { TripExpense, TripFamily } from '@/types/trip';
import { getCurrencySymbol } from '@/lib/currencies';
export function expenseHistory(expense: TripExpense, families: Pick<TripFamily, 'id' | 'name'>[]): { sentence: string; label: string } {
  const name = (id?: string) => families.find(f => f.id === id)?.name ?? 'Предишно семейство';
  const amount = `${expense.amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${getCurrencySymbol(expense.currency)}`;
  if (expense.type === 'settlement') return {
    sentence: `${name(expense.settlementFromFamilyId ?? expense.paidByFamilyId)} върнаха ${amount} на ${name(expense.settlementToFamilyId ?? expense.involvedFamilyIds?.[0])}`,
    label: 'Пито платено · погасяване на дълг',
  };
  const ids = [...new Set(expense.involvedFamilyIds ?? [])];
  const recipients = ids.length ? ids.map(name).join(', ') : 'всички семейства';
  return {
    sentence: `${name(expense.paidByFamilyId)} платиха ${amount} за ${recipients}`,
    label: ids.length === 1 ? `Само за ${recipients}` : expense.allocationMode === 'all' || !ids.length ? 'За всички · поравно' : `За избрани семейства · ${recipients}`,
  };
}
