import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import { calculateFamilyBalances, calculateDebts } from '@/lib/expenses';

type DebtsSummaryProps = {
  families: TripFamily[];
  expenses: TripExpense[];
};

const DebtsSummary: React.FC<DebtsSummaryProps> = ({ families, expenses }) => {
  if (families.length === 0 || expenses.length === 0) {
    return null;
  }

  // balances: net баланс на всяко семейство (плюс/минус)
  const balances = calculateFamilyBalances(
    families,
    expenses
  ) as Record<string, number>;
  const debts = calculateDebts(families, balances);

  function getFamilyName(id: string): string {
    return families.find((f) => f.id === id)?.name ?? id;
  }

  if (debts.length === 0) {
    return (
      <p className="text-sm text-eco-text">
        Всички семейства са изчистили сметките си. 🎉
      </p>
    );
  }

  // Подготвяме тоталите по семейства
  const familyTotals = families.map((f) => {
    const balance = balances[f.id] ?? 0;
    return {
      id: f.id,
      name: f.name,
      balance,
    };
  });

  return (
    <div className="space-y-3">
      {/* малко обобщение */}
      <p className="text-xs text-eco-text-muted">
        {debts.length === 1
          ? 'Има 1 разплащане между семейства.'
          : `Има ${debts.length} разплащания между семейства.`}
      </p>

      {/* Баланс по семейства */}
      <div className="rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2">
        <p className="text-xs font-semibold text-eco-text mb-1.5">
          Баланс по семейства
        </p>
        <ul className="space-y-1 text-xs sm:text-sm text-eco-text-muted">
          {familyTotals.map((f) => {
            const balance = f.balance;
            const absStr = Math.abs(balance).toFixed(2);

            let badgeText = 'изравнени (0.00 лв)';
            let badgeClass =
              'px-1.5 py-0.5 rounded-md text-[11px] bg-eco-surface text-eco-text-muted border border-eco-border';

            if (balance > 0.005) {
              badgeText = `+${absStr} лв (трябва да получат)`;
              badgeClass =
                'px-1.5 py-0.5 rounded-md text-[11px] bg-emerald-600/10 text-emerald-600 border border-emerald-500/40';
            } else if (balance < -0.005) {
              badgeText = `-${absStr} лв (трябва да дадат)`;
              badgeClass =
                'px-1.5 py-0.5 rounded-md text-[11px] bg-red-600/8 text-red-500 border border-red-500/30';
            }

            return (
              <li
                key={f.id}
                className="flex items-center justify-between gap-2 leading-snug"
              >
                <span className="text-eco-text font-medium truncate">
                  {f.name}
                </span>
                <span className={badgeClass}>{badgeText}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Конкретните разплащания */}
      <ul className="space-y-1.5 text-sm text-eco-text-muted">
        {debts.map((d, idx) => (
          <li key={idx} className="leading-snug">
            <span className="text-eco-text font-medium">
              {getFamilyName(d.fromFamilyId)}
            </span>{' '}
            дължат{' '}
            <span className="text-eco-accent font-semibold">
              {d.amount.toFixed(2)} лв
            </span>{' '}
            на{' '}
            <span className="text-eco-text font-medium">
              {getFamilyName(d.toFamilyId)}
            </span>
            .
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DebtsSummary;
