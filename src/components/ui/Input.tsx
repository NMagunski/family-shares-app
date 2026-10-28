import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;
  const baseInputClasses =
    'w-full rounded-lg border border-eco-border bg-eco-surface-soft ' +
    'px-3 py-2 text-base text-eco-text placeholder:text-eco-text-muted ' +
    'focus:outline-none focus:ring-2 focus:ring-eco-accent focus:border-eco-accent ' +
    'transition-colors';

  const inputClassName = `${baseInputClasses} ${className}`.trim();

  if (!label) {
    return <input {...props} id={inputId} className={inputClassName} />;
  }

  return (
    <div className="flex flex-col gap-1 mb-2">
      <label htmlFor={inputId} className="text-xs font-medium text-eco-text-muted">
        {label}
      </label>
      <input {...props} id={inputId} className={inputClassName} />
    </div>
  );
};

export default Input;
