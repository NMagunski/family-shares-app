import React from 'react';
import type { TripType } from '@/types/trip';
import Button from '@/components/ui/Button';

type TripTypeSelectorProps = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<TripTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => onSelect('beach')}
      >
        🏖 Море
      </Button>

      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => onSelect('flight')}
      >
        ✈️ Екскурзия
      </Button>

      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => onSelect('other')}
      >
        🧳 Друго
      </Button>
    </div>
  );
};

export default TripTypeSelector;
