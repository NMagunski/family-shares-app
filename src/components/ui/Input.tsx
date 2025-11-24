import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  const baseInputClasses =
    'w-full rounded-lg border border-eco-border bg-eco-surface-soft ' +
    'px-3 py-2 text-sm text-eco-text placeholder:text-eco-text-muted ' +
    'focus:outline-none focus:ring-2 focus:ring-eco-accent focus:border-eco-accent ' +
    'transition-colors';

  const inputClassName = `${baseInputClasses} ${className}`.trim();

  if (!label) {
    return <input className={inputClassName} {...props} />;
  }

  return (
    <div className="flex flex-col gap-1 mb-2">
      <label className="text-xs font-medium text-eco-text-muted">
        {label}
      </label>
      <input className={inputClassName} {...props} />
    </div>
  );
};

export default Input;
