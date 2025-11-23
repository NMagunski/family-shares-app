import React from 'react';
import type { Trip } from '@/types/trip';

interface ArchiveModalProps {
  open: boolean;
  trip: Trip;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/* Overlay – същият, само по-малко агресивен (0.35 вместо 0.4) */
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

/* Modal container – по-мека сянка и елегантен бордер */
const modalStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 22,
  maxWidth: 420,
  width: '90%',

  border: '1px solid rgba(20, 63, 44, 0.08)',  // лек тъмнозелен бордер
  boxShadow:
    '0 10px 24px rgba(20, 63, 44, 0.08), 0 14px 40px rgba(43, 181, 124, 0.15)', // emerald glow
};

/* Row with buttons */
const buttonsRowStyle: React.CSSProperties = {
  marginTop: 20,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
};

/* Base button */
const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'background-color 0.15s ease-out, transform 0.1s ease-out',
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
        <h2 style={{ marginTop: 0, marginBottom: 8, color: '#143F2C' }}>
          {title}
        </h2>

        <p style={{ fontSize: '0.95rem', color: '#406a57', lineHeight: 1.45 }}>
          {description}
        </p>

        <div style={buttonsRowStyle}>
          {/* Cancel button – неутрален */}
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: '#e6f0ea',
              color: '#143F2C',
            }}
            onClick={onClose}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#d4e4da')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#e6f0ea')
            }
          >
            Отказ
          </button>

          {/* Confirm button – emerald primary */}
          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: '#2BB57C',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(43, 181, 124, 0.30)',
            }}
            onClick={onConfirm}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#229565')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#2BB57C')
            }
          >
            Потвърди
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
