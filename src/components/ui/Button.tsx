import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
      ? styles.secondary
      : variant === 'danger'
      ? styles.danger
      : styles.ghost;

  const cls = [styles.base, variantClass, className]
    .filter(Boolean)
    .join(' ');

  return <button className={cls} {...props} />;
};

export default Button;
