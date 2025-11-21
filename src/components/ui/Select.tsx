import React from 'react';
import styles from './Select.module.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  if (!label) {
    const cls = [styles.select, className].filter(Boolean).join(' ');
    return (
      <select className={cls} {...props}>
        {children}
      </select>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <select className={styles.select} {...props}>
        {children}
      </select>
    </div>
  );
};

export default Select;
