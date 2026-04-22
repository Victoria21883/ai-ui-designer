// src/components/Renderer.tsx
import React from 'react';
import { Container, Button, Text, Input, Card } from './ui';
import type { UIComponent } from '../types/types';

type AnyProps = Record<string, unknown>;
type AnyComponent = React.ComponentType<AnyProps>;

// Маппинг типов компонентов с правильными соответствиями
const componentMap: Record<string, AnyComponent> = {
  container: Container as AnyComponent,
  button: Button as AnyComponent,
  text: Text as AnyComponent,
  input: Input as AnyComponent,
  card: Card as AnyComponent,
  header: Text as AnyComponent,
  p: Text as AnyComponent,
  span: Text as AnyComponent,
  div: Container as AnyComponent,
  // Игнорируем body - он будет обработан как text
};

interface RendererProps {
  component: UIComponent | UIComponent[] | unknown;
  depth?: number;
}

const Renderer: React.FC<RendererProps> = ({ component, depth = 0 }) => {
  // Защита от слишком глубокой рекурсии
  if (depth > 20) {
    console.warn('Слишком глубокая вложенность компонентов');
    return null;
  }

  // Если компонент - массив
  if (Array.isArray(component)) {
    if (component.length === 0) return null;

    return (
      <>
        {component.map((item, index) => {
          const itemId =
            item && typeof item === 'object' && 'id' in item
              ? String(item.id)
              : `item-${depth}-${index}`;
          return <Renderer key={itemId} component={item} depth={depth + 1} />;
        })}
      </>
    );
  }

  // Если компонент не определен
  if (!component || typeof component !== 'object') {
    return null;
  }

  const comp = component as AnyProps;
  let type = String(comp.type || '').toLowerCase();

  // Заменяем недопустимые типы
  if (type === 'body') {
    console.warn('Заменяем <body> на <p>');
    type = 'p';
  }

  const props = (comp.props as AnyProps) || {};
  const children = comp.children;
  const styles = comp.styles as AnyProps | undefined;

  const Component = componentMap[type];

  if (!Component) {
    console.warn(`Unknown component type: ${type}, используем Text`);
    // По умолчанию используем Text для неизвестных типов
    return <Text className={styles?.className as string}>{children as React.ReactNode}</Text>;
  }

  const finalProps: AnyProps = {
    ...props,
    className: styles?.className || props.className || '',
    color: props.color,
    backgroundColor: props.backgroundColor,
    width: props.width,
    height: props.height,
    margin: props.margin,
    padding: props.padding,
    borderRadius: props.borderRadius,
    textAlign: props.textAlign,
    fontWeight: props.fontWeight,
    fontSize: props.fontSize,
  };

  if (styles) {
    finalProps.style = styles;
  }

  // Функция для рендеринга детей
  const renderContent = () => {
    if (!children) return null;

    if (Array.isArray(children)) {
      return <Renderer component={children} depth={depth + 1} />;
    }

    if (typeof children === 'object') {
      return <Renderer component={children} depth={depth + 1} />;
    }

    return children;
  };

  return <Component {...finalProps}>{renderContent()}</Component>;
};

export default Renderer;
