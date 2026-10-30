import React from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; labelAction?: React.ReactNode };

export default function Input({ label, labelAction, className = '', type, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;
  const [showPassword, setShowPassword] = React.useState(false);
  const Icon = type === 'email' ? Mail : type === 'password' ? LockKeyhole : props.autoComplete === 'username' ? UserRound : null;
  return <div className="input-group">
    {label && <div className="input-label-row"><label htmlFor={inputId}>{label}</label>{labelAction}</div>}
    <div className={`input-shell ${Icon ? 'has-icon' : ''} ${type === 'password' ? 'has-toggle' : ''}`}>
      {Icon && <Icon size={20} aria-hidden="true" className="input-icon" />}
      <input {...props} type={type === 'password' && showPassword ? 'text' : type} id={inputId} className={`input-control ${className}`} />
      {type === 'password' && <button type="button" className="password-toggle" aria-label={showPassword ? 'Скрий паролата' : 'Покажи паролата'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button>}
    </div>
  </div>;
}
