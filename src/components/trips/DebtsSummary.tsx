import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import { calculateFamilyBalances, calculateDebts } from '@/lib/expenses';
import Card from '@/components/ui/Card';

type DebtsSummaryProps = {
  families: TripFamily[];
  expenses: TripExpense[];
};

const DebtsSummary: React.FC<DebtsSummaryProps> = ({ families, expenses }) => {
  if (families.length === 0 || expenses.length === 0) {
    return null;
  }

  const balances = calculateFamilyBalances(families, expenses);
  const debts = calculateDebts(families, balances);

  function getFamilyName(id: string): string {
    return families.find((f) => f.id === id)?.name ?? id;
  }

  if (debts.length === 0) {
    return (
      <Card className="bg-eco-surface px-4 py-3 shadow-eco-soft">
        <p className="text-eco-text">Всички семейства са изчистили сметките си. 🎉</p>
      </Card>
    );
  }

  return (
    <Card className="bg-eco-surface px-4 py-4 shadow-eco-soft">
      <h2 className="mb-3 text-lg font-semibold text-eco-text">
        Кой на кого колко дължи
      </h2>

      <ul className="list-disc pl-5 space-y-1 text-eco-text-muted">
        {debts.map((d, idx) => (
          <li key={idx}>
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
    </Card>
  );
};

export default DebtsSummary;
