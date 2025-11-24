import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  const baseClasses = `
    w-full rounded-xl border border-eco-border bg-eco-surface-soft 
    text-eco-text px-3 py-2 text-sm shadow-eco-soft
    focus:outline-none focus:ring-2 focus:ring-eco-accent focus:border-eco-accent
    transition
  `;

  if (!label) {
    return (
      <select className={`${baseClasses} ${className}`} {...props}>
        {children}
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-eco-text-muted text-sm font-medium">{label}</label>
      <select className={`${baseClasses} ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
};

export default Select;
