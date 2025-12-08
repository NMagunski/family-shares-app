import React from "react";
import type { TripFamily } from "@/types/trip";
import { useAuth } from "@/context/AuthContext";
import { Users, Pencil, Trash2 } from "lucide-react";

type Props = {
  families: TripFamily[];
  onEditFamily?: (family: TripFamily) => void;
  onDeleteFamily?: (family: TripFamily) => void;
};

const FamiliesSection: React.FC<Props> = ({
  families,
  onEditFamily,
  onDeleteFamily,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-2.5">
      {families.map((f) => {
        const isMe = f.userId === user?.uid;

        return (
          <div
            key={f.id}
            className="
              flex items-center justify-between
              gap-3
              px-3 py-2.5
              rounded-xl 
              bg-eco-surface-soft 
              border border-eco-border 
              shadow-eco-soft
            "
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Users className="h-5 w-5 text-eco-text-muted" />

              <span className="text-eco-text font-medium truncate">
                {f.name}
              </span>

              {isMe && (
                <span
                  className="
                    px-2 py-0.5 
                    text-[11px]
                    rounded-md 
                    bg-eco-accent/18 
                    text-eco-accent 
                    font-semibold
                    whitespace-nowrap
                  "
                >
                  Вие
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                title="Редактирай"
                onClick={() => onEditFamily?.(f)}
                className="
                  p-1 rounded-md
                  text-eco-text-muted hover:text-eco-accent
                  transition
                "
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Изтрий"
                onClick={() => onDeleteFamily?.(f)}
                className="
                  p-1 rounded-md
                  text-eco-text-muted hover:text-red-400
                  transition
                "
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FamiliesSection;
