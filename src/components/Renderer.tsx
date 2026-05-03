import React from 'react';
import { Container, Button, Text, Input, Card } from './ui';
import type { UIComponent } from '../types/types';

type AnyProps = Record<string, unknown>;
type AnyComponent = React.ComponentType<AnyProps>;

const ImageComponent: React.FC<AnyProps> = (props) => (
  <img
    src={(props.src as string) || 'https://via.placeholder.com/150?text=No+Image'}
    alt={(props.alt as string) || ''}
    style={props.style as React.CSSProperties}
    className={props.className as string}
  />
);

const componentMap: Record<string, AnyComponent> = {
  container: Container as AnyComponent,
  button: Button as AnyComponent,
  text: Text as AnyComponent,
  input: Input as AnyComponent,
  card: Card as AnyComponent,
  image: ImageComponent as AnyComponent,
  header: Text as AnyComponent,
  p: Text as AnyComponent,
  span: Text as AnyComponent,
  div: Container as AnyComponent,
};

interface RendererProps {
  component: UIComponent | UIComponent[] | unknown;
  depth?: number;
  children?: React.ReactNode;
}

const Renderer: React.FC<RendererProps> = ({ component, depth = 0, children }) => {
  if (depth > 20 || !component) return null;

  if (Array.isArray(component)) {
    return (
      <>
        {component.map((item, index) => (
          <Renderer key={item.id || index} component={item} depth={depth + 1} />
        ))}
      </>
    );
  }

  const comp = component as UIComponent;
  const type = String(comp.type || '').toLowerCase();
  const props = comp.props || {};

  const calculatedStyle: React.CSSProperties = {
    width: (props.width as string) || 'auto',
    height: (props.height as string) || 'auto',
    display:
      type === 'image'
        ? 'block'
        : type === 'container' || type === 'card'
          ? 'flex'
          : 'inline-block',
    objectFit: (props.objectFit as React.CSSProperties['objectFit']) || 'cover',
    flexDirection: (props.direction as React.CSSProperties['flexDirection']) || 'column',
    gap: props.gap ? `${props.gap}px` : '0px',
    padding: props.padding ? `${props.padding}px` : '0px',
    margin: props.margin as string,
    backgroundColor: props.backgroundColor as string,
    color: props.color as string,
    borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,

    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',

    justifyContent:
      props.justify === 'center'
        ? 'center'
        : props.justify === 'end'
          ? 'flex-end'
          : props.justify === 'between'
            ? 'space-between'
            : 'flex-start',
    alignItems:
      props.align === 'center' ? 'center' : props.align === 'end' ? 'flex-end' : 'stretch',
    textAlign: props.textAlign as React.CSSProperties['textAlign'],
  };

  const Component = componentMap[type] || Text;

  const finalProps = {
    ...props,
    style: { ...calculatedStyle, ...((props.style as React.CSSProperties) || {}) },
    className: (props.className as string) || '',
  };

  const renderContent = () => {
    if (children) {
      return children;
    }
    if (comp.children && comp.children.length > 0) {
      return <Renderer component={comp.children} depth={depth + 1} />;
    }
    return null;
  };

  return <Component {...finalProps}>{renderContent()}</Component>;
};

export default Renderer;
