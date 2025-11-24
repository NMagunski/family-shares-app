import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  ...props
}) => {
  const base =
    'px-4 py-2 rounded-lg font-medium transition duration-150 shadow-sm';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-eco-accent-strong text-white hover:bg-eco-accent font-semibold',
    secondary:
      'bg-eco-surface-soft text-eco-text hover:bg-eco-surface border border-eco-border',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
    ghost:
      'bg-transparent text-eco-text hover:bg-eco-surface-soft border border-transparent',
  };

  const cls = `${base} ${variants[variant]} ${className}`;

  return <button className={cls} {...props} />;
};

export default Button;
