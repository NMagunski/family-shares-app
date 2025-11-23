import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import styles from './TripListsPage.module.css';
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

const TripListsPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdStr = typeof tripId === 'string' ? tripId : '';

  const [tripName, setTripName] = React.useState('');
  const [lists, setLists] = React.useState<TripListWithItems[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newListName, setNewListName] = React.useState('');
  const [creatingList, setCreatingList] = React.useState(false);

  // Зареждаме името на пътуването
  React.useEffect(() => {
    if (!tripIdStr) return;

    async function loadTrip() {
      try {
        const t = await fetchTripById(tripIdStr);
        setTripName(t?.name || '');
      } catch (err) {
        console.error('Грешка при зареждане на пътуването:', err);
      }
    }

    loadTrip();
  }, [tripIdStr]);

  // Зареждаме списъците
  React.useEffect(() => {
    if (!tripIdStr) return;

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
  }, [tripIdStr]);

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

  return (
    <Layout>
      <Card>
        <h1 className={styles.pageTitle}>
          Списъци за пътуване {tripName || '...'}
        </h1>
        <p className={styles.pageSubtitle}>
          Организирай задачите и багажа за това пътуване с един или повече
          списъци. Отметнатите задачи се преместват най-отдолу.
        </p>

        <div className={styles.actionsRow}>
          {!creatingList ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleStartCreateList}
            >
              + Нов списък
            </button>
          ) : (
            <form className={styles.newListForm} onSubmit={handleCreateList}>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Име на списъка (напр. Багаж, За пътя, Пазаруване...)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                autoFocus
              />
              <div className={styles.newListButtons}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCancelCreateList}
                >
                  Отказ
                </button>
                <button type="submit" className={styles.primaryButtonSmall}>
                  Запази
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>

      <div className={styles.listsWrapper}>
        {loading ? (
          <p className={styles.statusText}>Зареждане на списъците...</p>
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : lists.length === 0 ? (
          <p className={styles.emptyText}>
            Все още нямаш списъци за това пътуване. Започни с „Нов списък“ –
            например „Багаж“, „За пътя“ или „Пазаруване“.
          </p>
        ) : (
          <div className={styles.listsGrid}>
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
      <div className={styles.listHeader}>
        <h2 className={styles.listTitle}>{list.name}</h2>
        <button
          type="button"
          className={styles.deleteListButton}
          onClick={() => onDeleteList(list.id)}
        >
          Изтрий списъка
        </button>
      </div>

      <form className={styles.addItemForm} onSubmit={handleSubmit}>
        <input
          className={styles.textInput}
          type="text"
          placeholder="Нова задача или предмет..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <button type="submit" className={styles.primaryButtonSmall}>
          Добави
        </button>
      </form>

      {!hasItems ? (
        <p className={styles.emptyListText}>
          Все още няма елементи в този списък. Добави първата задача или предмет.
        </p>
      ) : (
        <ul className={styles.itemsList}>
          {list.items.map((item) => (
            <li key={item.id} className={styles.itemRow}>
              <label className={styles.itemLabel}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleItem(list.id, item.id)}
                />
                <span
                  className={
                    item.done ? styles.itemTextDone : styles.itemText
                  }
                >
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                className={styles.deleteItemButton}
                onClick={() => onDeleteItem(list.id, item.id)}
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
