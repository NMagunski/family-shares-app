import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
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
  onAddExpense?: (expense: NewExpenseInput) => void | Promise<void>;
  onUpdateExpense?: (
    expenseId: string,
    expense: NewExpenseInput
  ) => void | Promise<void>;
};

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  families,
  expenses,
  onAddExpense,
  // оставяме onUpdateExpense за бъдеща редакция на разходи
}) => {
  function handleAdd(expense: NewExpenseInput) {
    if (!onAddExpense) return;
    onAddExpense(expense);
  }

  return (
    <div className="space-y-4">
      {/* Форма за добавяне на разход */}
      <AddExpenseForm
        families={families.map((f) => ({ id: f.id, name: f.name }))}
        onAdd={handleAdd}
      />

      {/* Списък с разходи */}
      {expenses.length === 0 ? (
        <p className="text-sm text-eco-text-muted">
          Все още няма разходи.
        </p>
      ) : (
        <div className="mt-1">
          {/* DESKTOP таблица */}
          <div className="hidden md:block overflow-x-auto">
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

          {/* MOBILE „карти“ */}
          <div className="md:hidden space-y-3 mt-1">
            {expenses.map((exp) => {
              const family = families.find((f) => f.id === exp.paidByFamilyId);

              return (
                <div
                  key={exp.id}
                  className="
                    p-4 rounded-xl 
                    bg-eco-surface-soft border border-eco-border 
                    shadow-eco-soft
                    flex flex-col gap-2
                  "
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-eco-text-muted">Платено от:</span>
                    <span className="font-medium text-eco-text">
                      {family?.name ?? '—'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-eco-text-muted">Сума:</span>
                    <span className="font-medium text-eco-text">
                      {exp.amount.toFixed(2)} {exp.currency}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-eco-text-muted">Коментар:</span>
                    <span className="text-eco-text-muted">
                      {exp.comment || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTable;
