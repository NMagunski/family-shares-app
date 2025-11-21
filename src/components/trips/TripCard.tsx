import React from 'react';
import Card from '@/components/ui/Card';
import type { Trip } from '@/types/trip';
import Link from 'next/link';

type TripCardProps = {
  trip: Trip;
};

const tripTypeLabel: Record<Trip['type'], string> = {
  beach: 'Море',
  flight: 'Екскурзия',
  other: 'Друго',
};

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <Card>
      <h2 style={{ marginBottom: 4 }}>{trip.name}</h2>
      <p style={{ marginBottom: 8, fontSize: '0.9rem', color: '#4b5563' }}>
        Тип: {tripTypeLabel[trip.type]}
      </p>
      <Link href={`/trips/${trip.id}`}>Отвори пътуването</Link>
    </Card>
  );
};

export default TripCard;
