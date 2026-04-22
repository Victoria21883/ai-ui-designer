import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between';
  align?: 'start' | 'center' | 'end';
  gap?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  width?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  style,
  direction = 'column',
  justify = 'start',
  align = 'start',
  gap = '1rem',
  padding,
  margin,
  backgroundColor,
  width,
}) => {
  const flexDirection = direction === 'row' ? 'row' : 'column';

  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
  };

  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  };

  const inlineStyles: React.CSSProperties = {
    ...style,
    display: 'flex',
    flexDirection: flexDirection,
    justifyContent: justifyMap[justify] || 'flex-start',
    alignItems: alignMap[align] || 'flex-start',
    gap: gap,
    padding: padding,
    margin: margin,
    backgroundColor: backgroundColor,
    width: width,
  };

  return (
    <div className={className} style={inlineStyles}>
      {children}
    </div>
  );
};

export default Container;
