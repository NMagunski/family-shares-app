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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 18,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
          padding: "24px 24px 20px",
          maxWidth: 420,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 8,
            fontSize: 20,
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Изтриване на пътуване
        </h2>

        <p
          style={{
            margin: 0,
            marginBottom: 16,
            fontSize: 14,
            lineHeight: 1.5,
            color: "#4b5563",
          }}
        >
          Сигурен ли си, че искаш да изтриеш „{trip.name}“? Това действие е
          необратимо.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 12,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Откажи
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
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
