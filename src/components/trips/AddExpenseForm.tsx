import React from 'react';

type BaseExpenseInput = {
  paidByFamilyId: string;
  involvedFamilyIds: string[];
  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;
  // 🆕 за "Пито платено"
  type?: 'expense' | 'settlement';
  settlementFromFamilyId?: string;
  settlementToFamilyId?: string;
};

type Props = {
  families: { id: string; name: string }[];
  onAdd: (expense: BaseExpenseInput) => void;
};

const AddExpenseForm: React.FC<Props> = ({ families, onAdd }) => {
  const [paidBy, setPaidBy] = React.useState('');
  const [involved, setInvolved] = React.useState<string[]>([]);
  const [amount, setAmount] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [currency, setCurrency] = React.useState<'BGN' | 'EUR'>('BGN');

  // 🆕 състояние за "Пито платено"
  const [isSettlement, setIsSettlement] = React.useState(false);
  const [settlementTo, setSettlementTo] = React.useState('');

  function toggleInvolved(id: string) {
    setInvolved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function resetForm() {
    setPaidBy('');
    setInvolved([]);
    setAmount('');
    setComment('');
    setIsSettlement(false);
    setSettlementTo('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (!paidBy || !amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    // ако е нормален разход → трябва да има поне едно семейство
    if (!isSettlement && involved.length === 0) {
      return;
    }

    // ако е "Пито платено" → трябва да знаем към кое семейство
    if (isSettlement) {
      if (!settlementTo || settlementTo === paidBy) {
        return;
      }

      const payload: BaseExpenseInput = {
        paidByFamilyId: paidBy,
        // за settlement не ни трябват involved в сметките, затова може да е празен масив
        involvedFamilyIds: [],
        amount: numericAmount,
        currency,
        comment,
        type: 'settlement',
        settlementFromFamilyId: paidBy,
        settlementToFamilyId: settlementTo,
      };

      onAdd(payload);
      resetForm();
      return;
    }

    // нормален разход
    const payload: BaseExpenseInput = {
      paidByFamilyId: paidBy,
      involvedFamilyIds: involved,
      amount: numericAmount,
      currency,
      comment,
      type: 'expense',
    };

    onAdd(payload);
    resetForm();
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

      {/* 🆕 Чекбокс "Пито платено" */}
      <div className="mt-1 flex items-start gap-2 rounded-lg bg-eco-surface-soft px-3 py-2 border border-eco-border">
        <input
          id="settlement"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-eco-border text-eco-accent focus:ring-eco-accent"
          checked={isSettlement}
          onChange={(e) => {
            const checked = e.target.checked;
            setIsSettlement(checked);
            if (checked) {
              // при преминаване към "Пито платено" не ни трябва избора "разпределено между"
              setInvolved([]);
            } else {
              setSettlementTo('');
            }
          }}
        />
        <label
          htmlFor="settlement"
          className="flex flex-col text-xs sm:text-sm text-eco-text"
        >
          <span className="font-medium">Пито платено (погасяване на дълг)</span>
          <span className="text-eco-text-muted">
            Използвай това, когато едно семейство реално е платило на друго и
            искаш да занулиш кой на кого колко дължи.
          </span>
        </label>
      </div>

      {/* Разпределено между (само за нормален разход) */}
      {!isSettlement && (
        <>
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
        </>
      )}

      {/* Към кое семейство е плащането (само за "Пито платено") */}
      {isSettlement && (
        <>
          <label className="text-sm font-medium text-eco-text-muted">
            Към кое семейство е плащането?
          </label>
          <select
            className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
            value={settlementTo}
            onChange={(e) => setSettlementTo(e.target.value)}
          >
            <option value="">Избери семейство</option>
            {families.map((f) => (
              <option key={f.id} value={f.id} disabled={f.id === paidBy}>
                {f.name}
                {f.id === paidBy ? ' (същото семейство)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-eco-text-muted">
            Това трябва да е семейството, към което реално е направено плащането
            (на което сте върнали парите).
          </p>
        </>
      )}

      {/* Сума */}
      <label className="text-sm font-medium text-eco-text-muted">Сума</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
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
        placeholder={
          isSettlement
            ? 'пример: пито платено за дълг към Петрови...'
            : 'пример: вечеря, бензин, хот-дог...'
        }
        className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-eco-accent-strong px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-eco-accent transition"
      >
        {isSettlement ? '✅ Добави „Пито платено“' : '➕ Добави разход'}
      </button>
    </form>
  );
};

export default AddExpenseForm;
