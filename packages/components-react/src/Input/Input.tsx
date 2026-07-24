import React from 'react';
import './styles.css';

interface InputProps {
  /** Label text for the input */
  label?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Input value */
  value?: string;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Required state */
  required?: boolean;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
}

/** Input component with label using design tokens */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
  name,
  id,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className="ds-input-wrapper">
      {label && (
        <label
          htmlFor={inputId}
          className="ds-input-label --ds-utility-label-medium"
        >
          {label}
          {required && <span className="ds-input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        className="ds-input --ds-utility-body-regular-medium"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        {...props}
      />
    </div>
  );
};
