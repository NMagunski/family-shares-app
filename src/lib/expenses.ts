import type { TripFamily, TripExpense } from '@/types/trip';

export type FamilyBalance = Record<string, number>;

export type DebtLine = {
  fromFamilyId: string;
  toFamilyId: string;
  amount: number;
};

export function calculateFamilyBalances(
  families: TripFamily[],
  expenses: TripExpense[]
): FamilyBalance {
  const balance: FamilyBalance = {};

  // инициализираме с 0
  for (const fam of families) {
    balance[fam.id] = 0;
  }

  for (const exp of expenses) {
    // 🆕 1) "Пито платено" – погасяване на дълг
    if (exp.type === 'settlement') {
      // от това семейство ИДВАТ парите (длъжник)
      const fromId = exp.settlementFromFamilyId ?? exp.paidByFamilyId;
      // към това семейство ОТИВАТ парите (кредитор)
      const toId =
        exp.settlementToFamilyId ??
        (exp.involvedFamilyIds && exp.involvedFamilyIds[0]);

      if (!fromId || !toId || fromId === toId) {
        continue;
      }
      if (exp.amount <= 0) continue;

      if (balance[fromId] === undefined) balance[fromId] = 0;
      if (balance[toId] === undefined) balance[toId] = 0;

      // ❗ правилен знак:
      // длъжникът увеличава баланса си (става по-малко "на минус")
      balance[fromId] += exp.amount;
      // кредиторът намалява това, което има да получава
      balance[toId] -= exp.amount;

      continue; // не минаваме през нормалната логика
    }

    // 🧾 2) Нормален разход – както си беше
    const involved =
      exp.involvedFamilyIds && exp.involvedFamilyIds.length > 0
        ? exp.involvedFamilyIds
        : families.map((f) => f.id);

    if (involved.length === 0 || exp.amount <= 0) continue;

    const fairShare = exp.amount / involved.length;

    for (const famId of involved) {
      if (famId === exp.paidByFamilyId) {
        balance[famId] += exp.amount - fairShare;
      } else {
        balance[famId] -= fairShare;
      }
    }
  }

  return balance;
}

export function calculateDebts(
  families: TripFamily[],
  balances: FamilyBalance
): DebtLine[] {
  const creditors: { familyId: string; amount: number }[] = [];
  const debtors: { familyId: string; amount: number }[] = [];

  for (const fam of families) {
    const bal = balances[fam.id] ?? 0;
    if (bal > 0.01) {
      creditors.push({ familyId: fam.id, amount: bal });
    } else if (bal < -0.01) {
      debtors.push({ familyId: fam.id, amount: -bal });
    }
  }

  const result: DebtLine[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    result.push({
      fromFamilyId: debtor.familyId,
      toFamilyId: creditor.familyId,
      amount: Number(amount.toFixed(2)),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return result;
}
