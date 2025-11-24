import React from 'react';
import type { TripItineraryItem } from '@/types/trip';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type TripItineraryProps = {
  items: TripItineraryItem[];
  onChange?: (items: TripItineraryItem[]) => void;
};

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
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
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
              className="p-4 rounded-xl border border-eco-border bg-eco-surface-soft shadow-eco-soft"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <Input
                  label="Ден"
                  type="number"
                  value={item.day}
                  min={1}
                  onChange={(e) =>
                    handleUpdate(item.id, { day: Number(e.target.value) || 1 })
                  }
                />

                <Input
                  label="Дата"
                  type="date"
                  value={item.date || ''}
                  onChange={(e) =>
                    handleUpdate(item.id, { date: e.target.value })
                  }
                />

                <Input
                  label="Час / интервал"
                  placeholder="например 10:00–13:00"
                  value={item.time || ''}
                  onChange={(e) =>
                    handleUpdate(item.id, { time: e.target.value })
                  }
                />

                <Input
                  label="Активност"
                  placeholder="Разходка в стария град"
                  value={item.title}
                  onChange={(e) =>
                    handleUpdate(item.id, { title: e.target.value })
                  }
                  required
                />

                <div className="col-span-full">
                  <label className="block text-xs mb-1 text-eco-text-muted">
                    Бележки
                  </label>
                  <textarea
                    value={item.notes || ''}
                    onChange={(e) =>
                      handleUpdate(item.id, { notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Подробности, адрес, билети…"
                    className="
                      w-full resize-y rounded-lg 
                      bg-eco-surface border border-eco-border 
                      p-2 text-eco-text text-sm
                      focus:outline-none focus:ring-2 focus:ring-eco-accent
                    "
                  />
                </div>

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
