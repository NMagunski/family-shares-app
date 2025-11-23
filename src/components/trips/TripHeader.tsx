import React from 'react';
import styles from './TripHeader.module.css';
import Button from '@/components/ui/Button';

type Props = {
  tripName: string;
  onAddFamily: () => void;
  onOpenLists: () => void;
  onShare: () => void;
  onOpenSettings: () => void;
};

const TripHeader: React.FC<Props> = ({
  tripName,
  onAddFamily,
  onOpenLists,
  onShare,
  onOpenSettings,
}) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{tripName}</h1>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onAddFamily}>
          + Добави семейство
        </Button>

        <Button variant="secondary" onClick={onOpenLists}>
          📝 Списъци
        </Button>

        <Button variant="secondary" onClick={onShare}>
          🔗 Сподели
        </Button>

        <Button variant="secondary" onClick={onOpenSettings}>
          ⚙️ Настройки
        </Button>
      </div>
    </div>
  );
};

export default TripHeader;
