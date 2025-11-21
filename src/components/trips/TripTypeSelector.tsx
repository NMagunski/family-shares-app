import React from 'react';
import type { TripType } from '@/types/trip';
import styles from './TripTypeSelector.module.css';

type Props = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.optionButton}
        onClick={() => onSelect('beach')}
      >
        <span className={styles.emoji}>🏖️</span>
        <span className={styles.label}>Море</span>
      </button>

      <button
        type="button"
        className={styles.optionButton}
        onClick={() => onSelect('flight')}
      >
        <span className={styles.emoji}>✈️</span>
        <span className={styles.label}>Екскурзия</span>
      </button>

      <button
        type="button"
        className={styles.optionButton}
        onClick={() => onSelect('other')}
      >
        <span className={styles.emoji}>🧳</span>
        <span className={styles.label}>Друго</span>
      </button>
    </div>
  );
};

export default TripTypeSelector;
