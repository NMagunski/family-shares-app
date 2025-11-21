import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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

const ExpensesTable: React.FC<ExpensesTableProps> = ({ families, expenses, onAddExpense }) => {
  const [paidByFamilyId, setPaidByFamilyId] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [comment, setComment] = React.useState<string>('');
  const [involvedFamilyIds, setInvolvedFamilyIds] = React.useState<string[]>([]);

  // по подразбиране: всички семейства участват
  React.useEffect(() => {
    if (families.length > 0 && involvedFamilyIds.length === 0) {
      setInvolvedFamilyIds(families.map((f) => f.id));
    }
  }, [families, involvedFamilyIds.length]);

  function toggleFamilyInvolved(id: string) {
    setInvolvedFamilyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!paidByFamilyId || !amount) return;
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    if (!onAddExpense) return;

    onAddExpense({
      paidByFamilyId,
      involvedFamilyIds,
      amount: parsed,
      currency: 'BGN',
      comment,
    });

    setAmount('');
    setComment('');
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 8 }}>Разходи</h2>
      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}
      >
        <Select
          label="Платено от"
          value={paidByFamilyId}
          onChange={(e) => setPaidByFamilyId(e.target.value)}
          required
        >
          <option value="">-- Избери семейство --</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>

        <Input
          label="Сума"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Коментар"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="напр. Вечеря, гориво..."
        />

        <div>
          <p style={{ fontSize: '0.9rem', marginBottom: 4 }}>Разделя се между:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {families.map((f) => (
              <label key={f.id} style={{ fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={involvedFamilyIds.includes(f.id)}
                  onChange={() => toggleFamilyInvolved(f.id)}
                  style={{ marginRight: 4 }}
                />
                {f.name}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">Добави разход</Button>
      </form>

      {expenses.length === 0 ? (
        <p>Все още няма разходи.</p>
      ) : (
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Платено от</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Сума</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Коментар</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              const family = families.find((f) => f.id === exp.paidByFamilyId);
              return (
                <tr key={exp.id}>
                  <td style={{ padding: '4px 0' }}>{family?.name ?? '—'}</td>
                  <td style={{ padding: '4px 0' }}>
                    {exp.amount.toFixed(2)} {exp.currency}
                  </td>
                  <td style={{ padding: '4px 0' }}>{exp.comment}</td>
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
