import React from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: React.ReactNode;
  compact?: boolean;
};

const Card: React.FC<CardProps> = ({ children, compact }) => {
  return (
    <div className={compact ? styles.cardCompact : styles.card}>
      {children}
    </div>
  );
};

export default Card;
