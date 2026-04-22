// src/components/HistoryPanel.tsx
import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import type { HistoryEntry } from '../store/projectStore';

interface HistoryItemProps {
  entry: HistoryEntry;
  index: number;
  isCurrent: boolean;
  isPast: boolean;
  onGoTo: () => void;
  formatDate: (date: Date) => string;
  formatDateFull: (date: Date) => string;
  totalCount: number;
  onUpdateName: (id: string, newName: string) => void;
}

const HistoryPanel: React.FC = () => {
  const { history, historyIndex, undo, redo, clearHistory } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Функция для обновления названия версии
  const updateHistoryEntryName = (id: string, newName: string) => {
    const { history: currentHistory, setHistory } = useProjectStore.getState();
    const updatedHistory = currentHistory.map((entry) =>
      entry.id === id ? { ...entry, description: newName } : entry
    );
    setHistory(updatedHistory);
  };

  const handleStartEdit = (entry: HistoryEntry) => {
    setEditingId(entry.id);
    setEditName(entry.description);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateHistoryEntryName(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (history.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-text-primary">История версий</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-secondary hover:text-text-primary"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        {isExpanded && (
          <div className="text-center py-8 text-text-secondary text-sm">
            📭 История пуста
            <p className="text-xs mt-1">Действия будут появляться здесь</p>
          </div>
        )}
      </div>
    );
  }

  const handleGoToVersion = (index: number) => {
    const currentIndex = historyIndex;
    if (index === currentIndex) return;

    if (index < currentIndex) {
      const stepsToUndo = currentIndex - index;
      for (let i = 0; i < stepsToUndo; i++) {
        undo();
      }
    } else {
      const stepsToRedo = index - currentIndex;
      for (let i = 0; i < stepsToRedo; i++) {
        redo();
      }
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDateFull = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-text-primary">История версий</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-secondary hover:text-text-primary"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={clearHistory}
            className="text-xs text-text-secondary hover:text-error transition-colors"
            title="Очистить историю"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {history.map((entry, idx) => (
            <HistoryItem
              key={entry.id}
              entry={entry}
              index={idx}
              isCurrent={idx === historyIndex}
              isPast={idx < historyIndex}
              onGoTo={() => handleGoToVersion(idx)}
              formatDate={formatDate}
              formatDateFull={formatDateFull}
              totalCount={history.length}
              onUpdateName={updateHistoryEntryName}
              isEditing={editingId === entry.id}
              editName={editName}
              onStartEdit={() => handleStartEdit(entry)}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditNameChange={setEditName}
              onKeyDown={handleKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент для отображения отдельной записи истории
const HistoryItem: React.FC<
  HistoryItemProps & {
    isEditing?: boolean;
    editName?: string;
    onStartEdit?: () => void;
    onSaveEdit?: () => void;
    onCancelEdit?: () => void;
    onEditNameChange?: (name: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  }
> = ({
  entry,
  index,
  isCurrent,
  isPast,
  onGoTo,
  formatDate,
  formatDateFull,
  totalCount,
  isEditing = false,
  editName = '',
  onStartEdit,
  onSaveEdit,
  onEditNameChange,
  onKeyDown,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Определяем иконку в зависимости от описания
  const getIcon = (description: string): string => {
    if (description.includes('➕') || description.includes('Добавлен')) return '➕';
    if (description.includes('🗑️') || description.includes('Удален')) return '🗑️';
    if (description.includes('✏️') || description.includes('Обновлен')) return '✏️';
    if (description.includes('🔄') || description.includes('Перемещен')) return '🔄';
    if (description.includes('⬆️')) return '⬆️';
    if (description.includes('⬇️')) return '⬇️';
    if (description.includes('📋') || description.includes('Дублирован')) return '📋';
    if (description.includes('📁') || description.includes('Создан')) return '📁';
    if (description.includes('🤖') || description.includes('Генерация')) return '🤖';
    return '📌';
  };

  const getStatusClass = (): string => {
    if (isCurrent) return 'bg-primary/10 border-primary/30';
    if (isPast) return 'bg-surface hover:bg-surface-hover';
    return 'bg-surface/50 opacity-60';
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit?.();
  };

  return (
    <div
      className={`relative p-2 rounded-lg cursor-pointer transition-all ${getStatusClass()} ${
        isCurrent ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
      }`}
      onClick={onGoTo}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon(entry.description)}</span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange?.(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={onSaveEdit}
              className="w-full text-xs bg-background border border-primary rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p
              className={`text-xs truncate ${isCurrent ? 'text-primary font-medium' : 'text-text-primary'}`}
              onDoubleClick={handleDoubleClick}
              title="Двойной клик для редактирования"
            >
              {entry.description}
            </p>
          )}
          <p className="text-[10px] text-text-secondary">{formatDate(entry.timestamp)}</p>
        </div>
        {isCurrent && (
          <span className="text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded whitespace-nowrap">
            Текущая
          </span>
        )}
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit?.();
            }}
            className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-primary transition-opacity"
            title="Редактировать название"
          >
            ✏️
          </button>
        )}
      </div>

      {/* Всплывающая подсказка с полной информацией */}
      {showTooltip && !isEditing && (
        <div className="absolute z-10 bottom-full left-0 mb-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap">
          <p className="font-medium">{entry.description}</p>
          <p className="text-gray-400 text-[10px]">{formatDateFull(entry.timestamp)}</p>
          <p className="text-gray-400 text-[10px]">
            Шаг {index + 1} из {totalCount}
          </p>
          <p className="text-gray-400 text-[10px] mt-1">✏️ Двойной клик для редактирования</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
