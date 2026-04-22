// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  color?: string; // Добавлено
  backgroundColor?: string; // Добавлено
  width?: string; // Добавлено
  height?: string; // Добавлено
  margin?: string; // Добавлено
  padding?: string; // Добавлено
  borderRadius?: string; // Добавлено
}

const Button: React.FC<ButtonProps> = ({
  text,
  children,
  className = '',
  style,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  color,
  backgroundColor,
  width,
  height,
  margin,
  padding,
  borderRadius,
}) => {
  // Базовые классы в зависимости от варианта
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
  };

  // Размеры
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Собираем inline стили из пропсов
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
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className}`}
      style={inlineStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {text || children}
    </button>
  );
};

export default Button;
