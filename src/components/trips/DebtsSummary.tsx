import { calculateFamilyBalances, calculateDebts, type FamilyBalance, type DebtLine } from '@/lib/expenses';
import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';
import { getCurrencySymbol } from '@/lib/currencies';

type Props = {
  families: TripFamily[];
  expenses: TripExpense[];
  currency: CurrencyCode;
  balances?: FamilyBalance;
  settlements?: DebtLine[];
  status?: 'loading' | 'error' | 'ready';
};

function formatAmount(amount: number): string { return amount.toFixed(2); }

const DebtsSummary: React.FC<Props> = ({ families, expenses, currency, balances: sharedBalances, settlements: sharedSettlements, status = 'ready' }) => {
  const currencySymbol = getCurrencySymbol(currency);

  const balances = React.useMemo(
    () => sharedBalances ?? calculateFamilyBalances(families, expenses, currency),
    [families, expenses, currency, sharedBalances]
  );

  const settlements = React.useMemo(
    () => sharedSettlements ?? calculateDebts(families, balances),
    [families, balances, sharedSettlements]
  );

  const hasAnyBalance = Object.values(balances).some(
    (v) => Math.abs(v) >= 0.01
  );

  const settlementsCount = settlements.length;

  const getFamilyName = (id: string) =>
    families.find((f) => f.id === id)?.name ?? 'Непознато семейство';

  if (status !== 'ready') return <p role="status" className="text-sm text-eco-text-muted">{status === 'loading' ? 'Зареждане на разплащанията…' : 'Разплащанията не могат да се заредят.'}</p>;

  return (
    <div className="space-y-4 text-sm">
      {/* Общо резюме */}
      <p className="text-xs text-eco-text-muted">
        {settlementsCount > 0 ? (
          <>
            Има{' '}
            <span className="font-semibold text-eco-text">
              {settlementsCount}
            </span>{' '}
            разплащане(я) между семействата.
          </>
        ) : hasAnyBalance ? (
          'Семействата са в баланс – няма нужда от допълнителни разплащания.'
        ) : (
          expenses.length ? 'Сметките са уредени.' : 'Все още няма разходи.'
        )}
      </p>

      {/* Баланс по семействата */}
      <div className="rounded-2xl bg-eco-surface-soft px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-eco-text-muted mb-1">
          Баланс по семействата
        </p>

        {families.map((family) => {
          const balance = balances[family.id] ?? 0;

          const isPositive = balance >= 0.01;
          const isNegative = balance <= -0.01;

          let label = `${formatAmount(Math.abs(balance))} ${currencySymbol}`;
          if (isPositive) {
            label = `+${label} (трябва да получат)`;
          } else if (isNegative) {
            label = `-${label} (трябва да дадат)`;
          } else {
            label = `${label}`;
          }

          return (
            <div
              key={family.id}
              className="flex flex-wrap items-center justify-between gap-2 py-1"
            >
              <span className="text-eco-text min-w-0 [overflow-wrap:anywhere]">{family.name}</span>
              <div
                className={`
                  debt-badge min-w-0 max-w-full [overflow-wrap:anywhere] inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium
                  ${
                    isPositive
                      ? 'border-emerald-500 text-eco-accent bg-emerald-500/10'
                      : isNegative
                      ? 'border-red-500 text-eco-error bg-red-500/10'
                      : 'border-eco-border text-eco-text-muted bg-eco-surface'
                  }
                `}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Кой на кого колко дължи */}
      <div className="mt-2 rounded-2xl bg-eco-surface-soft px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-eco-text-muted">
          Кой на кого колко дължи
        </p>

        {settlements.length === 0 ? (
          <p className="text-xs text-eco-text-muted mt-1">
            Няма нужда от допълнителни разплащания между семействата.
          </p>
        ) : (
          <ul className="mt-1 space-y-1.5">
            {settlements.map((s, index) => {
              const fromName = getFamilyName(s.fromFamilyId);
              const toName = getFamilyName(s.toFamilyId);

              return (
                <li
                  key={`${s.fromFamilyId}-${s.toFamilyId}-${index}`}
                  className="text-sm text-eco-text [overflow-wrap:anywhere]"
                >
                  <span>{fromName} дължат </span>
                  <span className="font-semibold text-eco-accent">
                    {formatAmount(s.amount)} {currencySymbol}
                  </span>
                  <span> на {toName}.</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DebtsSummary;
