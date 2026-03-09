// src/components/Canvas.tsx
import React from 'react';
import Renderer from './Renderer';
import type { UIComponent } from '../types/types';

interface CanvasProps {
  components: UIComponent[];
  onSelectComponent?: (id: string) => void;
  selectedId?: string | null;
}

const Canvas: React.FC<CanvasProps> = ({ components, onSelectComponent, selectedId }) => {
  return (
    <div className="min-h-full bg-white rounded-lg shadow-sm border-2 border-dashed border-border p-8">
      {components.length > 0 ? (
        <div className="space-y-4">
          {components.map((component) => (
            <div
              key={component.id}
              onClick={() => onSelectComponent?.(component.id)}
              className={`relative cursor-pointer transition-all ${
                selectedId === component.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <Renderer component={component} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-text-secondary py-12">
          <p className="mb-2">✨ Холст пуст</p>
          <p className="text-sm">Сгенерируйте макет или перетащите компоненты сюда</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
