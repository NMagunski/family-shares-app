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
    <div>
      <p style={{ marginBottom: 16, color: '#4b5563', fontSize: '0.9rem' }}>
        Добави по дни каква е програмата – активности, часове и бележки.
        Подходящо за самостоятелно организирани пътувания.
      </p>

      {localItems.length === 0 && (
        <p style={{ marginBottom: 16, fontSize: '0.9rem', color: '#6b7280' }}>
          Все още няма добавени дни. Започни с бутона „Добави ден“.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {localItems
          .slice()
          .sort((a, b) => a.day - b.day)
          .map((item) => (
            <div
              key={item.id}
              style={{
                padding: 12,
                border: '1px solid #e5e7eb',
                boxShadow: 'none',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <Input
                    label="Ден"
                    type="number"
                    value={item.day}
                    min={1}
                    onChange={(e) =>
                      handleUpdate(item.id, { day: Number(e.target.value) || 1 })
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Дата"
                    type="date"
                    value={item.date || ''}
                    onChange={(e) =>
                      handleUpdate(item.id, { date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Час / интервал"
                    placeholder="напр. 10:00–13:00"
                    value={item.time || ''}
                    onChange={(e) =>
                      handleUpdate(item.id, { time: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Активност"
                    placeholder="Разходка в стария град"
                    value={item.title}
                    onChange={(e) =>
                      handleUpdate(item.id, { title: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      marginBottom: 4,
                      color: '#4b5563',
                    }}
                  >
                    Бележки
                  </label>
                  <textarea
                    value={item.notes || ''}
                    onChange={(e) =>
                      handleUpdate(item.id, { notes: e.target.value })
                    }
                    rows={2}
                    style={{
                      width: '100%',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      padding: 8,
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                    }}
                    placeholder="Подробности, адрес, билети, резервирани места..."
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
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

      <div style={{ marginTop: 16 }}>
        <Button type="button" onClick={handleAdd}>
          Добави ден
        </Button>
      </div>
    </div>
  );
};

export default TripItinerary;
