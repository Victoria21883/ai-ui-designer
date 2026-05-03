import type { ComponentType } from './types';

export interface DragItem {
  type: 'COMPONENT' | 'EXISTING_COMPONENT';
  componentType?: ComponentType;
  componentId?: string;
  index?: number;
}

export const DND_ITEM_TYPES = {
  COMPONENT: 'COMPONENT',
  EXISTING_COMPONENT: 'EXISTING_COMPONENT',
} as const;

export interface DropPosition {
  x: number;
  y: number;
}

export interface MoveResult {
  success: boolean;
  newIndex?: number;
  error?: string;
}
