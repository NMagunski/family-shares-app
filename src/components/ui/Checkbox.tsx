import React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, className = "", ...props }) => {
  const baseClasses =
    "h-4 w-4 rounded border-eco-border bg-eco-surface-soft text-eco-accent focus:ring-2 focus:ring-eco-accent-strong focus:ring-offset-0 cursor-pointer";

  if (!label) {
    return <input type="checkbox" className={`${baseClasses} ${className}`} {...props} />;
  }

  return (
    <label className="flex items-center gap-2 text-eco-text cursor-pointer select-none">
      <input
        type="checkbox"
        className={`${baseClasses} ${className}`}
        {...props}
      />
      <span className="text-sm text-eco-text">{label}</span>
    </label>
  );
};

export default Checkbox;
