import React from 'react';
import styles from './Card.module.css';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const cls = [styles.card, className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
};

export default Card;
