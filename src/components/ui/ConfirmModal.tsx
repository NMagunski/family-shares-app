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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ maxWidth: 420, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <h2 style={{ marginBottom: 8 }}>{title}</h2>
          {description && (
            <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>{description}</p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#e5e7eb', color: '#111827' }}
            >
              {cancelLabel}
            </Button>
            <Button type="button" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmModal;
