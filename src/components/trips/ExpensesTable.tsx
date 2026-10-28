import React from 'react';
import type { TripExpense, TripFamily } from '@/types/trip';
import AddExpenseForm, { type BaseExpenseInput } from './AddExpenseForm';
import { Info, Receipt, ArrowRightLeft } from 'lucide-react';
import { getCurrencySymbol, type CurrencyCode } from '@/lib/currencies';
import { expenseHistory } from '@/lib/expenseHistory';
import { expenseShares } from '@/lib/expenses';
import Button from '@/components/ui/Button';
type Props = {
  families: TripFamily[]; expenses: TripExpense[]; tripCurrency: CurrencyCode;
  onAddExpense: (expense: BaseExpenseInput) => Promise<void>;
  onUpdateExpense: (id: string, expense: BaseExpenseInput) => Promise<void>;
  onDeleteExpense: (id: string) => void;
};
const PAGE_SIZE = 10;
export default function ExpensesTable({ families, expenses, tripCurrency, onAddExpense, onUpdateExpense, onDeleteExpense }: Props) {
  const [editing, setEditing] = React.useState<TripExpense | null>(null);
  const [infoId, setInfoId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageExpenses = expenses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return <div className="space-y-4">
    <details id="expense-entry" className="rounded-2xl border border-eco-border p-4"><summary className="cursor-pointer font-semibold text-eco-accent">Добави разход или погасяване</summary>
      <AddExpenseForm families={families} tripCurrency={tripCurrency} onAdd={async input => { await onAddExpense(input); setPage(1); }}/>
    </details>
    {editing && <section aria-label="Редакция на разход"><AddExpenseForm key={editing.id} families={families} tripCurrency={tripCurrency} initialExpense={editing} onCancel={() => setEditing(null)} onAdd={async input => { await onUpdateExpense(editing.id, input); setEditing(null); }}/></section>}
    {!expenses.length ? <p className="text-sm text-eco-text-muted">Все още няма разходи.</p> : <ul className="space-y-3" aria-label="История на разходите">
      {pageExpenses.map(expense => {
        const history = expenseHistory(expense, families), symbol = getCurrencySymbol(expense.currency);
        const shares = expenseShares(families.map(f => f.id), expense);
        const infoOpen = infoId === expense.id;
        return <li key={expense.id} className="expense-record rounded-2xl border border-eco-border bg-eco-surface p-4">
          <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3 min-w-0">
            <span className="rounded-xl bg-eco-surface-soft p-2 text-eco-accent" aria-hidden="true">{expense.type === 'settlement' ? <ArrowRightLeft size={18}/> : <Receipt size={18}/>}</span>
            <div className="min-w-0"><p className="font-medium break-words">{history.sentence}</p><span className="mt-2 inline-block rounded-full bg-eco-surface-soft px-3 py-1 text-xs text-eco-accent">{history.label}</span>{expense.comment && <p className="mt-2 text-sm text-eco-text-muted break-words">{expense.comment}</p>}</div>
          </div></div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" type="button" aria-expanded={infoOpen} aria-controls={`expense-${expense.id}-details`} onClick={() => setInfoId(infoOpen ? null : expense.id)}><Info size={16}/>Детайли</Button>
            <Button variant="secondary" type="button" onClick={() => setEditing(expense)}>Редактирай</Button>
            <Button variant="danger" type="button" onClick={() => { if (window.confirm('Сигурен ли си, че искаш да изтриеш този разход?')) void onDeleteExpense(expense.id); }}>Изтрий</Button>
          </div>
          {infoOpen && <div id={`expense-${expense.id}-details`} className="mt-3 border-t border-eco-border pt-3 text-sm text-eco-text-muted">
            <p>Платено от: {families.find(f => f.id === expense.paidByFamilyId)?.name ?? 'Предишно семейство'}</p>
            {expense.createdAt && <p>Добавен: {new Date(expense.createdAt).toLocaleString('bg-BG')}</p>}
            {expense.type !== 'settlement' && <><p className="mt-2 font-medium">Дялове</p>{[...new Set([...Object.keys(shares), expense.paidByFamilyId])].map(id => <p key={id} className="flex justify-between gap-3"><span>{families.find(f => f.id === id)?.name ?? 'Предишно семейство'}</span><span className="tabular-nums">{(shares[id] ?? 0).toFixed(2)} {symbol}</span></p>)}</>}
          </div>}
        </li>;
      })}
    </ul>}
    {totalPages > 1 && <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Страници с разходи"><Button variant="secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Предишни</Button><span className="text-sm text-eco-text-muted">Страница {currentPage} / {totalPages} · {expenses.length} записа</span><Button variant="secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Следващи</Button></nav>}
  </div>;
}
