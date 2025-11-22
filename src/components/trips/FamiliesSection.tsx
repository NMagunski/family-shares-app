import React from 'react';
import styles from './FamiliesSection.module.css';
import type { TripFamily } from '@/types/trip';
import { useAuth } from '@/context/AuthContext';

type Props = {
  families: TripFamily[];
  onEditFamily?: (family: TripFamily) => void;
  onDeleteFamily?: (family: TripFamily) => void;
};

const FamiliesSection: React.FC<Props> = ({ families, onEditFamily, onDeleteFamily }) => {
  const { user } = useAuth();

  return (
    <div className={styles.list}>
      {families.map((f) => {
        const isMe = f.userId === user?.uid;

        return (
          <div key={f.id} className={styles.item}>
            <div className={styles.left}>
              <span className={styles.familyIcon}>🧑‍🤝‍🧑</span>
              <span className={styles.name}>{f.name}</span>
              {isMe && <span className={styles.meBadge}>Вие</span>}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                onClick={() => onEditFamily?.(f)}
                title="Редактирай"
              >
                ✏️
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => onDeleteFamily?.(f)}
                title="Изтрий"
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
