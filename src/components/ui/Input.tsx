import React from 'react';
import styles from './Input.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  if (!label) {
    const cls = [styles.input, className].filter(Boolean).join(' ');
    return <input className={cls} {...props} />;
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <input className={styles.input} {...props} />
    </div>
  );
};

export default Input;
