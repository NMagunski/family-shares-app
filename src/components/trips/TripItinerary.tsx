import React from 'react';
import type { TripItineraryItem } from '@/types/trip';
import Button from '@/components/ui/Button';

type TripItineraryProps = {
  items: TripItineraryItem[];
  onChange?: (items: TripItineraryItem[]) => void;
};

const inputBaseClasses =
  'w-full rounded-xl border border-emerald-400/60 bg-eco-surface-soft ' +
  'px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-300';

const TripItinerary: React.FC<TripItineraryProps> = ({ items, onChange }) => {
  const [localItems, setLocalItems] = React.useState<TripItineraryItem[]>(items || []);

  React.useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  function emitChange(updated: TripItineraryItem[]) {
    setLocalItems(updated);
    onChange?.(updated);
  }

  function handleAdd() {
    const nextDay =
      localItems.length > 0 ? Math.max(...localItems.map((i) => i.day)) + 1 : 1;

    const newItem: TripItineraryItem = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      day: nextDay,
      title: '',
      time: '',
      notes: '',
    };

    emitChange([...localItems, newItem]);
  }

  function handleUpdate(id: string, patch: Partial<TripItineraryItem>) {
    const updated = localItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    emitChange(updated);
  }

  function handleDelete(id: string) {
    const updated = localItems.filter((item) => item.id !== id);
    emitChange(updated);
  }

  return (
    <div className="text-eco-text">
      <p className="mb-4 text-sm text-eco-text-muted">
        Добави по дни каква е програмата – активности, часове и бележки.
      </p>

      {localItems.length === 0 && (
        <p className="mb-4 text-sm text-eco-text-muted/70">
          Все още няма добавени дни. Започни с бутона „Добави ден“.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {localItems
          .slice()
          .sort((a, b) => a.day - b.day)
          .map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-emerald-500/30 bg-eco-surface-soft p-4 shadow-eco-soft"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Ден */}
                <div className="space-y-2">
                  <label
                    htmlFor={`day-${item.id}`}
                    className="block text-xs font-medium text-eco-text-muted"
                  >
                    Ден
                  </label>
                  <input
                    id={`day-${item.id}`}
                    type="number"
                    min={1}
                    value={item.day}
                    className={inputBaseClasses}
                    onChange={(e) =>
                      handleUpdate(item.id, {
                        day: Number(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                {/* Дата */}
                <div className="space-y-2">
                  <label
                    htmlFor={`date-${item.id}`}
                    className="block text-xs font-medium text-eco-text-muted"
                  >
                    Дата
                  </label>
                  <input
                    id={`date-${item.id}`}
                    type="date"
                    value={item.date || ''}
                    className={inputBaseClasses}
                    onChange={(e) =>
                      handleUpdate(item.id, {
                        date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Час / интервал */}
                <div className="space-y-2">
                  <label
                    htmlFor={`time-${item.id}`}
                    className="block text-xs font-medium text-eco-text-muted"
                  >
                    Час / интервал
                  </label>
                  <input
                    id={`time-${item.id}`}
                    type="text"
                    placeholder="например 10:00–13:00"
                    value={item.time || ''}
                    className={inputBaseClasses}
                    onChange={(e) =>
                      handleUpdate(item.id, {
                        time: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Активност */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <label
                    htmlFor={`title-${item.id}`}
                    className="block text-xs font-medium text-eco-text-muted"
                  >
                    Активност
                  </label>
                  <input
                    id={`title-${item.id}`}
                    type="text"
                    placeholder="Разходка в стария град"
                    value={item.title}
                    required
                    className={inputBaseClasses}
                    onChange={(e) =>
                      handleUpdate(item.id, {
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Бележки */}
                <div className="col-span-full space-y-2">
                  <label className="block text-xs font-medium text-eco-text-muted">
                    Бележки
                  </label>
                  <textarea
                    value={item.notes || ''}
                    onChange={(e) =>
                      handleUpdate(item.id, { notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Подробности, адрес, билети…"
                    className={
                      'w-full resize-y rounded-xl border border-emerald-400/60 bg-eco-surface-soft ' +
                      'px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted ' +
                      'focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-300'
                    }
                  />
                </div>

                {/* Бутон за изтриване */}
                <div className="col-span-full flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDelete(item.id)}
                  >
                    Изтрий ден
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-4">
        <Button type="button" onClick={handleAdd}>
          Добави ден
        </Button>
      </div>
    </div>
  );
};

export default TripItinerary;
