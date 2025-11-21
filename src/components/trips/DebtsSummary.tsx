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

  if (debts.length === 0) {
    return (
      <Card>
        <p>Всички семейства са изчистили сметките си. 🎉</p>
      </Card>
    );
  }

  function getFamilyName(id: string): string {
    return families.find((f) => f.id === id)?.name ?? id;
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 8 }}>Кой на кого колко дължи</h2>
      <ul style={{ paddingLeft: 16 }}>
        {debts.map((d, idx) => (
          <li key={idx}>
            {getFamilyName(d.fromFamilyId)} дължат {d.amount.toFixed(2)} лв на{' '}
            {getFamilyName(d.toFamilyId)}.
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default DebtsSummary;
