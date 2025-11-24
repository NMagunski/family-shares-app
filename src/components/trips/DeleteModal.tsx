import React from 'react';
import type { Trip } from '@/types/trip';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type DeleteModalProps = {
  /** Дали модалът да е отворен */
  open: boolean;
  /** Пътуването, което трием (може да е null, когато няма избрано) */
  trip: Trip | null;
  /** Затваряне без действие */
  onClose: () => void;
  /** Потвърждение за триене – по избор */
  onConfirm?: (id: string) => void;
};

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  trip,
  onClose,
  onConfirm,
}) => {
  if (!open || !trip) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(trip.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-eco-surface shadow-eco-soft p-6 border border-eco-border rounded-2xl">
          <h2 className="text-lg font-semibold text-eco-text mb-3">
            Изтриване на пътуване
          </h2>

          <p className="text-sm text-eco-text-muted mb-6 leading-relaxed">
            Сигурен ли си, че искаш да изтриеш „
            <span className="font-medium text-eco-text">{trip.name}</span>
            “? Това действие е необратимо.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Откажи
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
            >
              Изтрий
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeleteModal;
