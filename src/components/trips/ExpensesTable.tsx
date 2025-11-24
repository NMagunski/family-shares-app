import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import Card from '@/components/ui/Card';
import AddExpenseForm from './AddExpenseForm';

type NewExpenseInput = {
  paidByFamilyId: string;
  involvedFamilyIds: string[];
  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;
};

type ExpensesTableProps = {
  families: TripFamily[];
  expenses: TripExpense[];
  onAddExpense?: (expense: NewExpenseInput) => void;
};

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  families,
  expenses,
  onAddExpense,
}) => {
  function handleAdd(expense: NewExpenseInput) {
    if (!onAddExpense) return;
    onAddExpense(expense);
  }

  return (
    <Card className="bg-eco-surface">
      {/* Форма за добавяне на разход */}
      <AddExpenseForm
        families={families.map((f) => ({ id: f.id, name: f.name }))}
        onAdd={handleAdd}
      />

      {/* Списък с разходи */}
      {expenses.length === 0 ? (
        <p className="mt-3 text-sm text-eco-text-muted">
          Все още няма разходи.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-eco-border/60">
                <th className="py-2 pr-4 text-left text-eco-text-muted font-medium">
                  Платено от
                </th>
                <th className="py-2 pr-4 text-left text-eco-text-muted font-medium">
                  Сума
                </th>
                <th className="py-2 pr-4 text-left text-eco-text-muted font-medium">
                  Коментар
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => {
                const family = families.find((f) => f.id === exp.paidByFamilyId);
                return (
                  <tr
                    key={exp.id}
                    className="border-b border-eco-border/40 last:border-b-0"
                  >
                    <td className="py-2 pr-4 text-eco-text">
                      {family?.name ?? '—'}
                    </td>
                    <td className="py-2 pr-4 text-eco-text">
                      {exp.amount.toFixed(2)} {exp.currency}
                    </td>
                    <td className="py-2 pr-4 text-eco-text-muted">
                      {exp.comment || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default ExpensesTable;
