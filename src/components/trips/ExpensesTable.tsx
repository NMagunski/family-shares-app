import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import AddExpenseForm from './AddExpenseForm';
import { Info } from 'lucide-react';

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
  onDeleteExpense?: (expenseId: string) => void | Promise<void>;
};

const PAGE_SIZE = 10;

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  families,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingComment, setEditingComment] = React.useState<string>('');
  const [openInfoId, setOpenInfoId] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  // ресет на страницата, ако броят на разходите се промени (нов, изтрит и т.н.)
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [expenses.length, currentPage]);

  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageExpenses = expenses.slice(startIndex, endIndex);

  function handleAdd(expense: NewExpenseInput) {
    if (!onAddExpense) return;
    onAddExpense(expense);
    setCurrentPage(1); // новите разходи да се виждат на първата страница
  }

  function handleStartEdit(exp: TripExpense) {
    setEditingId(exp.id);
    setEditingComment(exp.comment ?? '');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingComment('');
  }

  async function handleSaveEdit(exp: TripExpense) {
    if (!onUpdateExpense) {
      handleCancelEdit();
      return;
    }

    const payload: NewExpenseInput = {
      paidByFamilyId: exp.paidByFamilyId,
      involvedFamilyIds: exp.involvedFamilyIds,
      amount: exp.amount,
      currency: exp.currency,
      comment: editingComment,
    };

    try {
      await onUpdateExpense(exp.id, payload);
    } finally {
      handleCancelEdit();
    }
  }

  async function handleDelete(expenseId: string) {
    if (!onDeleteExpense) return;

    const ok = window.confirm('Сигурен ли си, че искаш да изтриеш този разход?');
    if (!ok) return;

    await onDeleteExpense(expenseId);
  }

  function toggleInfo(expenseId: string) {
    setOpenInfoId((prev) => (prev === expenseId ? null : expenseId));
  }

  function toggleExpanded(expenseId: string) {
    setExpandedId((prev) => (prev === expenseId ? null : expenseId));
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return 'няма записана дата';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'няма записана дата';

    return d.toLocaleString('bg-BG', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  function formatInvolvedFamilies(exp: TripExpense): string | null {
    if (!exp.involvedFamilyIds || exp.involvedFamilyIds.length === 0) {
      return null;
    }

    const names = exp.involvedFamilyIds
      .map((id) => families.find((f) => f.id === id)?.name)
      .filter(Boolean) as string[];

    if (names.length === 0) return null;

    return names.join(', ');
  }

  const showPagination = expenses.length > PAGE_SIZE;
  const from = expenses.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(endIndex, expenses.length);

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
        <div className="mt-1 space-y-3">
          {/* DESKTOP таблица – работи с pageExpenses */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-eco-border/60">
                  <th className="w-8 py-2 pr-2 text-left text-eco-text-muted font-medium" />
                  <th className="py-2 pr-4 text-left text-eco-text-muted font-medium">
                    Платено от
                  </th>
                  <th className="py-2 pr-4 text-left text-eco-text-muted font-medium">
                    Сума
                  </th>
                  <th className="py-2 pr-4 text-left text-eco-text-muted font-medium">
                    Коментар
                  </th>
                  <th className="py-2 pr-0 text-left text-eco-text-muted font-medium">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageExpenses.map((exp) => {
                  const family = families.find((f) => f.id === exp.paidByFamilyId);
                  const isEditing = editingId === exp.id;
                  const isInfoOpen = openInfoId === exp.id;
                  const involvedNames = formatInvolvedFamilies(exp);

                  return (
                    <tr
                      key={exp.id}
                      className="border-b border-eco-border/40 last:border-b-0 align-top"
                    >
                      {/* Info икона */}
                      <td className="py-2 pr-2">
                        {(exp.createdAt || involvedNames) && (
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-eco-border text-[10px] font-semibold text-eco-text-muted hover:bg-eco-surface-soft transition"
                            onClick={() => toggleInfo(exp.id)}
                            aria-label="Информация за разхода"
                          >
                            <Info className="h-3 w-3" />
                          </button>
                        )}
                      </td>

                      <td className="py-2 pr-4 text-eco-text">
                        {family?.name ?? '—'}
                      </td>
                      <td className="py-2 pr-4 text-eco-text">
                        {exp.amount.toFixed(2)} {exp.currency}
                      </td>
                      <td className="py-2 pr-4 text-eco-text-muted">
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full rounded-lg border border-eco-border bg-eco-surface px-2 py-1 text-sm text-eco-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={editingComment}
                            onChange={(e) => setEditingComment(e.target.value)}
                            placeholder="Коментар..."
                          />
                        ) : (
                          <>
                            {exp.comment || '—'}
                            {isInfoOpen && (
                              <>
                                {exp.createdAt && (
                                  <div className="mt-1 text-xs text-eco-text-muted">
                                    Добавен: {formatDate(exp.createdAt)}
                                  </div>
                                )}
                                {involvedNames && (
                                  <div className="mt-0.5 text-xs text-eco-text-muted">
                                    Разпределено между: {involvedNames}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </td>
                      <td className="py-2 pr-0 text-eco-text">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              onClick={() => handleSaveEdit(exp)}
                            >
                              Запази
                            </button>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium border border-eco-border text-eco-text-muted hover:bg-eco-surface-soft transition"
                              onClick={handleCancelEdit}
                            >
                              Отказ
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium border border-eco-border text-eco-text-muted hover:bg-eco-surface-soft transition"
                              onClick={() => handleStartEdit(exp)}
                            >
                              Редактирай
                            </button>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium border border-red-500 text-red-400 hover:bg-red-950/40 transition"
                              onClick={() => handleDelete(exp.id)}
                            >
                              Изтрий
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE „карти“ – съкратен изглед + expand за детайли */}
          <div className="md:hidden space-y-3 mt-1">
            {pageExpenses.map((exp) => {
              const family = families.find((f) => f.id === exp.paidByFamilyId);
              const isEditing = editingId === exp.id;
              const isExpanded = expandedId === exp.id;
              const involvedNames = formatInvolvedFamilies(exp);

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
                  {/* Съкратен header: Семейство + сума */}
                  <button
                    type="button"
                    className="flex items-center justify-between text-sm w-full text-left"
                    onClick={() => toggleExpanded(exp.id)}
                  >
                    <div className="flex flex-col">
                      <span className="text-eco-text-muted">Платено от</span>
                      <span className="font-medium text-eco-text">
                        {family?.name ?? '—'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-eco-text-muted">Сума</span>
                      <span className="font-semibold text-eco-text">
                        {exp.amount.toFixed(2)} {exp.currency}
                      </span>
                    </div>
                  </button>

                  {/* Детайли – показват се само при клик */}
                  {isExpanded && (
                    <>
                      <div className="flex flex-col gap-1 text-sm mt-2">
                        <span className="text-eco-text-muted">Коментар:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full rounded-lg border border-eco-border bg-eco-surface px-2 py-1 text-sm text-eco-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={editingComment}
                            onChange={(e) => setEditingComment(e.target.value)}
                            placeholder="Коментар..."
                          />
                        ) : (
                          <span className="text-eco-text-muted">
                            {exp.comment || '—'}
                          </span>
                        )}
                      </div>

                      {exp.createdAt && (
                        <div className="mt-1 text-xs text-eco-text-muted">
                          Добавен: {formatDate(exp.createdAt)}
                        </div>
                      )}

                      {involvedNames && (
                        <div className="mt-1 text-xs text-eco-text-muted">
                          Разпределено между: {involvedNames}
                        </div>
                      )}

                      <div className="mt-3 flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              onClick={() => handleSaveEdit(exp)}
                            >
                              Запази
                            </button>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium border border-eco-border text-eco-text-muted hover:bg-eco-surface-soft transition"
                              onClick={handleCancelEdit}
                            >
                              Отказ
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium border border-eco-border text-eco-text-muted hover:bg-eco-surface-soft transition"
                              onClick={() => handleStartEdit(exp)}
                            >
                              Редактирай
                            </button>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1 text-xs font-medium border border-red-500 text-red-400 hover:bg-red-950/40 transition"
                              onClick={() => handleDelete(exp.id)}
                            >
                              Изтрий
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {showPagination && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
              <p className="text-xs text-eco-text-muted">
                Показани <span className="font-medium text-eco-text">{from}</span>–
                <span className="font-medium text-eco-text">{to}</span> от{' '}
                <span className="font-medium text-eco-text">
                  {expenses.length}
                </span>{' '}
                разхода
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg px-3 py-1 text-xs font-medium border border-eco-border text-eco-text-muted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-eco-surface-soft transition"
                  disabled={page <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Предишни
                </button>
                <span className="text-xs text-eco-text-muted">
                  Страница{' '}
                  <span className="font-medium text-eco-text">{page}</span> /{' '}
                  <span className="font-medium text-eco-text">{totalPages}</span>
                </span>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1 text-xs font-medium border border-eco-border text-eco-text-muted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-eco-surface-soft transition"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Следващи
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpensesTable;
