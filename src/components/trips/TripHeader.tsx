import React from 'react';
import styles from './TripHeader.module.css';
import Button from '@/components/ui/Button';

type Props = {
  tripName: string;
  onAddFamily: () => void;
  onOpenLists: () => void;
  onShare: () => void;
};

const TripHeader: React.FC<Props> = ({ tripName, onAddFamily, onOpenLists, onShare }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{tripName}</h1>

      <div className={styles.actions}>
        <Button onClick={onAddFamily}>Добави семейство</Button>

        <button className={styles.secondaryBtn} onClick={onOpenLists}>
          Списъци
        </button>

        <button className={styles.secondaryBtn} onClick={onShare}>
          Сподели
        </button>
      </div>
    </div>
  );
};

export default TripHeader;
