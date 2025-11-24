import React from "react";
import type { TripType } from "@/types/trip";

type Props = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* МОРЕ */}
      <button
        type="button"
        onClick={() => onSelect("beach")}
        className="
          flex flex-col items-center justify-center
          gap-2
          px-6 py-4
          rounded-2xl
          bg-eco-surface-soft
          border border-eco-border
          shadow-eco-soft
          text-eco-text
          hover:bg-eco-surface
          hover:border-eco-accent
          hover:shadow-lg
          transition
          min-w-[120px]
        "
      >
        <span className="text-3xl" aria-hidden="true">
          🏖️
        </span>
        <span className="text-sm font-medium tracking-wide">Море</span>
      </button>

      {/* ЕКСКУРЗИЯ / ПОЛЕТ */}
      <button
        type="button"
        onClick={() => onSelect("flight")}
        className="
          flex flex-col items-center justify-center
          gap-2
          px-6 py-4
          rounded-2xl
          bg-eco-surface-soft
          border border-eco-border
          shadow-eco-soft
          text-eco-text
          hover:bg-eco-surface
          hover:border-eco-accent
          hover:shadow-lg
          transition
          min-w-[120px]
        "
      >
        <span className="text-3xl" aria-hidden="true">
          ✈️
        </span>
        <span className="text-sm font-medium tracking-wide">Екскурзия</span>
      </button>

      {/* ДРУГО */}
      <button
        type="button"
        onClick={() => onSelect("other")}
        className="
          flex flex-col items-center justify-center
          gap-2
          px-6 py-4
          rounded-2xl
          bg-eco-surface-soft
          border border-eco-border
          shadow-eco-soft
          text-eco-text
          hover:bg-eco-surface
          hover:border-eco-accent
          hover:shadow-lg
          transition
          min-w-[120px]
        "
      >
        <span className="text-3xl" aria-hidden="true">
          🧳
        </span>
        <span className="text-sm font-medium tracking-wide">Друго</span>
      </button>
    </div>
  );
};

export default TripTypeSelector;
