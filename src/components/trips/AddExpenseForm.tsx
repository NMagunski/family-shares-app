import React from 'react';
import type { CurrencyCode } from '@/lib/currencies';
import { getCurrencySymbol } from '@/lib/currencies';

// 👇 export за базовия input
export type BaseExpenseInput = {
  requestId?: string;
  paidByFamilyId: string;
  involvedFamilyIds: string[];
  amount: number;
  currency: CurrencyCode;
  comment?: string;
  type?: 'expense' | 'settlement';
  settlementFromFamilyId?: string;
  settlementToFamilyId?: string;
};

type Props = {
  families: { id: string; name: string }[];
  // ❗ вече задължителна – винаги трябва да знаем валутата на пътуването
  tripCurrency: CurrencyCode;
  onAdd: (expense: BaseExpenseInput) => Promise<void>;
};

const AddExpenseForm: React.FC<Props> = ({
  families,
  tripCurrency,
  onAdd,
}) => {
  const formId = React.useId();
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const requestId = React.useRef<string | null>(null);
  const savingRef = React.useRef(false);
  async function save(payload: BaseExpenseInput) {
    savingRef.current = true; setSaving(true); setStatus('');
    try { requestId.current ??= crypto.randomUUID(); await onAdd({ ...payload, requestId: requestId.current }); requestId.current = null; resetForm(); setStatus('✓ Разходът е записан.'); }
    catch { setStatus('Записът не успя. Данните са запазени — опитай отново.'); }
    finally { savingRef.current = false; setSaving(false); }
  }
  const [paidBy, setPaidBy] = React.useState('');
  const [involved, setInvolved] = React.useState<string[]>([]);
  const [amount, setAmount] = React.useState('');
  const [comment, setComment] = React.useState('');

  // състояние за "Пито платено"
  const [isSettlement, setIsSettlement] = React.useState(false);
  const [settlementTo, setSettlementTo] = React.useState('');

  // ❗ НЯМА fallback към EUR тук – винаги ползваме валутата на пътуването
  const effectiveCurrency: CurrencyCode = tripCurrency;
  const currencySymbol = getCurrencySymbol(effectiveCurrency);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;

    const numericAmount = parseFloat(amount);
    if (!paidBy || !amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    // 👉 Пито платено
    if (isSettlement) {
      if (!settlementTo || settlementTo === paidBy) {
        return;
      }

      const payload: BaseExpenseInput = {
        paidByFamilyId: paidBy,
        involvedFamilyIds: [],
        amount: numericAmount,
        currency: effectiveCurrency,
        comment,
        type: 'settlement',
        settlementFromFamilyId: paidBy,
        settlementToFamilyId: settlementTo,
      };

      await save(payload);
      return;
    }

    // 👉 Нормален разход
    let finalInvolved = [...involved];

    if (finalInvolved.length === 0) {
      finalInvolved = families.map((f) => f.id);
    }


    const payload: BaseExpenseInput = {
      paidByFamilyId: paidBy,
      involvedFamilyIds: finalInvolved,
      amount: numericAmount,
      currency: effectiveCurrency,
      comment,
      type: 'expense',
    };

    await save(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 mb-6 flex flex-col gap-4 rounded-xl bg-eco-surface p-4 shadow-eco-soft"
    >
      <fieldset disabled={saving} className="contents">
      <h3 className="text-lg font-semibold text-eco-text">Добави нов разход</h3>

      {/* Платено от */}
      <label htmlFor={`${formId}-payer`} className="text-sm font-medium text-eco-text-muted">
        Платено от
      </label>
      <select
        className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-base sm:text-sm text-eco-text focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
        id={`${formId}-payer`}
        required
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

      {/* Пито платено */}
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

      {/* Разпределено между – клик за маркиране */}
      {!isSettlement && (
        <>
          <label className="text-sm font-medium text-eco-text-muted">
            Разпределено между
          </label>
          <p className="text-xs text-eco-text-muted mb-1">
            Ако не избереш никого, разходът ще се разпредели автоматично между
            всички семейства. Платецът може да бъде изключен от разделянето.
          </p>
          <div className="flex flex-col gap-2">
            {families.map((f) => {
              const selected = involved.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleInvolved(f.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition
                    ${
                      selected
                        ? 'border-eco-accent bg-eco-accent/10 text-eco-text'
                        : 'border-eco-border bg-eco-surface-soft text-eco-text-muted hover:border-eco-accent/60'
                    }`}
                >
                  <span>{f.name}</span>
                  {selected && (
                    <span className="text-xs font-semibold text-eco-accent">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Към кое семейство е плащането (Пито платено) */}
      {isSettlement && (
        <>
          <label htmlFor={`${formId}-recipient`} className="text-sm font-medium text-eco-text-muted">
            Към кое семейство е плащането?
          </label>
          <select
            className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-base sm:text-sm text-eco-text focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
            id={`${formId}-recipient`}
            required
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
      <label htmlFor={`${formId}-amount`} className="text-sm font-medium text-eco-text-muted">Сума</label>
      <div className="flex gap-2 items-center">
        <input
          id={`${formId}-amount`}
          required
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0.01"
          className="flex-1 rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-base sm:text-sm text-eco-text placeholder:text-eco-text-muted focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="min-w-[3.5rem] rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-sm font-medium text-eco-text text-center">
          {currencySymbol}
        </div>
      </div>
      <p className="text-xs text-eco-text-muted">
        Валута на пътуването: {currencySymbol} ({effectiveCurrency}). Всички
        разходи трябва да са в тази валута, за да са коректни сметките.
      </p>

      {/* Коментар */}
      <label htmlFor={`${formId}-comment`} className="text-sm font-medium text-eco-text-muted">
        Коментар (по избор)
      </label>
      <input
        id={`${formId}-comment`}
        placeholder={
          isSettlement
            ? 'пример: пито платено за дълг към Петрови...'
            : 'пример: вечеря, бензин, хот-дог...'
        }
        className="w-full rounded-lg border border-eco-border bg-eco-surface-soft px-3 py-2 text-base sm:text-sm text-eco-text placeholder:text-eco-text-muted focus:border-eco-accent focus:outline-none focus:ring-2 focus:ring-eco-accent"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        disabled={saving}
        className="mt-2 w-full rounded-lg bg-eco-accent-strong px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-eco-accent transition"
      >
        {saving ? 'Запазване…' : isSettlement ? 'Запиши погасяване' : 'Добави разход'}
      </button>
      </fieldset>
      <p role="status" aria-live="polite">{status}</p>
    </form>
  );
};

export default AddExpenseForm;
