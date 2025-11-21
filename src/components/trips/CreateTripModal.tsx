import React from 'react';
import styles from './CreateTripModal.module.css';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.header}>Ново пътуване</h2>
        <p className={styles.sub}>Тип: {typeLabel[type]}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            label="Име на пътуването"
            placeholder="напр. Море 2025 - Гърция"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Отказ
            </Button>
            <Button type="submit">Създай</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripModal;
