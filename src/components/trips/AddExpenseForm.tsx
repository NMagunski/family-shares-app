import React from 'react';
import styles from './AddExpenseForm.module.css';
import Button from '@/components/ui/Button';

type Props = {
  families: { id: string; name: string }[];
  onAdd: (expense: {
    paidByFamilyId: string;
    involvedFamilyIds: string[];
    amount: number;
    currency: 'BGN' | 'EUR';
    comment?: string;
  }) => void;
};

const AddExpenseForm: React.FC<Props> = ({ families, onAdd }) => {
  const [paidBy, setPaidBy] = React.useState('');
  const [involved, setInvolved] = React.useState<string[]>([]);
  const [amount, setAmount] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [currency, setCurrency] = React.useState<'BGN' | 'EUR'>('BGN');

  function toggleInvolved(id: string) {
    setInvolved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paidBy || involved.length === 0 || !amount) return;

    onAdd({
      paidByFamilyId: paidBy,
      involvedFamilyIds: involved,
      amount: parseFloat(amount),
      currency,
      comment,
    });

    // reset
    setPaidBy('');
    setInvolved([]);
    setAmount('');
    setComment('');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.heading}>Добави нов разход</h3>

      {/* ПЛАТЕНО ОТ */}
      <label className={styles.label}>Платено от</label>
      <select
        className={styles.select}
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
      >
        <option value="">Избери семейство</option>
        {families.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      {/* РАЗПРЕДЕЛЕН МЕЖДУ */}
      <label className={styles.label}>Разпределено между</label>
      <div className={styles.checklist}>
        {families.map((f) => (
          <label key={f.id} className={styles.checkItem}>
            <input
              type="checkbox"
              checked={involved.includes(f.id)}
              onChange={() => toggleInvolved(f.id)}
            />
            {f.name}
          </label>
        ))}
      </div>

      {/* СУМА */}
      <label className={styles.label}>Сума</label>
      <div className={styles.amountRow}>
        <input
          type="number"
          className={styles.amountInput}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
        <select
          className={styles.currency}
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'BGN' | 'EUR')}
        >
          <option value="BGN">лв</option>
          <option value="EUR">€</option>
        </select>
      </div>

      {/* КОМЕНТАР */}
      <label className={styles.label}>Коментар (по избор)</label>
      <input
        className={styles.input}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="пример: вечеря, бензин, хот-дог..."
      />
<Button type="submit" style={{ width: '100%' }}>
  Добави разход
</Button>
    </form>
  );
};

export default AddExpenseForm;
