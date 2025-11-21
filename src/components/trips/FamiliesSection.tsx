import React from 'react';
import type { TripFamily } from '@/types/trip';
import Card from '@/components/ui/Card';

type FamiliesSectionProps = {
  families: TripFamily[];
};

const FamiliesSection: React.FC<FamiliesSectionProps> = ({ families }) => {
  if (families.length === 0) {
    return <p>Няма добавени семейства все още.</p>;
  }

  return (
    <Card>
      <h2 style={{ marginBottom: 8 }}>Семейства</h2>
      <ul style={{ paddingLeft: 16 }}>
        {families.map((f) => (
          <li key={f.id}>{f.name}</li>
        ))}
      </ul>
    </Card>
  );
};

export default FamiliesSection;
