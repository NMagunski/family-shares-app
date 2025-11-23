import React from "react";
import type { Trip } from "@/types/trip";

type ArchiveModalProps = {
  open: boolean;
  trip: Trip | null;
  onClose: () => void;
};

const ArchiveModal: React.FC<ArchiveModalProps> = ({ open, trip, onClose }) => {
  if (!open || !trip) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: 18,
          padding: 24,
          maxWidth: 420,
          width: "90%",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Архивиране на пътуване</h2>
        <p style={{ marginTop: 0, marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
          Засега този модал е само визуален. По-късно можем да вържем реалното
          архивиране за пътуването <strong>„{trip.name}“</strong>.
        </p>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            background: "#34d399", // пастелно зелено
            color: "#0f172a",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Добре
        </button>
      </div>
    </div>
  );
};

export default ArchiveModal;
