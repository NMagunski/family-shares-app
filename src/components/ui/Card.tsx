import React from "react";
import clsx from "clsx";
import styles from "./Card.module.css";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ children, className, ...rest }) => {
  return (
    <div className={clsx(styles.card, className)} {...rest}>
      {children}
    </div>
  );
};

export default Card;
