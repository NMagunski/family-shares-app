import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Потвърди',
  cancelLabel = 'Отказ',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-60 bg-black/40 
        flex items-center justify-center p-4
      "
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-eco-surface text-eco-text shadow-eco-soft p-6 rounded-2xl">
          {/* Заглавие */}
          <h2 className="text-xl font-semibold mb-2">{title}</h2>

          {/* Описание */}
          {description && (
            <p className="text-eco-text-muted text-sm mb-4 leading-relaxed">
              {description}
            </p>
          )}

          {/* Бутоните */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="
                bg-eco-surface-soft text-eco-text-muted
                hover:bg-eco-border
              "
            >
              {cancelLabel}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmModal;
