import React from "react";
import type { Trip } from "@/types/trip";

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

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 14,
  padding: "24px 24px 20px",
  maxWidth: 420,
  width: "90%",
  border: "1px solid rgba(20, 63, 44, 0.08)",
  boxShadow:
    "0 12px 28px rgba(20, 63, 44, 0.10), 0 20px 46px rgba(43, 181, 124, 0.18)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: 8,
  fontSize: 20,
  fontWeight: 600,
  color: "#143F2C",
};

const textStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: 16,
  fontSize: 14,
  lineHeight: 1.5,
  color: "#406a57",
};

const buttonsRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 12,
};

const baseButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 14,
  cursor: "pointer",
  transition: "background-color 0.15s ease-out, transform 0.1s ease-out",
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
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={titleStyle}>Изтриване на пътуване</h2>

        <p style={textStyle}>
          Сигурен ли си, че искаш да изтриеш „{trip.name}“? Това действие е
          необратимо.
        </p>

        <div style={buttonsRowStyle}>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...baseButtonStyle,
              border: "1px solid #d4ddd6",
              background: "#e6f0ea",
              color: "#143F2C",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d4e4da";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#e6f0ea";
            }}
          >
            Откажи
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            style={{
              ...baseButtonStyle,
              padding: "8px 16px",
              border: "none",
              background: "#ef4444",
              color: "#ffffff",
              fontWeight: 500,
              boxShadow: "0 4px 10px rgba(239, 68, 68, 0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
            }}
          >
            Изтрий
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
