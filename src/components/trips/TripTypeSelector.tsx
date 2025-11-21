import React from 'react';
import Button from '@/components/ui/Button';
import styles from './TripTypeSelector.module.css';
import type { TripType } from '@/types/trip';

type TripTypeSelectorProps = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<TripTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className={styles.wrapper}>
      <Button onClick={() => onSelect('beach')}>🏖️ Море</Button>
      <Button onClick={() => onSelect('flight')}>✈️ Екскурзия</Button>
      <Button onClick={() => onSelect('other')}>🧳 Друго</Button>
    </div>
  );
};

export default TripTypeSelector;
