import React from 'react';
import type { Trip } from '@/types/trip';

interface ArchiveModalProps {
  open: boolean;
  trip: Trip;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 20,
  maxWidth: 400,
  width: '90%',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};

const buttonsRowStyle: React.CSSProperties = {
  marginTop: 16,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

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
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p style={{ fontSize: '0.95rem' }}>{description}</p>

        <div style={buttonsRowStyle}>
          <button
            type="button"
            style={{ ...buttonStyle, backgroundColor: '#e5e5e5' }}
            onClick={onClose}
          >
            Отказ
          </button>
          <button
            type="button"
            style={{ ...buttonStyle, backgroundColor: '#2563eb', color: '#fff' }}
            onClick={onConfirm}
          >
            Потвърди
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
