import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';

const TripListsPage: React.FC = () => {
  const router = useRouter();
  const { tripId } = router.query;

  return (
    <Layout>
      <Card>
        <h1 style={{ marginBottom: 8 }}>Списъци за пътуване {tripId}</h1>
        <p>Тук по-късно ще направим общи списъци и списъци по семейство.</p>
      </Card>
    </Layout>
  );
};

export default TripListsPage;
