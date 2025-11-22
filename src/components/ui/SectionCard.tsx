import React from 'react';
import styles from './SectionCard.module.css';

type SectionCardProps = {
  title: string;
  icon?: React.ReactNode;   // може да е емоджи или икона
  subtitle?: string;        // по желание – малък текст под заглавието
  children: React.ReactNode;
};

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  subtitle,
  children,
}) => {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div>
            <div className={styles.title}>{title}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
        </div>
      </header>

      <div className={styles.body}>{children}</div>
    </section>
  );
};

export default SectionCard;
