// src/types/dnd.types.ts
import type { ComponentType } from './types';

// Типы элементов для перетаскивания
export interface DragItem {
  type: 'COMPONENT' | 'EXISTING_COMPONENT';
  componentType?: ComponentType;
  componentId?: string;
  index?: number;
}

// Константы для типов DnD
export const DND_ITEM_TYPES = {
  COMPONENT: 'COMPONENT',
  EXISTING_COMPONENT: 'EXISTING_COMPONENT',
} as const;

// Тип для позиции сброса
export interface DropPosition {
  x: number;
  y: number;
}

// Тип для результата перемещения
export interface MoveResult {
  success: boolean;
  newIndex?: number;
  error?: string;
}
