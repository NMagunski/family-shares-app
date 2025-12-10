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

const EPSILON = 0.005; // за закръгляне на почти нулеви стойности

const DebtsSummary: React.FC<Props> = ({ families, expenses, currency }) => {
  const currencySymbol = getCurrencySymbol(currency);

  const { balances, settlements } = React.useMemo(() => {
    const balance: BalanceMap = {};
    families.forEach((f) => {
      balance[f.id] = 0;
    });

    // 1) нормални разходи (expense / undefined)
    const expenseEntries = expenses.filter(
      (e) => (e.type ?? 'expense') === 'expense' && e.currency === currency
    );

    for (const e of expenseEntries) {
      // участници – ако няма избрани → всички семейства
      let participants =
        e.involvedFamilyIds && e.involvedFamilyIds.length > 0
          ? [...e.involvedFamilyIds]
          : families.map((f) => f.id);

      // платилият винаги участва
      if (e.paidByFamilyId && !participants.includes(e.paidByFamilyId)) {
        participants.push(e.paidByFamilyId);
      }

      if (participants.length === 0) continue;

      const share = e.amount / participants.length;

      // всеки участник дължи своя дял
      for (const fid of participants) {
        if (balance[fid] == null) balance[fid] = 0;
        balance[fid] -= share;
      }

      // платилият е дал цялата сума
      if (balance[e.paidByFamilyId] == null) balance[e.paidByFamilyId] = 0;
      balance[e.paidByFamilyId] += e.amount;
    }

    // 2) погасявания "Пито платено" (settlement)
    const settlementEntries = expenses.filter(
      (e) => (e.type ?? 'expense') === 'settlement' && e.currency === currency
    );

    for (const e of settlementEntries) {
      const fromId = e.settlementFromFamilyId || e.paidByFamilyId;
      const toId = e.settlementToFamilyId;

      if (!fromId || !toId || fromId === toId) continue;

      if (balance[fromId] == null) balance[fromId] = 0;
      if (balance[toId] == null) balance[toId] = 0;

      // платилият (from) намалява задължението си
      balance[fromId] += e.amount;
      // получателят (to) намалява вземането си
      balance[toId] -= e.amount;
    }

    // чистим почти нулеви стойности
    Object.keys(balance).forEach((fid) => {
      if (Math.abs(balance[fid]) < EPSILON) {
        balance[fid] = 0;
      }
    });

    // Алгоритъм за "кой на кого колко дължи"
    type Side = { familyId: string; amount: number };

    const creditors: Side[] = [];
    const debtors: Side[] = [];

    for (const [fid, value] of Object.entries(balance)) {
      if (value > EPSILON) {
        creditors.push({ familyId: fid, amount: value });
      } else if (value < -EPSILON) {
        debtors.push({ familyId: fid, amount: -value }); // пазим като положително число
      }
    }

    const settlementsResult: { fromId: string; toId: string; amount: number }[] =
      [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const payAmount = Math.min(debtor.amount, creditor.amount);

      if (payAmount > EPSILON) {
        settlementsResult.push({
          fromId: debtor.familyId,
          toId: creditor.familyId,
          amount: payAmount,
        });

        debtor.amount -= payAmount;
        creditor.amount -= payAmount;
      }

      if (debtor.amount <= EPSILON) i += 1;
      if (creditor.amount <= EPSILON) j += 1;
    }

    return {
      balances: balance,
      settlements: settlementsResult,
    };
  }, [families, expenses, currency]);

  const hasAnyMovement =
    Object.values(balances).some((v) => Math.abs(v) > EPSILON) ||
    settlements.length > 0;

  if (!families.length || !expenses.length) {
    return (
      <p className="text-sm text-eco-text-muted">
        Все още няма достатъчно данни за изчисляване на дълговете.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {hasAnyMovement ? (
        <p className="text-xs text-eco-text-muted">
          Има{' '}
          <span className="font-semibold text-eco-text">
            {settlements.length}
          </span>{' '}
          разплащане(я) между семействата.
        </p>
      ) : (
        <p className="text-xs text-eco-text-muted">
          Всички са изравнени – няма оставащи дългове.
        </p>
      )}

      {/* Баланс по семействата */}
      <div className="rounded-xl bg-eco-surface-soft border border-eco-border px-4 py-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-eco-text mb-1">
          Баланс по семействата
        </h3>

        {families.map((f) => {
          const val = balances[f.id] ?? 0;

          let label = '0.00 ' + currencySymbol + ' (изравнени)';
          let classes = 'text-eco-text-muted';

          if (val > EPSILON) {
            label = `+${val.toFixed(2)} ${currencySymbol} (трябва да получат)`;
            classes = 'text-green-400';
          } else if (val < -EPSILON) {
            label = `${val.toFixed(2)} ${currencySymbol} (трябва да дадат)`;
            classes = 'text-red-400';
          }

          return (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg px-3 py-1.5"
            >
              <span className="text-eco-text">{f.name}</span>
              <span className={`text-sm font-medium ${classes}`}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Кой на кого колко дължи */}
      <div className="rounded-xl bg-eco-surface-soft border border-eco-border px-4 py-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-eco-text mb-1">
          Кой на кого колко дължи
        </h3>

        {settlements.length === 0 ? (
          <p className="text-xs text-eco-text-muted">
            Няма директни разплащания – балансите са изравнени.
          </p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {settlements.map((s, idx) => {
              const fromName =
                families.find((f) => f.id === s.fromId)?.name ?? '—';
              const toName =
                families.find((f) => f.id === s.toId)?.name ?? '—';

              return (
                <li key={idx} className="text-eco-text">
                  <span className="font-medium">{fromName}</span> дължат{' '}
                  <span className="font-semibold text-emerald-400">
                    {s.amount.toFixed(2)} {currencySymbol}
                  </span>{' '}
                  на <span className="font-medium">{toName}</span>.
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
