// src/components/ComponentPalette.tsx
import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { DND_ITEM_TYPES } from '../types/dnd.types';
import type { ComponentType } from '../types/types';

// Компонент для перетаскивания
const DraggableComponent: React.FC<{ type: ComponentType; label: string }> = ({ type, label }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DND_ITEM_TYPES.COMPONENT,
    item: { type: 'COMPONENT', componentType: type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Применяем drag к ref после рендера
  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  return (
    <div
      ref={ref}
      className={`p-3 bg-background rounded border border-border cursor-move hover:border-primary hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {label}
    </div>
  );
};

interface ComponentPaletteProps {
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = () => {
  const components: Array<{ type: ComponentType; label: string }> = [
    { type: 'button', label: 'Кнопка' },
    { type: 'text', label: 'Текст' },
    { type: 'input', label: 'Поле ввода' },
    { type: 'card', label: 'Карточка' },
    { type: 'container', label: 'Контейнер' },
    { type: 'image', label: 'Изображение' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-4">Компоненты</h3>
      {components.map((comp) => (
        <DraggableComponent key={comp.type} type={comp.type} label={comp.label} />
      ))}
    </div>
  );
};

export default ComponentPalette;
