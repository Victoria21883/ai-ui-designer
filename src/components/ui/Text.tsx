import React from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

interface TextProps {
  content?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: TextVariant;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: string;
  fontSize?: string;
  margin?: string;
  padding?: string;
}

const variantToTag: Record<string, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  span: 'span',
  div: 'div',
  body: 'p',
  header: 'h2',
  text: 'p',
};

const Text: React.FC<TextProps> = ({
  content,
  children,
  className = '',
  style,
  variant = 'p',
  color,
  backgroundColor,
  textAlign,
  fontWeight,
  fontSize,
  margin,
  padding,
}) => {
  const Component = variantToTag[variant] || 'p';

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(color && { color }),
    ...(backgroundColor && { backgroundColor }),
    ...(textAlign && { textAlign }),
    ...(fontWeight && { fontWeight }),
    ...(fontSize && { fontSize }),
    ...(margin && { margin }),
    ...(padding && { padding }),
  };

  return (
    <Component className={className} style={inlineStyles}>
      {content || children}
    </Component>
  );
};

export default Text;
