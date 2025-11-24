import React from 'react';
import type { TripFamily } from '@/types/trip';
import { useAuth } from '@/context/AuthContext';

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
    <div className="space-y-3">
      {families.map((f) => {
        const isMe = f.userId === user?.uid;

        return (
          <div
            key={f.id}
            className="flex items-center justify-between p-4 rounded-xl 
                       bg-eco-surface-soft border border-eco-border 
                       shadow-eco-soft"
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3">
              <span className="text-xl">🧑‍🤝‍🧑</span>

              <span className="text-eco-text font-medium">{f.name}</span>

              {isMe && (
                <span className="px-2 py-0.5 text-xs rounded-md 
                                 bg-eco-accent/20 text-eco-accent font-semibold">
                  Вие
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              <button
                title="Редактирай"
                onClick={() => onEditFamily?.(f)}
                className="text-eco-text-muted hover:text-eco-accent transition"
              >
                ✏️
              </button>

              <button
                title="Изтрий"
                onClick={() => onDeleteFamily?.(f)}
                className="text-eco-text-muted hover:text-red-400 transition"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FamiliesSection;
