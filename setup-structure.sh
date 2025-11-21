#!/usr/bin/env bash

echo "▶ Creating folders..."

mkdir -p src/components/layout
mkdir -p src/components/auth
mkdir -p src/components/trips
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/pages/trips/[tripId]

echo "▶ Creating types..."

cat <<'EOF' > src/types/trip.ts
export type TripType = 'beach' | 'flight' | 'other';

export type Trip = {
  id: string;
  ownerId: string;
  type: TripType;
  name: string;
  createdAt: string; // ISO string
  archived?: boolean;
};

export type TripFamily = {
  id: string;
  tripId: string;
  name: string;        // "Семейство Иванови"
  isOwnerFamily?: boolean;
};

export type TripExpense = {
  id: string;
  tripId: string;
  paidByFamilyId: string;      // кой е платил
  involvedFamilyIds: string[]; // между кои семейства се дели
  amount: number;
  currency: 'BGN' | 'EUR';
  comment?: string;
  createdAt: string;
};

export type TripList = {
  id: string;
  tripId: string;
  familyId?: string; // undefined → общ списък
  name: string;
  type: 'packing' | 'shopping' | 'custom';
};

export type TripListItem = {
  id: string;
  listId: string;
  text: string;
  checked: boolean;
};
EOF

echo "▶ Creating lib files (logic placeholders)..."

cat <<'EOF' > src/lib/expenses.ts
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

  for (const fam of families) {
    balance[fam.id] = 0;
  }

  for (const exp of expenses) {
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
EOF

cat <<'EOF' > src/lib/firebase.ts
// TODO: тук по-късно ще добавим реалната Firebase конфигурация.
// Засега е само placeholder, за да не дава грешки при импорт.

export const firebasePlaceholder = true;
EOF

echo "▶ Creating layout components..."

cat <<'EOF' > src/components/layout/Navbar.tsx
import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Family Shares</Link>
      </div>
      <nav className={styles.links}>
        <Link href="/">Пътувания</Link>
        <Link href="/login">Вход</Link>
        <Link href="/register">Регистрация</Link>
      </nav>
    </header>
  );
};

export default Navbar;
EOF

cat <<'EOF' > src/components/layout/Navbar.module.css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  background-color: #ffffff;
}

.logo a {
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  color: #111827;
}

.links {
  display: flex;
  gap: 12px;
}

.links a {
  text-decoration: none;
  color: #374151;
  font-size: 0.95rem;
}

.links a:hover {
  text-decoration: underline;
}
EOF

cat <<'EOF' > src/components/layout/Layout.tsx
import React from 'react';
import Navbar from './Navbar';
import styles from './Layout.module.css';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
EOF

cat <<'EOF' > src/components/layout/Layout.module.css
.app {
  min-height: 100vh;
  background-color: #f9fafb;
  color: #111827;
}

.main {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
}
EOF

echo "▶ Creating UI components..."

cat <<'EOF' > src/components/ui/Button.module.css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #2563eb;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buttonSecondary {
  border-color: #d1d5db;
  background-color: #ffffff;
  color: #111827;
}

.button:hover:not(:disabled) {
  background-color: #1d4ed8;
}
EOF

cat <<'EOF' > src/components/ui/Button.tsx
import React from 'react';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const base =
    variant === 'primary'
      ? styles.button
      : styles.buttonSecondary;

  const cls = [base, className].filter(Boolean).join(' ');

  return <button className={cls} {...props} />;
};

export default Button;
EOF

cat <<'EOF' > src/components/ui/Card.module.css
.card {
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
EOF

cat <<'EOF' > src/components/ui/Card.tsx
import React from 'react';
import styles from './Card.module.css';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const cls = [styles.card, className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
};

export default Card;
EOF

cat <<'EOF' > src/components/ui/Input.module.css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.85rem;
  color: #4b5563;
}

.input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
}

.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
}
EOF

cat <<'EOF' > src/components/ui/Input.tsx
import React from 'react';
import styles from './Input.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  if (!label) {
    const cls = [styles.input, className].filter(Boolean).join(' ');
    return <input className={cls} {...props} />;
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <input className={styles.input} {...props} />
    </div>
  );
};

export default Input;
EOF

cat <<'EOF' > src/components/ui/Select.module.css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.85rem;
  color: #4b5563;
}

.select {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
}

.select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
}
EOF

cat <<'EOF' > src/components/ui/Select.tsx
import React from 'react';
import styles from './Select.module.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  if (!label) {
    const cls = [styles.select, className].filter(Boolean).join(' ');
    return (
      <select className={cls} {...props}>
        {children}
      </select>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <select className={styles.select} {...props}>
        {children}
      </select>
    </div>
  );
};

export default Select;
EOF

cat <<'EOF' > src/components/ui/Checkbox.module.css
.row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.input {
  width: 16px;
  height: 16px;
}
EOF

cat <<'EOF' > src/components/ui/Checkbox.tsx
import React from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  if (!label) {
    return <input type="checkbox" className={styles.input} {...props} />;
  }

  return (
    <label className={styles.row}>
      <input type="checkbox" className={styles.input} {...props} />
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
EOF

echo "▶ Creating auth components..."

cat <<'EOF' > src/components/auth/AuthForm.tsx
import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export type AuthMode = 'login' | 'register';

type AuthFormProps = {
  mode: AuthMode;
  onSubmit?: (data: { email: string; password: string }) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.({ email, password });
  }

  const title = mode === 'login' ? 'Вход' : 'Регистрация';

  return (
    <Card>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Парола"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">
          {mode === 'login' ? 'Влез' : 'Регистрирай се'}
        </Button>
      </form>
    </Card>
  );
};

export default AuthForm;
EOF

echo "▶ Creating trips components (basic skeletons)..."

cat <<'EOF' > src/components/trips/TripTypeSelector.tsx
import React from 'react';
import Button from '@/components/ui/Button';
import styles from './TripTypeSelector.module.css';
import type { TripType } from '@/types/trip';

type TripTypeSelectorProps = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<TripTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className={styles.wrapper}>
      <Button onClick={() => onSelect('beach')}>🏖️ Море</Button>
      <Button onClick={() => onSelect('flight')}>✈️ Екскурзия</Button>
      <Button onClick={() => onSelect('other')}>🧳 Друго</Button>
    </div>
  );
};

export default TripTypeSelector;
EOF

cat <<'EOF' > src/components/trips/TripTypeSelector.module.css
.wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
EOF

cat <<'EOF' > src/components/trips/TripCard.tsx
import React from 'react';
import Card from '@/components/ui/Card';
import type { Trip } from '@/types/trip';
import Link from 'next/link';

type TripCardProps = {
  trip: Trip;
};

const tripTypeLabel: Record<Trip['type'], string> = {
  beach: 'Море',
  flight: 'Екскурзия',
  other: 'Друго',
};

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <Card>
      <h2 style={{ marginBottom: 4 }}>{trip.name}</h2>
      <p style={{ marginBottom: 8, fontSize: '0.9rem', color: '#4b5563' }}>
        Тип: {tripTypeLabel[trip.type]}
      </p>
      <Link href={`/trips/${trip.id}`}>Отвори пътуването</Link>
    </Card>
  );
};

export default TripCard;
EOF

cat <<'EOF' > src/components/trips/TripHeader.tsx
import React from 'react';
import Button from '@/components/ui/Button';
import styles from './TripHeader.module.css';

type TripHeaderProps = {
  name: string;
  onAddFamily?: () => void;
  onOpenLists?: () => void;
};

const TripHeader: React.FC<TripHeaderProps> = ({ name, onAddFamily, onOpenLists }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.actions}>
        <Button onClick={onAddFamily}>Добави семейство</Button>
        <Button variant="secondary" onClick={onOpenLists}>
          Списъци
        </Button>
      </div>
    </div>
  );
};

export default TripHeader;
EOF

cat <<'EOF' > src/components/trips/TripHeader.module.css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
EOF

cat <<'EOF' > src/components/trips/FamiliesSection.tsx
import React from 'react';
import type { TripFamily } from '@/types/trip';
import Card from '@/components/ui/Card';

type FamiliesSectionProps = {
  families: TripFamily[];
};

const FamiliesSection: React.FC<FamiliesSectionProps> = ({ families }) => {
  if (families.length === 0) {
    return <p>Няма добавени семейства все още.</p>;
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 8 }}>Семейства</h2>
      <ul style={{ paddingLeft: 16 }}>
        {families.map((f) => (
          <li key={f.id}>{f.name}</li>
        ))}
      </ul>
    </Card>
  );
};

export default FamiliesSection;
EOF

cat <<'EOF' > src/components/trips/ExpensesTable.tsx
import React from 'react';
import type { TripFamily, TripExpense } from '@/types/trip';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type ExpensesTableProps = {
  families: TripFamily[];
  expenses: TripExpense[];
  onAddExpense?: (expense: Omit<TripExpense, 'id' | 'createdAt'>) => void;
};

const ExpensesTable: React.FC<ExpensesTableProps> = ({ families, expenses, onAddExpense }) => {
  const [paidByFamilyId, setPaidByFamilyId] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [comment, setComment] = React.useState<string>('');
  const [involvedFamilyIds, setInvolvedFamilyIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (families.length > 0 && involvedFamilyIds.length === 0) {
      setInvolvedFamilyIds(families.map((f) => f.id));
    }
  }, [families, involvedFamilyIds.length]);

  function toggleFamilyInvolved(id: string) {
    setInvolvedFamilyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!paidByFamilyId || !amount) return;
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;

    if (onAddExpense) {
      onAddExpense({
        tripId: '', // ще го пълним реално по-късно
        paidByFamilyId,
        involvedFamilyIds,
        amount: parsed,
        currency: 'BGN',
        comment,
      });
    }

    setAmount('');
    setComment('');
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 8 }}>Разходи</h2>
      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}
      >
        <Select
          label="Платено от"
          value={paidByFamilyId}
          onChange={(e) => setPaidByFamilyId(e.target.value)}
          required
        >
          <option value="">-- Избери семейство --</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>

        <Input
          label="Сума"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Коментар"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="напр. Вечеря, гориво..."
        />

        <div>
          <p style={{ fontSize: '0.9rem', marginBottom: 4 }}>Разделя се между:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {families.map((f) => (
              <label key={f.id} style={{ fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={involvedFamilyIds.includes(f.id)}
                  onChange={() => toggleFamilyInvolved(f.id)}
                  style={{ marginRight: 4 }}
                />
                {f.name}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">Добави разход</Button>
      </form>

      {expenses.length === 0 ? (
        <p>Все още няма разходи.</p>
      ) : (
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Платено от</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Сума</th>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Коментар</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              const family = families.find((f) => f.id === exp.paidByFamilyId);
              return (
                <tr key={exp.id}>
                  <td style={{ padding: '4px 0' }}>{family?.name ?? '—'}</td>
                  <td style={{ padding: '4px 0' }}>{exp.amount.toFixed(2)} {exp.currency}</td>
                  <td style={{ padding: '4px 0' }}>{exp.comment}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default ExpensesTable;
EOF

cat <<'EOF' > src/components/trips/DebtsSummary.tsx
import React from 'react';
import type { TripFamily } from '@/types/trip';
import { calculateFamilyBalances, calculateDebts } from '@/lib/expenses';
import type { TripExpense } from '@/types/trip';
import Card from '@/components/ui/Card';

type DebtsSummaryProps = {
  families: TripFamily[];
  expenses: TripExpense[];
};

const DebtsSummary: React.FC<DebtsSummaryProps> = ({ families, expenses }) => {
  if (families.length === 0 || expenses.length === 0) {
    return null;
  }

  const balances = calculateFamilyBalances(families, expenses);
  const debts = calculateDebts(families, balances);

  if (debts.length === 0) {
    return (
      <Card>
        <p>Всички семейства са изчистили сметките си. 🎉</p>
      </Card>
    );
  }

  function getFamilyName(id: string): string {
    return families.find((f) => f.id === id)?.name ?? id;
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 8 }}>Кой на кого колко дължи</h2>
      <ul style={{ paddingLeft: 16 }}>
        {debts.map((d, idx) => (
          <li key={idx}>
            {getFamilyName(d.fromFamilyId)} дължат {d.amount.toFixed(2)} лв на{' '}
            {getFamilyName(d.toFamilyId)}.
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default DebtsSummary;
EOF

echo "▶ Creating pages (login, register, trips)..."

cat <<'EOF' > src/pages/login.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';

const LoginPage: React.FC = () => {
  return (
    <Layout>
      <AuthForm mode="login" />
    </Layout>
  );
};

export default LoginPage;
EOF

cat <<'EOF' > src/pages/register.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';

const RegisterPage: React.FC = () => {
  return (
    <Layout>
      <AuthForm mode="register" />
    </Layout>
  );
};

export default RegisterPage;
EOF

cat <<'EOF' > src/pages/trips/[tripId]/index.tsx
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import TripHeader from '@/components/trips/TripHeader';
import FamiliesSection from '@/components/trips/FamiliesSection';
import ExpensesTable from '@/components/trips/ExpensesTable';
import DebtsSummary from '@/components/trips/DebtsSummary';
import type { TripFamily, TripExpense } from '@/types/trip';

// В момента ползваме mock данни, по-късно ще ги заменим с реални от Firestore.
const mockFamilies: TripFamily[] = [
  { id: 'f1', tripId: 't1', name: 'Семейство Иванови' },
  { id: 'f2', tripId: 't1', name: 'Семейство Георгиеви' },
];

const mockExpenses: TripExpense[] = [];

const TripPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;

  const [families] = React.useState<TripFamily[]>(mockFamilies);
  const [expenses, setExpenses] = React.useState<TripExpense[]>(mockExpenses);

  function handleAddExpense(exp: Omit<TripExpense, 'id' | 'createdAt'>) {
    setExpenses((prev) => [
      ...prev,
      {
        ...exp,
        id: `exp_${prev.length + 1}`,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  const tripName = `Пътуване ${tripId ?? ''}`;

  return (
    <Layout>
      <TripHeader
        name={tripName}
        onAddFamily={() => alert('TODO: добавяне на семейство')}
        onOpenLists={() => router.push(`/trips/${tripId}/lists`)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FamiliesSection families={families} />
        <ExpensesTable families={families} expenses={expenses} onAddExpense={handleAddExpense} />
        <DebtsSummary families={families} expenses={expenses} />
      </div>
    </Layout>
  );
};

export default TripPage;
EOF

cat <<'EOF' > src/pages/trips/[tripId]/lists.tsx
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';

const TripListsPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;

  return (
    <Layout>
      <Card>
        <h1 style={{ marginBottom: 8 }}>Списъци за пътуване {tripId}</h1>
        <p>Тук по-късно ще направим списъците (общи и по семейство).</p>
      </Card>
    </Layout>
  );
};

export default TripListsPage;
EOF

echo "▶ Updating home page (index.tsx) to show basic dashboard..."

cat <<'EOF' > src/pages/index.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import TripTypeSelector from '@/components/trips/TripTypeSelector';
import Card from '@/components/ui/Card';
import type { Trip, TripType } from '@/types/trip';
import TripCard from '@/components/trips/TripCard';

const mockTrips: Trip[] = [
  {
    id: 't1',
    ownerId: 'u1',
    type: 'beach',
    name: 'Море 2025 - Гърция',
    createdAt: new Date().toISOString(),
  },
];

const HomePage: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState<TripType | null>(null);
  const [trips] = React.useState<Trip[]>(mockTrips);

  function handleSelect(type: TripType) {
    setSelectedType(type);
    alert(`TODO: ще отворим форма за създаване на пътуване от тип: ${type}`);
  }

  return (
    <Layout>
      <Card>
        <h1 style={{ marginBottom: 8 }}>Моите пътувания</h1>
        <p style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          Избери тип пътуване, за да създадеш ново, или отвори миналите пътувания.
        </p>
        <TripTypeSelector onSelect={handleSelect} />
      </Card>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2>Минали пътувания</h2>
        {trips.length === 0 ? (
          <p>Все още нямаш запазени пътувания.</p>
        ) : (
          trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
EOF

echo "▶ All done! You can now run: npm run dev"
