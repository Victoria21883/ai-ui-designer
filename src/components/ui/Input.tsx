// src/components/ui/Input.tsx
import React from 'react';

interface InputProps {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  className = '',
  style,
  placeholder,
  type = 'text',
  value,
  onChange,
}) => {
  return (
    <input
      type={type}
      className={className}
      style={style}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
