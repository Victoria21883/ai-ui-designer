// src/components/Canvas.tsx
import React, { useRef, useEffect, useState } from 'react'; // Добавили useState
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
        onDropComponent?.(item, dropPosition || undefined);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [onDropComponent]
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
              totalComponents={components.length} // ДОБАВИЛИ: передаем общее количество
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
  totalComponents?: number; // ДОБАВИЛИ: общее количество компонентов
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
  totalComponents = 0,
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
  const [isHovered, setIsHovered] = useState(false); // ДОБАВИЛИ: состояние наведения

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
        if (!dragRef.current) return;

        const dragId = item.componentId;
        const hoverId = component.id;
        if (dragId === hoverId) return;
        onMove?.(dragId!, hoverId);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onMove, component.id]
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

  // ДОБАВИЛИ: проверка возможности перемещения
  const canMoveUp = index > 0;
  const canMoveDown = index < totalComponents - 1;

  return (
    <div
      ref={previewRef}
      onClick={() => onSelect?.(component.id)}
      onMouseEnter={() => setIsHovered(true)} // ДОБАВИЛИ
      onMouseLeave={() => setIsHovered(false)} // ДОБАВИЛИ
      className={`relative group transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''} ${
        isOver ? 'border-t-2 border-primary' : ''
      }`}
    >
      {/* Drag область (невидимая, для перетаскивания) */}
      <div ref={dragRef} className="absolute inset-0 cursor-move" />

      {/* Drop область (невидимая, для определения места сброса) */}
      <div ref={dropRef} className="absolute inset-0 pointer-events-none" />

      {/* Рендерим сам компонент */}
      <Renderer component={component} />

      {/* Контролы компонента - появляются при наведении ИЛИ при выделении */}
      {(isHovered || isSelected) && ( // ИЗМЕНИЛИ: добавили условие с isSelected
        <div className="absolute top-2 right-2 flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10">
          {/* Кнопка вверх - отключается если нельзя */}
          <button
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            className={`p-1 rounded text-sm transition-colors ${
              !canMoveUp ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Вверх"
          >
            ↑
          </button>
          {/* Кнопка вниз - отключается если нельзя */}
          <button
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            className={`p-1 rounded text-sm transition-colors ${
              !canMoveDown ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Вниз"
          >
            ↓
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 rounded text-gray-600 hover:bg-gray-100 text-sm transition-colors"
            title="Дублировать"
          >
            📋
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-gray-600 hover:bg-red-100 hover:text-red-600 text-sm transition-colors"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Маркер перетаскивания */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 bg-gray-200 rounded cursor-move text-xs">⋮⋮</div>
      </div>

      {/* Левая подсветка при выделении */}
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />}
    </div>
  );
};

export default Canvas;
