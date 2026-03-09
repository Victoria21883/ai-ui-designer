// src/types.ts

export type ComponentType = 'button' | 'input' | 'card' | 'text' | 'container' | 'image';

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>; // Используем unknown для безопасности
  children?: UIComponent[];
}

export interface Theme {
  id: string;
  name: string;
  colors: Record<string, unknown>;
  spacing: Record<string, unknown>;
  borderRadius: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  components: UIComponent[];
  theme: Theme;
}
