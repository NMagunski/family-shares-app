import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`
        bg-eco-surface 
        border border-eco-border 
        rounded-2xl 
        shadow-eco-soft 
        p-5 
        text-eco-text
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
