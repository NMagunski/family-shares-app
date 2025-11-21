import React from 'react';
import Card from '@/components/ui/Card';
import styles from './SectionCard.module.css';

type SectionCardProps = {
  title: string;
  icon?: string;
  children: React.ReactNode;
};

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.body}>{children}</div>
    </Card>
  );
};

export default SectionCard;
