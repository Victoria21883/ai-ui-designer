import React, { useRef, useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Resizable } from 're-resizable';
import Renderer from './Renderer';
import { DND_ITEM_TYPES } from '../types/dnd.types';
import type { DragItem } from '../types/dnd.types';
import type { UIComponent } from '../types/types';

interface CanvasProps {
  components: UIComponent[];
  onSelectComponent?: (id: string) => void;
  selectedId?: string | null;
  onDropComponent?: (
    item: DragItem,
    position?: { x: number; y: number },
    parentId?: string
  ) => void;
  onMoveComponent?: (dragId: string, hoverId: string) => void;
  onDeleteComponent?: (id: string) => void;
  onUpdateComponent?: (id: string, updates: Partial<UIComponent>) => void;
  onDuplicateComponent?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = (props) => {
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [DND_ITEM_TYPES.COMPONENT, DND_ITEM_TYPES.EXISTING_COMPONENT],
      drop: (item: DragItem, monitor) => {
        if (monitor.didDrop()) return;
        props.onDropComponent?.(item, monitor.getClientOffset() || undefined);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [props.onDropComponent]
  );

  const setDropRef = (el: HTMLDivElement | null) => {
    drop(el);
    dropRef.current = el;
  };

  return (
    <div
      ref={setDropRef}
      className={`min-h-full bg-white rounded-lg p-8 transition-colors border-2 ${
        isOver && canDrop ? 'border-primary bg-primary/5' : 'border-dashed border-border'
      }`}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      {props.components.length > 0 ? (
        props.components.map((component, index) => (
          <DraggableComponentWrapper
            key={component.id}
            component={component}
            index={index}
            totalComponents={props.components.length}
            isSelected={props.selectedId === component.id}
            selectedId={props.selectedId}
            onSelectComponent={props.onSelectComponent}
            onDropComponent={props.onDropComponent}
            onMoveComponent={props.onMoveComponent}
            onDeleteComponent={props.onDeleteComponent}
            onUpdateComponent={props.onUpdateComponent}
            onDuplicateComponent={props.onDuplicateComponent}
            onMoveUp={props.onMoveUp}
            onMoveDown={props.onMoveDown}
          />
        ))
      ) : (
        <div className="text-center text-text-secondary py-12">
          Холст пуст. Перетащите компоненты сюда.
        </div>
      )}
    </div>
  );
};

interface DraggableWrapperProps {
  component: UIComponent;
  index: number;
  totalComponents: number;
  isSelected: boolean;
  selectedId?: string | null;

  onSelectComponent?: (id: string) => void;
  onDropComponent?: (
    item: DragItem,
    position?: { x: number; y: number },
    parentId?: string
  ) => void;
  onMoveComponent?: (dragId: string, hoverId: string) => void;
  onDeleteComponent?: (id: string) => void;
  onUpdateComponent?: (id: string, updates: Partial<UIComponent>) => void;
  onDuplicateComponent?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

const DraggableComponentWrapper: React.FC<DraggableWrapperProps> = (props) => {
  const { component, index, totalComponents, isSelected } = props;
  const dragRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_ITEM_TYPES.EXISTING_COMPONENT,
      item: {
        type: DND_ITEM_TYPES.EXISTING_COMPONENT,
        componentId: component.id,
        index,
      } as DragItem,
      collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }),
    [component.id, index]
  );

  const [, dropMove] = useDrop(
    () => ({
      accept: DND_ITEM_TYPES.EXISTING_COMPONENT,
      hover: (item: DragItem) => {
        if (item.componentId && item.componentId !== component.id) {
          if (component.type !== 'container') {
            props.onMoveComponent?.(item.componentId, component.id);
          }
        }
      },
    }),
    [props.onMoveComponent, component.id]
  );

  const [{ isOverNested }, dropNested] = useDrop(
    () => ({
      accept: [DND_ITEM_TYPES.COMPONENT, DND_ITEM_TYPES.EXISTING_COMPONENT],
      canDrop: () => component.type === 'container',
      drop: (item: DragItem, monitor) => {
        if (monitor.didDrop()) return;
        props.onDropComponent?.(item, monitor.getClientOffset() || undefined, component.id);
      },
      collect: (monitor) => ({
        isOverNested: monitor.isOver({ shallow: true }) && monitor.canDrop(),
      }),
    }),
    [component.id, props.onDropComponent]
  );

  const setDragRef = (el: HTMLDivElement | null) => {
    drag(el);
    dragRef.current = el;
  };

  const setDropRef = (el: HTMLDivElement | null) => {
    dropMove(el);
    dropNested(el);
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalComponents - 1;

  const isContainer = component.type === 'container' || component.type === 'card';
  const defaultWidth = isContainer ? '100%' : 'fit-content';
  const currentWidth = (component.props.width as string) || defaultWidth;

  return (
    <div
      ref={setDropRef}
      className={`relative transition-all ${isDragging ? 'opacity-30' : ''} ${isOverNested ? 'ring-2 ring-primary ring-inset bg-blue-50' : ''}`}
      style={{
        display: 'inline-block',
        width: currentWidth,
        verticalAlign: 'top',
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Resizable
        size={{
          width: currentWidth,
          height: (component.props.height as string) || 'auto',
        }}
        enable={{
          right: isSelected,
          bottom: isSelected,
          bottomRight: isSelected,
          top: false,
          left: false,
          topLeft: false,
          topRight: false,
          bottomLeft: false,
        }}
        onResizeStop={(_e, _direction, ref) => {
          props.onUpdateComponent?.(component.id, {
            props: { ...component.props, width: ref.style.width, height: ref.style.height },
          });
        }}
        handleClasses={{
          bottomRight: 'w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md z-50',
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            props.onSelectComponent?.(component.id);
          }}
          className={`h-full border-2 border-transparent hover:border-primary/30 ${
            isSelected ? 'border-primary ring-2 ring-primary/20 rounded' : ''
          }`}
        >
          <Renderer component={component}>
            {component.children?.map((child, idx) => (
              <DraggableComponentWrapper
                key={child.id}
                component={child}
                index={idx}
                totalComponents={component.children?.length || 0}
                isSelected={props.selectedId === child.id}
                selectedId={props.selectedId}
                onSelectComponent={props.onSelectComponent}
                onDropComponent={props.onDropComponent}
                onMoveComponent={props.onMoveComponent}
                onDeleteComponent={props.onDeleteComponent}
                onUpdateComponent={props.onUpdateComponent}
                onDuplicateComponent={props.onDuplicateComponent}
                onMoveUp={props.onMoveUp}
                onMoveDown={props.onMoveDown}
              />
            ))}
          </Renderer>

          {(isHovered || isSelected) && (
            <div className="absolute -top-10 right-0 flex gap-1 bg-white shadow-xl border p-1 rounded-md z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onMoveUp?.(component.id);
                }}
                disabled={!canMoveUp}
                className={`p-1 rounded ${!canMoveUp ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onMoveDown?.(component.id);
                }}
                disabled={!canMoveDown}
                className={`p-1 rounded ${!canMoveDown ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ↓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onDuplicateComponent?.(component.id);
                }}
                className="p-1 hover:bg-gray-100 text-xs rounded"
              >
                📋
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onDeleteComponent?.(component.id);
                }}
                className="p-1 hover:bg-red-50 text-red-500 rounded"
              >
                🗑️
              </button>
              <div
                ref={setDragRef}
                className="p-1 cursor-move hover:bg-gray-100 rounded text-gray-400"
              >
                ⋮⋮
              </div>
            </div>
          )}
        </div>
      </Resizable>
    </div>
  );
};

export default Canvas;
