import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  color?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
}

const elevationClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  title,
  subtitle,
  elevation = 'md',
  backgroundColor,
  color,
  padding,
  margin,
  borderRadius,
}) => {
  const inlineStyles: React.CSSProperties = {
    ...style,
    backgroundColor: backgroundColor,
    color: color,
    padding: padding,
    margin: margin,
    borderRadius: borderRadius,
  };

  return (
    <div
      className={`bg-white rounded-lg border border-border ${elevationClasses[elevation]} ${className}`}
      style={inlineStyles}
    >
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {subtitle && <p className="text-text-secondary mb-4">{subtitle}</p>}
      {children}
    </div>
  );
};

export default Card;
