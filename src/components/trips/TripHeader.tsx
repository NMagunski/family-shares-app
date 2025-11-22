import React from 'react';
import styles from './TripHeader.module.css';
import Button from '../ui/Button';

type TripHeaderProps = {
  tripName: string;
  onAddFamily: () => void;
  onOpenLists: () => void;
  onShare: () => void;
};

const TripHeader: React.FC<TripHeaderProps> = ({
  tripName,
  onAddFamily,
  onOpenLists,
  onShare,
}) => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{tripName}</h1>

      <div className={styles.actions}>
        <Button variant="primary" size="lg" onClick={onAddFamily}>
          Добави семейство
        </Button>

        {/* Тези два вече също са PRIMARY → зелени */}
        <Button variant="primary" size="lg" onClick={onOpenLists}>
          Списъци
        </Button>

        <Button variant="primary" size="lg" onClick={onShare}>
          Сподели
        </Button>
      </div>
    </div>
  );
};

export default TripHeader;
