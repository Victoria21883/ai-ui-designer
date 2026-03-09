// src/components/Canvas.tsx
import React, { useRef, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import Renderer from './Renderer';
import { DND_ITEM_TYPES } from '../types/dnd.types';
import type { UIComponent } from '../types/types';
import type { DragItem } from '../types/dnd.types';

interface CanvasProps {
  components: UIComponent[];
  onSelectComponent?: (id: string) => void;
  selectedId?: string | null;
  onDropComponent?: (item: DragItem, position?: { x: number; y: number }) => void;
  onMoveComponent?: (dragId: string, hoverId: string) => void;
  onDeleteComponent?: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  components,
  onSelectComponent,
  selectedId,
  onDropComponent,
  onMoveComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveUp,
  onMoveDown,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  // Настройка области сброса
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [DND_ITEM_TYPES.COMPONENT, DND_ITEM_TYPES.EXISTING_COMPONENT],
      drop: (item: DragItem, monitor) => {
        const dropPosition = monitor.getClientOffset();
        // Здесь будет вызываться актуальная функция из пропсов
        onDropComponent?.(item, dropPosition || undefined);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [onDropComponent, components] // ДОБАВЬТЕ ЭТИ ЗАВИСИМОСТИ
  );

  // Применяем drop к dropRef через useEffect
  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  return (
    <div
      ref={dropRef}
      className={`min-h-full bg-white rounded-lg shadow-sm border-2 p-8 transition-colors ${
        isOver && canDrop ? 'border-primary bg-primary/5' : 'border-dashed border-border'
      }`}
    >
      {components.length > 0 ? (
        <div className="space-y-4">
          {components.map((component, index) => (
            <DraggableComponentWrapper
              key={component.id}
              component={component}
              index={index}
              onSelect={onSelectComponent}
              isSelected={selectedId === component.id}
              onMove={onMoveComponent}
              onDelete={onDeleteComponent}
              onDuplicate={onDuplicateComponent}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-text-secondary py-12">
          <p className="mb-2">✨ Холст пуст</p>
          <p className="text-sm">
            {isOver ? 'Отпустите, чтобы добавить компонент' : 'Перетащите компоненты сюда'}
          </p>
        </div>
      )}
    </div>
  );
};

// Обертка для перетаскивания существующих компонентов
const DraggableComponentWrapper: React.FC<{
  component: UIComponent;
  index: number;
  onSelect?: (id: string) => void;
  isSelected: boolean;
  onMove?: (dragId: string, hoverId: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}> = ({
  component,
  index,
  onSelect,
  isSelected,
  onMove,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Настройка перетаскивания
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: DND_ITEM_TYPES.EXISTING_COMPONENT,
    item: {
      type: 'EXISTING_COMPONENT',
      componentId: component.id,
      index,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Настройка сброса для переупорядочивания
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DND_ITEM_TYPES.EXISTING_COMPONENT,
      hover: (item: DragItem) => {
        const dragId = item.componentId;
        const hoverId = component.id;
        if (dragId === hoverId) return;
        onMove?.(dragId!, hoverId);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onMove, component.id] // ДОБАВЬТЕ ЗАВИСИМОСТИ
  );

  // Применяем drag, drop и preview через useEffect
  useEffect(() => {
    if (dragRef.current) {
      drag(dragRef.current);
    }
    if (previewRef.current) {
      preview(previewRef.current);
    }
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drag, preview, drop]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(component.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(component.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveUp?.(component.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveDown?.(component.id);
  };

  return (
    <div
      ref={previewRef}
      onClick={() => onSelect?.(component.id)}
      className={`relative group cursor-move transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''} ${isOver ? 'border-t-2 border-primary' : ''}`}
    >
      {/* Drag область (невидимая, для перетаскивания) */}
      <div ref={dragRef} className="absolute inset-0 cursor-move" />

      {/* Drop область (невидимая, для определения места сброса) */}
      <div ref={dropRef} className="absolute inset-0 pointer-events-none" />

      {/* Рендерим сам компонент */}
      <Renderer component={component} />

      {/* Контролы компонента */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleMoveUp}
          className="p-1 bg-white rounded shadow hover:bg-gray-100 text-sm"
          title="Вверх"
        >
          ↑
        </button>
        <button
          onClick={handleMoveDown}
          className="p-1 bg-white rounded shadow hover:bg-gray-100 text-sm"
          title="Вниз"
        >
          ↓
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1 bg-white rounded shadow hover:bg-gray-100 text-sm"
          title="Дублировать"
        >
          📋
        </button>
        <button
          onClick={handleDelete}
          className="p-1 bg-white rounded shadow hover:bg-red-100 text-red-600 text-sm"
          title="Удалить"
        >
          🗑️
        </button>
      </div>

      {/* Маркер перетаскивания */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 bg-gray-200 rounded cursor-move text-xs">⋮⋮</div>
      </div>
    </div>
  );
};

export default Canvas;
