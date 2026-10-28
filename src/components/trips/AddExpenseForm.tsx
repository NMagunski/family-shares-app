import React from 'react';
import type { CurrencyCode } from '@/lib/currencies';
import { getCurrencySymbol } from '@/lib/currencies';
import type { ExpenseInput } from '@/lib/expensesStore';
import type { TripExpense } from '@/types/trip';
import { allocationForSave, allocationModeForExpense, type AllocationMode } from '@/lib/expenseAllocation';
import Button from '@/components/ui/Button';
import { expenseShares } from '@/lib/expenses';

export type BaseExpenseInput = ExpenseInput;
type Props = {
  families: { id: string; name: string }[];
  tripCurrency: CurrencyCode;
  onAdd: (expense: BaseExpenseInput) => Promise<void>;
  initialExpense?: TripExpense;
  onCancel?: () => void;
};
const fieldClass = 'w-full rounded-xl border border-eco-border bg-eco-surface-soft px-3 py-2 text-base text-eco-text';
export default function AddExpenseForm({ families, tripCurrency, onAdd, initialExpense, onCancel }: Props) {
  const formId = React.useId();
  const original = React.useRef(initialExpense).current;
  const [saving, setSaving] = React.useState(false), [status, setStatus] = React.useState('');
  const savingRef = React.useRef(false), requestId = React.useRef<string | null>(null);
  const [paidBy, setPaidBy] = React.useState(original?.paidByFamilyId ?? '');
  const [involved, setInvolved] = React.useState<string[]>(original?.involvedFamilyIds ?? []);
  const [mode, setMode] = React.useState<AllocationMode>(original ? allocationModeForExpense(original) : 'all');
  const [allocationChanged, setAllocationChanged] = React.useState(false);
  const [amount, setAmount] = React.useState(original ? String(original.amount) : '');
  const [comment, setComment] = React.useState(original?.comment ?? '');
  const [isSettlement, setIsSettlement] = React.useState(original?.type === 'settlement');
  const [settlementTo, setSettlementTo] = React.useState(original?.settlementToFamilyId ?? (original?.type === 'settlement' ? original.involvedFamilyIds?.[0] ?? '' : ''));
  const currency = original?.currency ?? tripCurrency, symbol = getCurrencySymbol(currency);
  const allIds = families.map(f => f.id);
  let allocation: ReturnType<typeof allocationForSave> | null = null;
  try { allocation = allocationForSave(mode, involved, allIds, original, allocationChanged || !original); } catch { /* Shown on submit; empty explicit selection has no preview. */ }
  const shares = !isSettlement && allocation && Number(amount) > 0
    ? expenseShares(allIds, { ...allocation, amount: Number(amount), type: 'expense' }) : {};
  function reset() {
    setPaidBy(''); setInvolved([]); setMode('all'); setAllocationChanged(false);
    setAmount(''); setComment(''); setIsSettlement(false); setSettlementTo('');
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (savingRef.current) return; setStatus('');
    try {
      const numericAmount = Number(amount);
      if (!paidBy || !Number.isFinite(numericAmount) || numericAmount <= 0 || Math.abs(numericAmount * 100 - Math.round(numericAmount * 100)) > .00001) throw new Error('Избери платец и въведи сума с най-много две цифри след запетаята.');
      if (isSettlement && (!settlementTo || settlementTo === paidBy)) throw new Error('Избери друго семейство за получател на погасяването.');
      const payload: BaseExpenseInput = {
        paidByFamilyId: paidBy, amount: numericAmount, currency, comment,
        ...(isSettlement ? { involvedFamilyIds: [], type: 'settlement' as const, settlementFromFamilyId: paidBy, settlementToFamilyId: settlementTo }
          : { ...allocationForSave(mode, involved, allIds, original, allocationChanged || !original || original.type === 'settlement'), type: 'expense' as const }),
      };
      savingRef.current = true; setSaving(true);
      if (!original) { requestId.current ??= crypto.randomUUID(); payload.requestId = requestId.current; }
      await onAdd(payload);
      requestId.current = null;
      if (!original) reset();
      setStatus('✓ Разходът е записан.');
    } catch (err) { setStatus(err instanceof Error ? err.message : 'Записът не успя. Данните са запазени — опитай отново.'); }
    finally { savingRef.current = false; setSaving(false); }
  }
  function changeMode(value: AllocationMode) {
    setMode(value); setAllocationChanged(true); setStatus('');
    if (value === 'single') setInvolved([]);
  }
  return <form onSubmit={submit} className="expense-form my-4 flex flex-col gap-4 rounded-2xl border border-eco-border bg-eco-surface p-4 shadow-eco-soft">
    <fieldset disabled={saving} className="contents">
      <h3 className="text-lg font-semibold">{original ? 'Редактирай разход' : 'Добави нов разход'}</h3>
      <label htmlFor={`${formId}-payer`}>Платено от</label>
      <select autoFocus={!!original} id={`${formId}-payer`} className={fieldClass} value={paidBy} onChange={e => setPaidBy(e.target.value)} required>
        <option value="">Избери семейство</option>
        {paidBy && !allIds.includes(paidBy) && <option value={paidBy}>Предишно семейство</option>}
        {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <label className="flex items-start gap-3 rounded-xl bg-eco-surface-soft p-3">
        <input type="checkbox" className="mt-1" checked={isSettlement} onChange={e => { setIsSettlement(e.target.checked); if (original?.type === 'settlement') setAllocationChanged(true); }}/>
        <span>Пито платено <span className="block text-sm text-eco-text-muted">Погасяване на дълг — не увеличава общите покупки.</span></span>
      </label>
      {!isSettlement ? <fieldset className="grid gap-3">
        <legend className="mb-3 font-medium">За кого е разходът?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {([['all','За всички'],['selected','За избрани семейства'],['single','За едно семейство']] as const).map(([value,label]) => <label key={value} className={`flex items-center gap-2 rounded-xl border p-3 transition-colors ${mode === value ? 'border-eco-accent bg-eco-surface-soft' : 'border-eco-border'}`}>
            <input type="radio" name={`${formId}-mode`} value={value} checked={mode === value} onChange={() => changeMode(value)}/>{label}
          </label>)}
        </div>
        <p className="text-sm text-eco-text-muted">{mode === 'all' ? 'Поравно между всички семейства.' : mode === 'single' ? 'Цялата сума е за избраното семейство.' : 'Поравно само между избраните. Избери поне едно семейство.'} Платецът участва само ако е сред тях.</p>
        {mode === 'single' && <label className="grid gap-2">Семейство, което поема разхода<select className={fieldClass} required value={involved[0] ?? ''} onChange={e => { setInvolved(e.target.value ? [e.target.value] : []); setAllocationChanged(true); }}>
          <option value="">Избери семейство</option>
          {involved[0] && !allIds.includes(involved[0]) && <option value={involved[0]}>Предишно семейство</option>}
          {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select></label>}
        {mode === 'selected' && families.map(f => <label key={f.id} className="flex items-center gap-3 rounded-xl border border-eco-border p-3">
          <input type="checkbox" checked={involved.includes(f.id)} onChange={e => { setAllocationChanged(true); setInvolved(ids => e.target.checked ? [...ids, f.id] : ids.filter(id => id !== f.id)); }}/>{f.name}
        </label>)}
        {original && !allocationChanged && <p className="text-xs text-eco-text-muted">Запазваме първоначалното разпределяне. За нов избор използвай режимите по-горе.</p>}
      </fieldset> : <label className="grid gap-2">Към кое семейство е плащането?<select className={fieldClass} required value={settlementTo} onChange={e => setSettlementTo(e.target.value)}>
        <option value="">Избери семейство</option>{families.map(f => <option key={f.id} value={f.id} disabled={f.id === paidBy}>{f.name}</option>)}
      </select></label>}
      <label htmlFor={`${formId}-amount`}>Сума · {symbol} ({currency})</label>
      <input id={`${formId}-amount`} className={fieldClass} type="number" min="0.01" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"/>
      {!isSettlement && Object.keys(shares).length > 0 && <div className="rounded-xl bg-eco-surface-soft p-3 text-sm" aria-live="polite"><p className="font-medium mb-2">Кой поема разхода</p>{[...new Set([...Object.keys(shares), ...(paidBy ? [paidBy] : [])])].map(id => <p key={id} className="flex justify-between gap-3"><span>{families.find(f => f.id === id)?.name ?? 'Предишно семейство'}{id === paidBy ? ' (платец)' : ''}</span><span className="tabular-nums">{(shares[id] ?? 0).toFixed(2)} {symbol}</span></p>)}</div>}
      <label htmlFor={`${formId}-comment`}>Коментар (по избор)</label>
      <input id={`${formId}-comment`} className={fieldClass} value={comment} onChange={e => setComment(e.target.value)} maxLength={2000}/>
      <div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving}>{saving ? 'Запазване…' : original ? 'Запази промените' : isSettlement ? 'Запиши погасяване' : 'Добави разход'}</Button>{onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Отказ</Button>}</div>
    </fieldset>
    <p role="status" aria-live="polite">{status}</p>
  </form>;
}
