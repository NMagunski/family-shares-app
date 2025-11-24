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
    <Card>

      {/* ❗ Премахнахме <h2>Разходи</h2> за да не се дублира */}

      {/* Форма за добавяне на разход */}
      <AddExpenseForm
        families={families.map((f) => ({ id: f.id, name: f.name }))}
        onAdd={handleAdd}
      />

      {/* Списък с разходи */}
      {expenses.length === 0 ? (
        <p style={{ marginTop: 12 }}>Все още няма разходи.</p>
      ) : (
        <table
          style={{
            width: '100%',
            fontSize: '0.9rem',
            borderCollapse: 'collapse',
            marginTop: 12,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '6px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Платено от
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '6px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Сума
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '6px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Коментар
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              const family = families.find((f) => f.id === exp.paidByFamilyId);
              return (
                <tr key={exp.id}>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {family?.name ?? '—'}
                  </td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {exp.amount.toFixed(2)} {exp.currency}
                  </td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {exp.comment}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default ExpensesTable;
