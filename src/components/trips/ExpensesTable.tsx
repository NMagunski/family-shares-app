import React from 'react';
import type { TripExpense, TripFamily } from '@/types/trip';
import AddExpenseForm, { type BaseExpenseInput } from './AddExpenseForm';
import { ChevronDown, ArrowRightLeft, Users } from 'lucide-react';
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
  function closeEditor() {
    const id = editing?.id;
    setEditing(null);
    // Restore focus to the row that opened the editor.
    if (id) document.getElementById(`expense-${id}-toggle`)?.focus();
  }
  return <div className="min-w-0 space-y-3">
    <details id="expense-entry" className="expense-entry"><summary>Добави разход</summary>
      <AddExpenseForm variant="embedded" showHeading={false} families={families} tripCurrency={tripCurrency} onAdd={async input => { await onAddExpense(input); setPage(1); }}/>
    </details>
    {editing && <section aria-label="Редакция на разход" className="border-b border-eco-border pb-4"><AddExpenseForm variant="embedded" key={editing.id} families={families} tripCurrency={tripCurrency} initialExpense={editing} onCancel={closeEditor} onAdd={async input => { await onUpdateExpense(editing.id, input); closeEditor(); }}/></section>}
    {!expenses.length ? <p className="text-sm text-eco-text-muted">Все още няма разходи.</p> : <ul aria-label="История на разходите">
      {pageExpenses.map(expense => {
        const history = expenseHistory(expense, families), symbol = getCurrencySymbol(expense.currency);
        const shares = expenseShares(families.map(f => f.id), expense);
        const infoOpen = infoId === expense.id;
        const payer = families.find(f => f.id === expense.paidByFamilyId)?.name ?? 'Предишно семейство';
        const otherFamilyOnly = expense.type !== 'settlement' && expense.involvedFamilyIds?.length === 1 && expense.involvedFamilyIds[0] !== expense.paidByFamilyId;
        const amount = `${expense.amount.toLocaleString('bg-BG', {minimumFractionDigits:2, maximumFractionDigits:2})} ${symbol}`;
        return <li key={expense.id} className="expense-record min-w-0 border-b border-eco-border last:border-b-0">
          <button id={`expense-${expense.id}-toggle`} type="button" className="expense-row" aria-label={`${payer}, ${amount}${expense.type === 'settlement' ? ', Пито платено' : otherFamilyOnly ? `, ${history.label}` : ''} — ${infoOpen ? 'Скрий' : 'Покажи'} подробности`} aria-describedby={expense.comment ? `expense-${expense.id}-comment` : undefined} aria-expanded={infoOpen} aria-controls={`expense-${expense.id}-details`} onClick={() => setInfoId(infoOpen ? null : expense.id)}>
            <span className="font-medium min-w-0">{payer}</span>
            <span className="expense-row-amount flex items-start justify-end gap-2 min-w-0"><span className="min-w-0">{amount}</span><ChevronDown aria-hidden="true" size={16} className={`shrink-0 mt-1 transition-transform ${infoOpen ? 'rotate-180' : ''}`}/></span>
            <span className="expense-row-secondary">
              {expense.comment && <span id={`expense-${expense.id}-comment`} className="expense-row-comment">{expense.comment}</span>}
              {expense.type === 'settlement' && <span className="expense-indicator"><ArrowRightLeft aria-hidden="true" size={14}/>Пито платено</span>}
              {otherFamilyOnly && <span className="expense-indicator"><Users aria-hidden="true" size={14}/>{history.label}</span>}
            </span>
          </button>
          {infoOpen && <div role="region" aria-label="Подробности за разхода" id={`expense-${expense.id}-details`} className="pb-4 text-sm [overflow-wrap:anywhere]">
            <p className="font-medium">{history.sentence}</p>
            {expense.comment && <p className="mt-2 text-eco-text-muted">{expense.comment}</p>}
            {expense.createdAt && <p className="mt-2 text-eco-text-muted">Добавен: {new Date(expense.createdAt).toLocaleString('bg-BG')}</p>}
            {expense.type !== 'settlement' && <div className="mt-3 text-eco-text-muted"><p className="font-medium mb-1">Дялове</p>{[...new Set([...Object.keys(shares), expense.paidByFamilyId])].map(id => <p key={id} className="flex flex-wrap justify-between gap-x-3"><span className="min-w-0">{families.find(f => f.id === id)?.name ?? 'Предишно семейство'}</span><span className="tabular-nums">{(shares[id] ?? 0).toFixed(2)} {symbol}</span></p>)}</div>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" type="button" onClick={() => setEditing(expense)}>Редактирай</Button>
              <Button variant="danger" type="button" onClick={() => { if (window.confirm('Сигурен ли си, че искаш да изтриеш този разход?')) void onDeleteExpense(expense.id); }}>Изтрий</Button>
            </div>
          </div>}
        </li>;
      })}
    </ul>}
    {totalPages > 1 && <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Страници с разходи"><Button variant="secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Предишни</Button><span className="text-sm text-eco-text-muted">Страница {currentPage} / {totalPages} · {expenses.length} записа</span><Button variant="secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Следващи</Button></nav>}
  </div>;
}
