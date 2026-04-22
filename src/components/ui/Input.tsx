// src/components/ui/Input.tsx
import React from 'react';

interface InputProps {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  type?: string;
  value?: string;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color?: string; // Добавлено
  backgroundColor?: string; // Добавлено
  width?: string; // Добавлено
  height?: string; // Добавлено
  margin?: string; // Добавлено
  padding?: string; // Добавлено
  borderRadius?: string; // Добавлено
}

const Input: React.FC<InputProps> = ({
  className = '',
  style,
  placeholder,
  type = 'text',
  value,
  label,
  onChange,
  color,
  backgroundColor,
  width,
  height,
  margin,
  padding,
  borderRadius,
}) => {
  const inlineStyles: React.CSSProperties = {
    ...style,
    color: color,
    backgroundColor: backgroundColor,
    width: width,
    height: height,
    margin: margin,
    padding: padding,
    borderRadius: borderRadius,
  };

  return (
    <div style={{ margin, width }}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      )}
      <input
        type={type}
        className={`w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background ${className}`}
        style={inlineStyles}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
