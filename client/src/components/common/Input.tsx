import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  as = 'input',
  rows,
  ...props
}) => {
  const baseClasses = `w-full px-4 py-2 border border-border-light rounded focus:outline-none focus:border-black ${
    error ? 'border-status-error' : ''
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          className={baseClasses}
          rows={rows}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input className={baseClasses} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
    </div>
  );
};

export default Input;

