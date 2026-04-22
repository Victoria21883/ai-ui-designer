import React from 'react';
import { useProjectStore } from '../store/projectStore';

const HistoryControls: React.FC = () => {
  const { canUndo, canRedo, undo, redo } = useProjectStore();

  return (
    <div className="flex gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`p-2 rounded-lg transition-colors ${
          canUndo
            ? 'bg-surface hover:bg-surface-hover text-text-primary'
            : 'bg-surface/50 text-text-disabled cursor-not-allowed'
        }`}
        title="Отменить (Ctrl+Z)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        className={`p-2 rounded-lg transition-colors ${
          canRedo
            ? 'bg-surface hover:bg-surface-hover text-text-primary'
            : 'bg-surface/50 text-text-disabled cursor-not-allowed'
        }`}
        title="Повторить (Ctrl+Y)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>
    </div>
  );
};

export default HistoryControls;
