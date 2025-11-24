import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  fetchListsWithItemsForTrip,
  createTripList,
  deleteTripList,
  addTripListItem,
  setTripListItemDone,
  deleteTripListItem,
  TripListItem,
  TripListWithItems,
} from '@/lib/tripLists';
import { fetchTripById } from '@/lib/trips';
import { useAuth } from '@/context/AuthContext';

const TripListsPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const { user, loading: authLoading } = useAuth();

  const [tripName, setTripName] = React.useState('');
  const [lists, setLists] = React.useState<TripListWithItems[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newListName, setNewListName] = React.useState('');
  const [creatingList, setCreatingList] = React.useState(false);

  // 👉 Guard за неавторизирани потребители
  React.useEffect(() => {
    if (!authLoading && !user) {
      const target = router.asPath || `/trips/${tripIdStr}/lists`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, router, tripIdStr]);

  // Зареждаме името на пътуването
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    async function loadTrip() {
      try {
        const t = await fetchTripById(tripIdStr);
        setTripName(t?.name || '');
      } catch (err) {
        console.error('Грешка при зареждане на пътуването:', err);
      }
    }

    loadTrip();
  }, [tripIdStr, user]);

  // Зареждаме списъците
  React.useEffect(() => {
    if (!tripIdStr || !user) return;

    async function loadLists() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchListsWithItemsForTrip(tripIdStr);
        setLists(data);
      } catch (err) {
        console.error(err);
        setError('Грешка при зареждане на списъците.');
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
    const trimmed = newListName.trim();
    if (!trimmed || !tripIdStr) return;

    try {
      const newList = await createTripList(tripIdStr, trimmed);
      setLists((prev) => [{ ...newList, items: [] }, ...prev]);
      setNewListName('');
      setCreatingList(false);
    } catch (err) {
      console.error(err);
      alert('Грешка при създаване на списък.');
    }
  }

  async function handleDeleteList(listId: string) {
    const confirmed = window.confirm(
      'Сигурен ли си, че искаш да изтриеш този списък?'
    );
    if (!confirmed) return;

    try {
      await deleteTripList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на списък.');
    }
  }

  async function handleAddItem(listId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const newItem = await addTripListItem(listId, trimmed);
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: sortItems([...list.items, newItem]),
              }
            : list
        )
      );
    } catch (err) {
      console.error(err);
      alert('Грешка при добавяне на елемент.');
    }
  }

  async function handleToggleItem(listId: string, itemId: string) {
    const targetList = lists.find((l) => l.id === listId);
    if (!targetList) return;

    const item = targetList.items.find((i) => i.id === itemId);
    if (!item) return;

    const newDone = !item.done;

    try {
      await setTripListItemDone(listId, itemId, newDone);

      setLists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;

          const updatedItems = list.items.map((it) =>
            it.id === itemId ? { ...it, done: newDone } : it
          );

          return {
            ...list,
            items: sortItems(updatedItems),
          };
        })
      );
    } catch (err) {
      console.error(err);
      alert('Грешка при обновяване на елемент.');
    }
  }

  async function handleDeleteItem(listId: string, itemId: string) {
    try {
      await deleteTripListItem(listId, itemId);
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
              }
            : list
        )
      );
    } catch (err) {
      console.error(err);
      alert('Грешка при изтриване на елемент.');
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

  return (
    <Layout>
      <Card>
        {/* Header с заглавие + бутон "← Към детайли" */}
        <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-eco-text mb-1">
              Списъци за пътуване {tripName || '...'}
            </h1>
            <p className="text-sm text-eco-text-muted max-w-xl">
              Организирай задачите и багажа за това пътуване с един или повече
              списъци. Отметнатите задачи се преместват най-отдолу.
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

        {/* Ред с бутон / форма за нов списък */}
        <div className="mt-2">
          {!creatingList ? (
            <Button
              type="button"
              onClick={handleStartCreateList}
              className="px-3 py-2 text-sm"
            >
              + Нов списък
            </Button>
          ) : (
            <form
              onSubmit={handleCreateList}
              className="flex flex-col md:flex-row gap-3 items-stretch md:items-center"
            >
              <input
                className="flex-1 rounded-lg border border-eco-border/70 bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
                type="text"
                placeholder="Име на списъка (напр. Багаж, За пътя, Пазаруване...)"
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

      {/* Списъци */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-eco-text-muted">Зареждане на списъците...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : lists.length === 0 ? (
          <p className="text-sm text-eco-text-muted">
            Все още нямаш списъци за това пътуване. Започни с „Нов списък“ –
            например „Багаж“, „За пътя“ или „Пазаруване“.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onAddItem={handleAddItem}
                onToggleItem={handleToggleItem}
                onDeleteItem={handleDeleteItem}
                onDeleteList={handleDeleteList}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

function sortItems(items: TripListItem[]): TripListItem[] {
  return [...items].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) || (a.createdAt ?? 0) - (b.createdAt ?? 0)
  );
}

type ListCardProps = {
  list: TripListWithItems;
  onAddItem: (listId: string, text: string) => void;
  onToggleItem: (listId: string, itemId: string) => void;
  onDeleteItem: (listId: string, itemId: string) => void;
  onDeleteList: (listId: string) => void;
};

const ListCard: React.FC<ListCardProps> = ({
  list,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onDeleteList,
}) => {
  const [newItemText, setNewItemText] = React.useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAddItem(list.id, newItemText);
    setNewItemText('');
  }

  const hasItems = list.items.length > 0;

  return (
    <Card>
      {/* Заглавие на списъка + бутон Изтриване */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-base font-semibold text-eco-text truncate">
          {list.name}
        </h2>
        <button
          type="button"
          onClick={() => onDeleteList(list.id)}
          className="text-xs font-medium text-red-300 hover:text-red-400 hover:underline transition"
        >
          Изтрий списъка
        </button>
      </div>

      {/* Форма за нов елемент */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 mb-3"
      >
        <input
          className="flex-1 rounded-lg border border-eco-border/70 bg-eco-surface-soft px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
          type="text"
          placeholder="Нова задача или предмет..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-emerald-500 text-xs sm:text-sm font-medium text-white hover:bg-emerald-600 transition whitespace-nowrap"
        >
          Добави
        </button>
      </form>

      {/* Елементи в списъка */}
      {!hasItems ? (
        <p className="text-sm text-eco-text-muted">
          Все още няма елементи в този списък. Добави първата задача или предмет.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-eco-surface-soft px-3 py-2"
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleItem(list.id, item.id)}
                  className="mt-1 h-4 w-4 rounded border-eco-border bg-eco-bg text-emerald-500 focus:ring-emerald-500"
                />
                <span
                  className={`text-sm ${
                    item.done
                      ? 'text-eco-text-muted line-through'
                      : 'text-eco-text'
                  }`}
                >
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onDeleteItem(list.id, item.id)}
                className="text-sm text-eco-text-muted hover:text-red-400 transition"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default TripListsPage;
