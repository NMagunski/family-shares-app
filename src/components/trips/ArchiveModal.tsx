import React from 'react';
import type { Trip } from '@/types/trip';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ArchiveModalProps {
  open: boolean;
  trip: Trip;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({
  open,
  trip,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  const isArchived = trip.archived;
  const title = isArchived ? 'Връщане от архив' : 'Архивиране на пътуване';
  const description = isArchived
    ? `Сигурен ли си, че искаш да върнеш от архив пътуването „${trip.name}“?`
    : `Сигурен ли си, че искаш да архивираш пътуването „${trip.name}“?`;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-eco-surface shadow-eco-soft p-6 border border-eco-border rounded-2xl">
          <h2 className="text-lg font-semibold text-eco-text mb-3">
            {title}
          </h2>

          <p className="text-eco-text-muted mb-6 leading-relaxed">
            {description}
          </p>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Отказ
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onConfirm}
            >
              Потвърди
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArchiveModal;
