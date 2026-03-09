// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, children, className = '', style, onClick }) => {
  return (
    <button className={className} style={style} onClick={onClick}>
      {text || children}
    </button>
  );
};

export default Button;
