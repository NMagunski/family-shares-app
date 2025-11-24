import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { TripType } from '@/types/trip';

type CreateTripModalProps = {
  isOpen: boolean;
  type: TripType;
  onClose: () => void;
  onCreate: (name: string) => void;
};

const typeLabel: Record<TripType, string> = {
  beach: 'Море',
  flight: 'Екскурзия',
  other: 'Друго',
};

const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  type,
  onClose,
  onCreate,
}) => {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-eco-surface shadow-eco-soft">
          <h2 className="mb-2 text-lg font-semibold text-eco-text">
            Ново пътуване
          </h2>
          <p className="mb-4 text-sm text-eco-text-muted">
            Тип: <span className="font-medium text-eco-text">{typeLabel[type]}</span>
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <Input
              label="Име на пътуването"
              placeholder="напр. Море 2025 - Гърция"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Отказ
              </Button>
              <Button type="submit">
                Създай
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateTripModal;
