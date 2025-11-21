import React from 'react';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const base = variant === 'primary' ? styles.button : styles.buttonSecondary;
  const cls = [base, className].filter(Boolean).join(' ');

  return <button className={cls} {...props} />;
};

export default Button;
