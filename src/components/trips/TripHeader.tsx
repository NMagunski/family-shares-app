import React from 'react';
import Button from '@/components/ui/Button';
import styles from './TripHeader.module.css';

type TripHeaderProps = {
  name: string;
  onAddFamily?: () => void;
  onOpenLists?: () => void;
  onShare?: () => void;
};

const TripHeader: React.FC<TripHeaderProps> = ({ name, onAddFamily, onOpenLists, onShare }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.actions}>
        <Button onClick={onAddFamily}>Добави семейство</Button>
        <Button variant="secondary" onClick={onOpenLists}>
          Списъци
        </Button>
        <Button variant="secondary" onClick={onShare}>
          Сподели
        </Button>
      </div>
    </div>
  );
};

export default TripHeader;
