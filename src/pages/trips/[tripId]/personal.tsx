import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { fetchTripById } from '@/lib/trips';
import type { Trip } from '@/types/trip';
import {
  createPersonalList,
  fetchPersonalListsForTrip,
  fetchPersonalExpensesForList,
  addPersonalExpense,
  deletePersonalExpense,
  deletePersonalList,
  type PersonalExpenseList,
  type PersonalExpense,
} from '@/lib/personalExpenses';
import type { CurrencyCode } from '@/lib/currencies';
import { getCurrencySymbol } from '@/lib/currencies';

const PersonalExpensesPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const { user, loading: authLoading } = useAuth();

  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [lists, setLists] = React.useState<PersonalExpenseList[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [creatingList, setCreatingList] = React.useState(false);
  const [newListName, setNewListName] = React.useState('');

  // 👉 Guard за неавторизирани потребители
  React.useEffect(() => {
    if (!authLoading && !user) {
      const target = router.asPath || `/trips/${tripIdStr}/personal`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, router, tripIdStr]);

  // Зареждаме пътуването (за име + валута)
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    async function loadTrip() {
      try {
        const t = await fetchTripById(tripIdStr);
        setTrip(t);
      } catch (err) {
        console.error('Грешка при зареждане на пътуването:', err);
      }
    }

    loadTrip();
  }, [tripIdStr, user]);

  // Зареждаме личните списъци за това пътуване
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    const userId = user.uid;

    async function loadLists() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPersonalListsForTrip(tripIdStr, userId);
        setLists(data);
      } catch (err) {
        console.error(err);
        setError('Грешка при зареждане на личните разходи.');
      } finally {
        setLoading(false);
      }
    }

    loadLists();
  }, [tripIdStr, user]);

  function handleStartCreateList() {
    setCreatingList(true);
  }

  function handleCancelCreateList() {
    setCreatingList(false);
    setNewListName('');
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !tripIdStr) return;

    const trimmed = newListName.trim();
    if (!trimmed) return;

    try {
      const newList = await createPersonalList(tripIdStr, user.uid, trimmed);
      setLists((prev) => [newList, ...prev]);
      setNewListName('');
      setCreatingList(false);
    } catch (err) {
      console.error(err);
      alert('Грешка при създаване на личен списък.');
    }
  }

  async function handleDeleteList(listId: string) {
    const confirmed = window.confirm(
      'Сигурен ли си, че искаш да изтриеш този личен списък и всички разходи в него?'
    );
    if (!confirmed) return;

    try {
      await deletePersonalList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на личен списък.');
    }
  }

  // Докато auth се зарежда или правим redirect → не показваме съдържанието
  if (authLoading || !user) {
    return (
      <Layout>
        <p className="text-sm text-eco-text-muted">Зареждане...</p>
      </Layout>
    );
  }

  // Валутата на пътуването за личните разходи
  const pageCurrency: CurrencyCode =
    (trip?.currency as CurrencyCode) ?? 'EUR';

  return (
    <Layout>
      <Card>
        {/* Header с заглавие + бутон "← Към детайли" */}
        <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-eco-text mb-1">
              Лични разходи за пътуване
            </h1>
            {trip?.name && (
              <p className="text-xs text-eco-text-muted mb-1">
                Пътуване: <span className="font-semibold">{trip.name}</span>
              </p>
            )}
            <p className="text-sm text-eco-text-muted max-w-xl">
              Създай лични разходни списъци за това пътуване и ги сподели само
              с хората, с които искаш да виждате заедно общите си разходи.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/trips/${tripIdStr}`)}
            className="whitespace-nowrap"
          >
            ← Към детайли
          </Button>
        </div>

        {/* Ред с бутон / форма за нов личен списък */}
        <div className="mt-2">
          {!creatingList ? (
            <Button
              type="button"
              onClick={handleStartCreateList}
              className="px-3 py-2 text-sm"
            >
              + Нов личен списък
            </Button>
          ) : (
            <form
              onSubmit={handleCreateList}
              className="flex flex-col md:flex-row gap-3 items-stretch md:items-center"
            >
              <input
                className="flex-1 rounded-lg border border-eco-border/70 bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
                type="text"
                placeholder="Име на списъка (напр. Аз и жена ми, Семейни лични...)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancelCreateList}
                  className="px-3 py-2 rounded-lg border border-eco-border/60 bg-transparent text-sm text-eco-text-muted hover:bg-eco-surface-soft transition"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition"
                >
                  Запази
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* Лични списъци */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-eco-text-muted">
            Зареждане на личните разходи...
          </p>
        ) : error ? (
          <p className="text-sm text-eco-error">{error}</p>
        ) : lists.length === 0 ? (
          <p className="text-sm text-eco-text-muted">
            Все още нямаш лични разходни списъци за това пътуване. Започни с
            „Нов личен списък“ – например „Аз и жена ми“ или „Семейни лични
            разходи“.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lists.map((list) => (
              <PersonalListCard
                key={list.id}
                list={list}
                currentUserId={user.uid}
                currency={pageCurrency}
                onDeleteList={handleDeleteList}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

type PersonalListCardProps = {
  list: PersonalExpenseList;
  currentUserId: string;
  currency: CurrencyCode;
  onDeleteList: (listId: string) => void;
};

const PersonalListCard: React.FC<PersonalListCardProps> = ({
  list,
  currentUserId,
  currency,
  onDeleteList,
}) => {
  const [items, setItems] = React.useState<PersonalExpense[]>([]);
  const [loadingItems, setLoadingItems] = React.useState(false);
  const [newDescription, setNewDescription] = React.useState('');
  const [newAmount, setNewAmount] = React.useState('');

  // единично място, където решаваме символа
  const currencySymbol = getCurrencySymbol(currency);

  React.useEffect(() => {
    async function loadItems() {
      try {
        setLoadingItems(true);
        const data = await fetchPersonalExpensesForList(list.id);
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingItems(false);
      }
    }

    loadItems();
  }, [list.id]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const trimmedDesc = newDescription.trim();
    if (!trimmedDesc) return;

    const amountNumber = Number(newAmount.replace(',', '.'));
    if (!amountNumber || isNaN(amountNumber)) {
      alert('Моля, въведи валидна сума.');
      return;
    }

    try {
      const newItem = await addPersonalExpense(
        list.id,
        currentUserId,
        trimmedDesc,
        amountNumber
      );
      setItems((prev) => [...prev, newItem]);
      setNewDescription('');
      setNewAmount('');
    } catch (err) {
      console.error(err);
      alert('Грешка при добавяне на разход.');
    }
  }

  async function handleDeleteItem(itemId: string) {
    const confirmed = window.confirm(
      'Сигурен ли си, че искаш да изтриеш този разход?'
    );
    if (!confirmed) return;

    try {
      await deletePersonalExpense(itemId);
      setItems((prev) => prev.filter((it) => it.id !== itemId));
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на разход.');
    }
  }

  function handleCopyShareLink() {
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${origin}/personal/join?token=${list.shareToken}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert('Линкът за споделяне е копиран в клипборда.');
        })
        .catch(() => {
          alert(`Линк за споделяне: ${url}`);
        });
    } catch (err) {
      console.error(err);
      alert('Възникна проблем при генериране на линка за споделяне.');
    }
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      {/* Заглавие + бутони */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-eco-text truncate">
            {list.name}
          </h2>
          <p className="text-xs text-eco-text-muted">
            Членове: {list.memberUserIds.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-2 py-1 rounded-lg border border-emerald-500 text-xs font-medium text-eco-accent hover:bg-emerald-500/10 transition"
          >
            Сподели
          </button>
          <button
            type="button"
            onClick={() => onDeleteList(list.id)}
            className="text-xs font-medium text-eco-error hover:text-eco-error hover:underline transition"
          >
            Изтрий
          </button>
        </div>
      </div>

      {/* Форма за нов разход */}
      <form
        onSubmit={handleAddItem}
        className="flex flex-col sm:flex-row gap-2 mb-3"
      >
        <input
          className="flex-1 rounded-lg border border-eco-border/70 bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
          type="text"
          placeholder="Описание (напр. Дрехи, Вино, Подаръци...)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            className="flex-1 sm:w-32 rounded-lg border border-eco-border/70 bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            type="text"
            placeholder={`Сума (${currencySymbol})`}
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-emerald-500 text-xs sm:text-sm font-medium text-white hover:bg-emerald-600 transition whitespace-nowrap"
          >
            Добави
          </button>
        </div>
      </form>

      {/* Разходи */}
      {loadingItems ? (
        <p className="text-sm text-eco-text-muted">
          Зареждане на разходите...
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-eco-text-muted">
          Все още няма разходи в този списък. Добави първия личен разход – само
          членовете на този списък ще го виждат.
        </p>
      ) : (
        <ul className="space-y-2 mb-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-eco-surface-soft px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm text-eco-text break-words">
                  {item.description}
                </p>
                <p className="text-xs text-eco-text-muted">
                  Сума: {item.amount.toFixed(2)} {currencySymbol}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                className="text-sm text-eco-text-muted hover:text-eco-error transition"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Тотал */}
      <div className="mt-2 border-t border-eco-border/60 pt-2 flex items-center justify-between">
        <span className="text-sm font-medium text-eco-text">
          Общо за този списък:
        </span>
        <span className="text-sm font-semibold text-eco-accent">
          {total.toFixed(2)} {currencySymbol}
        </span>
      </div>
    </Card>
  );
};

export default PersonalExpensesPage;
