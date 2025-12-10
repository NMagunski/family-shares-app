import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import type { CurrencyCode } from '@/lib/currencies';
import { getCurrencySymbol } from '@/lib/currencies';

type Props = {
  families: TripFamily[];
  expenses: TripExpense[];
  currency: CurrencyCode;
};

type BalanceMap = Record<string, number>;

type Settlement = {
  fromFamilyId: string;
  toFamilyId: string;
  amount: number;
};

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Изчислява нетния баланс за всяко семейство:
 *  - положително → трябва да получи
 *  - отрицателно → трябва да даде
 */
function computeBalances(
  families: TripFamily[],
  expenses: TripExpense[],
  currency: CurrencyCode
): BalanceMap {
  const balances: BalanceMap = {};

  families.forEach((f) => {
    balances[f.id] = 0;
  });

  const familyIds = families.map((f) => f.id);

  for (const e of expenses) {
    // Работим само с разходите в валутата на пътуването
    if (e.currency !== currency) continue;

    const type = e.type ?? 'expense';

    // 👉 Пито платено (settlement) – директно прехвърляне на пари
    if (type === 'settlement') {
      const fromId = e.settlementFromFamilyId ?? e.paidByFamilyId;
      const toId = e.settlementToFamilyId;

      if (!fromId || !toId || fromId === toId) continue;

      // Платецът "губи" пари (намалява дълга му)
      balances[fromId] = (balances[fromId] ?? 0) - e.amount;
      // Получателят "печели" (намалява това, което има да получава)
      balances[toId] = (balances[toId] ?? 0) + e.amount;
      continue;
    }

    // 👉 Нормален разход
    const participants =
      e.involvedFamilyIds && e.involvedFamilyIds.length > 0
        ? e.involvedFamilyIds
        : familyIds;

    if (!participants || participants.length === 0) continue;

    const share = e.amount / participants.length;

    // Всеки участник дължи своя дял
    for (const fid of participants) {
      balances[fid] = (balances[fid] ?? 0) - share;
    }

    // Платецът е извадил цялата сума от джоба си → трябва да получи толкова
    if (e.paidByFamilyId) {
      balances[e.paidByFamilyId] =
        (balances[e.paidByFamilyId] ?? 0) + e.amount;
    }
  }

  return balances;
}

/**
 * Изчислява минимален набор от разплащания между семейства.
 */
function computeSettlements(balances: BalanceMap): Settlement[] {
  const debtors: { familyId: string; amount: number }[] = [];
  const creditors: { familyId: string; amount: number }[] = [];

  Object.entries(balances).forEach(([familyId, balance]) => {
    if (balance < -0.01) {
      // трябва да дава → обръщаме в положително число
      debtors.push({ familyId, amount: -balance });
    } else if (balance > 0.01) {
      // трябва да получава
      creditors.push({ familyId, amount: balance });
    }
  });

  const settlements: Settlement[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const pay = Math.min(debtor.amount, creditor.amount);
    if (pay <= 0) {
      if (debtor.amount <= 0) i++;
      if (creditor.amount <= 0) j++;
      continue;
    }

    settlements.push({
      fromFamilyId: debtor.familyId,
      toFamilyId: creditor.familyId,
      amount: pay,
    });

    debtor.amount -= pay;
    creditor.amount -= pay;

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return settlements;
}

const DebtsSummary: React.FC<Props> = ({ families, expenses, currency }) => {
  const currencySymbol = getCurrencySymbol(currency);

  const balances = React.useMemo(
    () => computeBalances(families, expenses, currency),
    [families, expenses, currency]
  );

  const settlements = React.useMemo(
    () => computeSettlements(balances),
    [balances]
  );

  const hasAnyBalance = Object.values(balances).some(
    (v) => Math.abs(v) > 0.01
  );

  const settlementsCount = settlements.length;

  const getFamilyName = (id: string) =>
    families.find((f) => f.id === id)?.name ?? 'Непознато семейство';

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
          'Все още няма достатъчно данни за изчисляване на разплащанията.'
        )}
      </p>

      {/* Баланс по семействата */}
      <div className="rounded-2xl bg-eco-surface-soft px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-eco-text-muted mb-1">
          Баланс по семействата
        </p>

        {families.map((family) => {
          const balance = balances[family.id] ?? 0;

          const isPositive = balance > 0.01;
          const isNegative = balance < -0.01;

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
              className="flex items-center justify-between py-1"
            >
              <span className="text-eco-text">{family.name}</span>
              <div
                className={`
                  inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium
                  ${
                    isPositive
                      ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                      : isNegative
                      ? 'border-red-500 text-red-300 bg-red-500/10'
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
                  className="text-sm text-eco-text"
                >
                  <span>{fromName} дължат </span>
                  <span className="font-semibold text-emerald-300">
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
