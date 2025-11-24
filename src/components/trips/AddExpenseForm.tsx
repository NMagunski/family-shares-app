import React from 'react';

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

    setPaidBy('');
    setInvolved([]);
    setAmount('');
    setComment('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 mb-6 flex flex-col gap-4 rounded-xl bg-eco-surface p-4 shadow-eco-soft"
    >
      <h3 className="text-lg font-semibold text-eco-text">Добави нов разход</h3>

      {/* Платено от */}
      <label className="text-sm font-medium text-eco-text-muted">
        Платено от
      </label>
      <select
        className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
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

      {/* Разпределено между */}
      <label className="text-sm font-medium text-eco-text-muted">
        Разпределено между
      </label>
      <div className="flex flex-col gap-2">
        {families.map((f) => (
          <label
            key={f.id}
            className="flex items-center gap-2 text-sm text-eco-text"
          >
            <input
              type="checkbox"
              checked={involved.includes(f.id)}
              onChange={() => toggleInvolved(f.id)}
              className="h-4 w-4 rounded border-eco-border bg-eco-surface-soft text-eco-accent focus:ring-eco-accent"
            />
            {f.name}
          </label>
        ))}
      </div>

      {/* Сума */}
      <label className="text-sm font-medium text-eco-text-muted">Сума</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="0.00"
          step="0.01"
          className="flex-1 rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          className="w-20 rounded-lg border border-eco-border bg-eco-surface-soft px-2 py-2 text-sm text-eco-text focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'BGN' | 'EUR')}
        >
          <option value="BGN">лв</option>
          <option value="EUR">€</option>
        </select>
      </div>

      {/* Коментар */}
      <label className="text-sm font-medium text-eco-text-muted">
        Коментар (по избор)
      </label>
      <input
        placeholder="пример: вечеря, бензин, хот-дог..."
        className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-eco-accent-strong px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-eco-accent transition"
      >
        ➕ Добави разход
      </button>
    </form>
  );
};

export default AddExpenseForm;
