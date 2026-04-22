import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getMockResponse } from '../../core/ai/mockData';
import { useProjectStore } from '../../store/projectStore';
import Canvas from '../../components/Canvas';
import ComponentPalette from '../../components/ComponentPalette';
import PropertyPanel from '../../components/PropertyPanel';
import ThemeToggle from '../../components/ThemeToggle';
import HistoryControls from '../../components/HistoryControls';
import HistoryPanel from '../../components/HistoryPanel';
import type { MockResponse, MockComponent } from '../../core/ai/mockData';
import type { UIComponent, ComponentType } from '../../types/types';
import type { DragItem } from '../../types/dnd.types';

const EditorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedJSON, setGeneratedJSON] = useState<MockResponse | null>(null);
  const [showTestButtons, setShowTestButtons] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const {
    currentProject,
    setCurrentProject,
    generateNewProject,
    saveProject,
    selectedComponentId,
    selectComponent,
  } = useProjectStore();

  useEffect(() => {
    if (!currentProject) {
      generateNewProject('Новый проект', 'Проект создан из редактора');
    }
  }, [currentProject, generateNewProject]);

  // Горячие клавиши для Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const { undo, canUndo } = useProjectStore.getState();
        if (canUndo) undo();
      }
      // Ctrl+Y или Ctrl+Shift+Z - Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const { redo, canRedo } = useProjectStore.getState();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ========== ФУНКЦИЯ ОБНОВЛЕНИЯ КОМПОНЕНТА ==========
  const handleUpdateComponent = useCallback(
    (updates: Partial<UIComponent>) => {
      if (!currentProject || !selectedComponentId) return;

      // Сохраняем в историю перед изменением
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`✏️ Обновлен компонент`);

      const updateComponents = (components: UIComponent[]): UIComponent[] => {
        return components.map((comp) => {
          if (comp.id === selectedComponentId) {
            return { ...comp, ...updates } as UIComponent;
          }
          if (comp.children) {
            return { ...comp, children: updateComponents(comp.children) };
          }
          return comp;
        });
      };

      setCurrentProject({
        ...currentProject,
        components: updateComponents(currentProject.components),
        updatedAt: new Date(),
      });
      saveProject();
    },
    [currentProject, selectedComponentId, setCurrentProject, saveProject]
  );

  const selectedComponent = currentProject?.components.find((c) => c.id === selectedComponentId);

  // ========== ФУНКЦИИ ДЛЯ РАБОТЫ С КОМПОНЕНТАМИ ==========
  const getDefaultProps = useCallback((type: ComponentType): Record<string, unknown> => {
    switch (type) {
      case 'button':
        return {
          text: 'Кнопка',
          className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
        };
      case 'text':
        return {
          content: 'Новый текст',
          variant: 'p',
          className: 'text-gray-800',
        };
      case 'input':
        return {
          placeholder: 'Введите текст...',
          className:
            'w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
        };
      case 'card':
        return {
          className: 'p-4 bg-white rounded-lg shadow-md border',
        };
      case 'container':
        return {
          className: 'p-4',
        };
      case 'image':
        return {
          src: 'https://via.placeholder.com/150',
          alt: 'Изображение',
          className: 'max-w-full h-auto',
        };
      default:
        return {};
    }
  }, []);

  // Добавление компонента из палитры
  const handleDropComponent = useCallback(
    (item: DragItem) => {
      if (!currentProject || !item.componentType) return;

      const { startBatch, endBatch } = useProjectStore.getState();
      startBatch(`➕ Добавлен компонент: ${item.componentType}`);

      try {
        const newComponent: UIComponent = {
          id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: item.componentType,
          props: getDefaultProps(item.componentType),
        };

        const updatedComponents = [...currentProject.components, newComponent];

        setCurrentProject({
          ...currentProject,
          components: updatedComponents,
          updatedAt: new Date(),
        });

        saveProject();

        selectComponent(newComponent.id);
      } finally {
        endBatch();
      }
    },
    [currentProject, setCurrentProject, saveProject, selectComponent, getDefaultProps]
  );

  // Перемещение компонента (drag & drop)
  const handleMoveComponent = useCallback(
    (dragId: string, hoverId: string) => {
      if (!currentProject) {
        console.warn('Нет текущего проекта');
        return;
      }

      const dragIndex = currentProject.components.findIndex((c) => c.id === dragId);
      const hoverIndex = currentProject.components.findIndex((c) => c.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) {
        console.warn('Компонент не найден');
        return;
      }

      if (dragIndex === hoverIndex) return;

      // Сохраняем в историю ПЕРЕД изменением
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`🔄 Перемещен компонент`);

      const newComponents = [...currentProject.components];
      const [draggedComponent] = newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, draggedComponent);

      setCurrentProject({
        ...currentProject,
        components: newComponents,
        updatedAt: new Date(),
      });

      saveProject();
    },
    [currentProject, setCurrentProject, saveProject]
  );

  // Удаление компонента
  const handleDeleteComponent = useCallback(
    (id: string) => {
      if (!currentProject) return;

      const component = currentProject.components.find((c) => c.id === id);

      // Сохраняем в историю ПЕРЕД изменением
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`🗑️ Удален компонент: ${component?.type || 'компонент'}`);

      const newComponents = currentProject.components.filter((c) => c.id !== id);

      setCurrentProject({
        ...currentProject,
        components: newComponents,
        updatedAt: new Date(),
      });
      saveProject();

      if (selectedComponentId === id) {
        selectComponent(null);
      }
    },
    [currentProject, setCurrentProject, saveProject, selectedComponentId, selectComponent]
  );

  // Дублирование компонента
  const handleDuplicateComponent = useCallback(
    (id: string) => {
      if (!currentProject) return;

      const componentToDuplicate = currentProject.components.find((c) => c.id === id);
      if (!componentToDuplicate) return;

      // Сохраняем в историю ПЕРЕД изменением
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`📋 Дублирован компонент: ${componentToDuplicate.type}`);

      console.log('📋 Дублирование компонента:', id);

      const newComponent: UIComponent = {
        ...componentToDuplicate,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      const index = currentProject.components.findIndex((c) => c.id === id);
      const newComponents = [...currentProject.components];
      newComponents.splice(index + 1, 0, newComponent);

      setCurrentProject({
        ...currentProject,
        components: newComponents,
        updatedAt: new Date(),
      });
      saveProject();
    },
    [currentProject, setCurrentProject, saveProject]
  );

  // Перемещение вверх
  const handleMoveUp = useCallback(
    (id: string) => {
      if (!currentProject) return;

      const index = currentProject.components.findIndex((c) => c.id === id);
      if (index <= 0) return;

      // Сохраняем в историю ПЕРЕД изменением
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`⬆️ Перемещен компонент вверх`);

      const newComponents = [...currentProject.components];
      [newComponents[index - 1], newComponents[index]] = [
        newComponents[index],
        newComponents[index - 1],
      ];

      setCurrentProject({
        ...currentProject,
        components: newComponents,
        updatedAt: new Date(),
      });
      saveProject();
    },
    [currentProject, setCurrentProject, saveProject]
  );

  // Перемещение вниз
  const handleMoveDown = useCallback(
    (id: string) => {
      if (!currentProject) return;

      const index = currentProject.components.findIndex((c) => c.id === id);
      if (index === -1 || index === currentProject.components.length - 1) return;

      // Сохраняем в историю ПЕРЕД изменением
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`⬇️ Перемещен компонент вниз`);

      const newComponents = [...currentProject.components];
      [newComponents[index], newComponents[index + 1]] = [
        newComponents[index + 1],
        newComponents[index],
      ];

      setCurrentProject({
        ...currentProject,
        components: newComponents,
        updatedAt: new Date(),
      });
      saveProject();
    },
    [currentProject, setCurrentProject, saveProject]
  );

  // ========== ФУНКЦИИ ДЛЯ ПРЕОБРАЗОВАНИЯ МОКОВЫХ ДАННЫХ ==========
  const mapToComponentType = (type: string): ComponentType => {
    const validTypes: ComponentType[] = ['button', 'input', 'card', 'text', 'container', 'image'];
    return validTypes.includes(type as ComponentType) ? (type as ComponentType) : 'text';
  };

  const transformMockToComponent = (mock: MockComponent, index: number): UIComponent => {
    const props = mock.props || {};
    if (mock.style) {
      props.className = mock.style;
    }

    const baseComponent: UIComponent = {
      id: `comp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      type: mapToComponentType(mock.type),
      props: props,
    };

    if (mock.children && Array.isArray(mock.children)) {
      return {
        ...baseComponent,
        children: mock.children.map((child: MockComponent, childIndex: number) =>
          transformMockToComponent(child, childIndex)
        ),
      };
    }

    return baseComponent;
  };

  const transformMockToComponents = (mockData: MockResponse): UIComponent[] => {
    if (!mockData || !mockData.children) return [];
    return mockData.children.map((child: MockComponent, index: number) =>
      transformMockToComponent(child, index)
    );
  };

  // Генерация макета через AI
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Пожалуйста, введите описание интерфейса');
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Начинаем группировку действий для генерации
    const { startBatch, endBatch } = useProjectStore.getState();
    startBatch(`🤖 Генерация макета: ${prompt}`);

    try {
      console.log('Генерируем для промпта:', prompt);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResponse = getMockResponse(prompt);
      console.log('Моковый ответ:', mockResponse);

      setGeneratedJSON(mockResponse);

      if (currentProject) {
        const components = transformMockToComponents(mockResponse);
        console.log('Преобразованные компоненты:', components);

        setCurrentProject({
          ...currentProject,
          components: components,
          updatedAt: new Date(),
        });

        saveProject();
        console.log('Проект сохранен, компонентов:', components.length);
      }

      console.log('Сгенерированный JSON:', mockResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при генерации');
      console.error('Ошибка генерации:', err);
    } finally {
      // Завершаем группировку
      endBatch();
      setIsGenerating(false);
    }
  };

  // ========== ТЕСТОВЫЕ ФУНКЦИИ ==========
  const demoStates = {
    success: async () => {
      setIsGenerating(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockResponse = getMockResponse(prompt || 'страница входа');
      setGeneratedJSON(mockResponse);

      if (currentProject) {
        const components = transformMockToComponents(mockResponse);
        setCurrentProject({
          ...currentProject,
          components: components,
          updatedAt: new Date(),
        });
        saveProject();
      }

      setIsGenerating(false);
    },

    error: async () => {
      setIsGenerating(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setError('Ошибка соединения с AI сервисом. Попробуйте позже.');
      setIsGenerating(false);
    },

    networkError: async () => {
      setIsGenerating(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setError('Нет соединения с интернетом. Проверьте подключение.');
      setIsGenerating(false);
    },

    invalidJSON: async () => {
      setIsGenerating(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setError('AI вернул некорректный JSON. Попробуйте изменить запрос.');
      setIsGenerating(false);
    },

    clear: () => {
      setGeneratedJSON(null);
      setError(null);
      setPrompt('');

      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          components: [],
          updatedAt: new Date(),
        });
        saveProject();
      }
    },

    newProject: () => {
      generateNewProject(`Проект ${new Date().toLocaleString()}`, 'Новый проект');
      setGeneratedJSON(null);
      setError(null);
      setPrompt('');
    },
  };

  const showJSONPreview = generatedJSON && showTestButtons;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* Верхняя панель */}
        <nav className="bg-surface border-b border-border px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              AI UI Designer
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <HistoryControls />
              {currentProject && (
                <span className="text-sm text-text-secondary hidden md:inline">
                  Проект: {currentProject.name}
                </span>
              )}
              <button
                onClick={() => setShowTestButtons(!showTestButtons)}
                className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
              >
                🧪 {showTestButtons ? 'Скрыть тесты' : 'Показать тесты'}
              </button>
              <Link to="/preview/current">
                <button className="btn-secondary">Предпросмотр</button>
              </Link>
              <button className="btn-primary">Экспорт</button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-colors ${
                  showHistory ? 'bg-primary text-white' : 'bg-surface hover:bg-surface-hover'
                }`}
                title="История версий"
              >
                📜
              </button>
            </div>
          </div>
        </nav>

        {/* Панель генерации */}
        <div className="border-b border-border p-6 bg-surface/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Опишите интерфейс..."
                  className="input flex-1"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary whitespace-nowrap min-w-[140px] flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Генерация...
                    </>
                  ) : (
                    'Сгенерировать'
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-text-secondary">Примеры:</span>
                <button
                  onClick={() => setPrompt('Сделай страницу входа с формой и кнопкой')}
                  className="text-sm bg-surface px-3 py-1 rounded border border-border hover:border-primary"
                >
                  Страница входа
                </button>
                <button
                  onClick={() => setPrompt('Создай карточку товара с изображением и ценой')}
                  className="text-sm bg-surface px-3 py-1 rounded border border-border hover:border-primary"
                >
                  Карточка товара
                </button>
                <button
                  onClick={() => setPrompt('Сделай форму регистрации с полями имя, email, пароль')}
                  className="text-sm bg-surface px-3 py-1 rounded border border-border hover:border-primary"
                >
                  Форма регистрации
                </button>
              </div>

              {showTestButtons && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-yellow-800 font-medium">
                      🧪 Тестовые кнопки (для разработки)
                    </p>
                    <button
                      onClick={() => setShowTestButtons(false)}
                      className="text-xs text-yellow-600 hover:text-yellow-800"
                    >
                      ✕ Скрыть
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={demoStates.success}
                      className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      ✅ Success
                    </button>
                    <button
                      onClick={demoStates.error}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      ❌ Error
                    </button>
                    <button
                      onClick={demoStates.networkError}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      🌐 Network Error
                    </button>
                    <button
                      onClick={demoStates.invalidJSON}
                      className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      🔄 Invalid JSON
                    </button>
                    <button
                      onClick={demoStates.clear}
                      className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      🧹 Clear
                    </button>
                    <button
                      onClick={demoStates.newProject}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      📁 Новый проект
                    </button>
                  </div>
                </div>
              )}

              {showJSONPreview && (
                <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-300 font-medium">📋 JSON Preview</p>
                    <button
                      onClick={() => setGeneratedJSON(null)}
                      className="text-xs text-gray-400 hover:text-gray-200"
                    >
                      ✕ Закрыть
                    </button>
                  </div>
                  <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded max-h-60 overflow-auto">
                    {JSON.stringify(generatedJSON, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Основная область редактора */}
        <div className="flex h-[calc(100vh-180px)]">
          {/* Левая панель - компоненты */}
          <aside className="w-64 bg-surface border-r border-border p-4 overflow-y-auto">
            <ComponentPalette />

            {currentProject && (
              <div className="mt-6 p-3 bg-primary/5 rounded border border-primary/20">
                <h4 className="text-xs font-semibold text-primary mb-1">Текущий проект</h4>
                <p className="text-xs text-text-secondary truncate">{currentProject.name}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Компонентов: {currentProject.components.length}
                </p>
              </div>
            )}
          </aside>

          {/* Панель истории (условно) */}
          {showHistory && (
            <aside className="w-80 bg-surface border-r border-border overflow-y-auto">
              <HistoryPanel />
            </aside>
          )}

          {/* Центральная область - холст */}
          <main className="flex-1 bg-[#f8f9fa] p-8 overflow-auto">
            {currentProject ? (
              <Canvas
                components={currentProject.components}
                selectedId={selectedComponentId}
                onSelectComponent={selectComponent}
                onDropComponent={handleDropComponent}
                onMoveComponent={handleMoveComponent}
                onDeleteComponent={handleDeleteComponent}
                onDuplicateComponent={handleDuplicateComponent}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ) : (
              <div className="text-center text-text-secondary">
                <p className="mb-4">✨ Загрузка...</p>
              </div>
            )}
          </main>

          {/* Правая панель - свойства */}
          <aside className="w-80 bg-surface border-l border-border p-4 overflow-y-auto">
            <PropertyPanel component={selectedComponent || null} onUpdate={handleUpdateComponent} />
          </aside>
        </div>
      </div>
    </DndProvider>
  );
};

export default EditorPage;
