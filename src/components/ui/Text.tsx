// src/components/ui/Text.tsx
import React from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

interface TextProps {
  content?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: TextVariant;
}

// Маппинг вариантов на HTML теги - ВЫНЕСЕН ЗА ПРЕДЕЛЫ КОМПОНЕНТА
const variantToComponent: Record<string, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  span: 'span',
  div: 'div',
  // Альтернативные названия
  body: 'p',
  header: 'h2',
  text: 'p',
};

const Text: React.FC<TextProps> = ({ content, children, className = '', style, variant = 'p' }) => {
  // Просто получаем компонент из маппинга, не создаем новый
  const Component = variantToComponent[variant] || variantToComponent.p;

  return (
    <Component className={className} style={style}>
      {content || children}
    </Component>
  );
};

export default Text;
