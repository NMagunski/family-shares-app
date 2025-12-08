import React from "react";
import type { TripType } from "@/types/trip";
import { Palmtree, Plane, Luggage } from "lucide-react";

type Props = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-3 max-w-md">
      {/* МОРЕ */}
      <button
        type="button"
        onClick={() => onSelect("beach")}
        className="
          flex w-full items-center gap-3
          rounded-xl border border-eco-border bg-eco-surface-soft
          px-3 py-3
          text-left transition
          hover:border-eco-accent hover:bg-eco-surface
          focus:outline-none focus:ring-2 focus:ring-eco-accent
        "
      >
        <div
          className="
            flex h-10 w-10 flex-shrink-0 items-center justify-center
            rounded-lg bg-eco-surface border border-eco-border
          "
        >
          <Palmtree className="h-5 w-5 text-eco-text" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-eco-text">Море</span>
          <span className="text-xs text-eco-text-muted">
            Идеално за морски почивки, къмпинги и плажни уикенди.
          </span>
        </div>
      </button>

      {/* ЕКСКУРЗИЯ */}
      <button
        type="button"
        onClick={() => onSelect("flight")}
        className="
          flex w-full items-center gap-3
          rounded-xl border border-eco-border bg-eco-surface-soft
          px-3 py-3
          text-left transition
          hover:border-eco-accent hover:bg-eco-surface
          focus:outline-none focus:ring-2 focus:ring-eco-accent
        "
      >
        <div
          className="
            flex h-10 w-10 flex-shrink-0 items-center justify-center
            rounded-lg bg-eco-surface border border-eco-border
          "
        >
          <Plane className="h-5 w-5 text-eco-text" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-eco-text">Екскурзия</span>
          <span className="text-xs text-eco-text-muted">
            Пътувания в чужбина, city break-и и полети.
          </span>
        </div>
      </button>

      {/* ДРУГО */}
      <button
        type="button"
        onClick={() => onSelect("other")}
        className="
          flex w-full items-center gap-3
          rounded-xl border border-eco-border bg-eco-surface-soft
          px-3 py-3
          text-left transition
          hover:border-eco-accent hover:bg-eco-surface
          focus:outline-none focus:ring-2 focus:ring-eco-accent
        "
      >
        <div
          className="
            flex h-10 w-10 flex-shrink-0 items-center justify-center
            rounded-lg bg-eco-surface border border-eco-border
          "
        >
          <Luggage className="h-5 w-5 text-eco-text" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-eco-text">Друго</span>
          <span className="text-xs text-eco-text-muted">
            Разходи за вили, приятелски срещи, общи пътувания и др.
          </span>
        </div>
      </button>
    </div>
  );
};

export default TripTypeSelector;
