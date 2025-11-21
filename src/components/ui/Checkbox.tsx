import React from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  if (!label) {
    return <input type="checkbox" className={styles.input} {...props} />;
  }

  return (
    <label className={styles.row}>
      <input type="checkbox" className={styles.input} {...props} />
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
