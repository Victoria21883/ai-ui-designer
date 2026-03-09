// src/pages/EditorPage/EditorPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMockResponse } from '../../core/ai/mockData';
import { useProjectStore } from '../../store/projectStore';
import Canvas from '../../components/Canvas';
import type { MockResponse, MockComponent } from '../../core/ai/mockData';
import type { UIComponent, ComponentType } from '../../types/types';

const EditorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedJSON, setGeneratedJSON] = useState<MockResponse | null>(null);

  // Для тестирования разных состояний
  const [showTestButtons, setShowTestButtons] = useState(false);

  // Используем store
  const {
    currentProject,
    setCurrentProject,
    generateNewProject,
    saveProject,
    selectedComponentId,
    selectComponent,
  } = useProjectStore();

  // При первой загрузке создаем новый проект, если его нет
  useEffect(() => {
    if (!currentProject) {
      generateNewProject('Новый проект', 'Проект создан из редактора');
    }
  }, [currentProject, generateNewProject]);

  // Функция для преобразования строки типа в ComponentType
  const mapToComponentType = (type: string): ComponentType => {
    const validTypes: ComponentType[] = ['button', 'input', 'card', 'text', 'container', 'image'];
    return validTypes.includes(type as ComponentType) ? (type as ComponentType) : 'text';
  };

  // Функция для преобразования MockComponent в UIComponent
  const transformMockToComponent = (mock: MockComponent, index: number): UIComponent => {
    // Сохраняем Tailwind классы как className в props для временного решения
    const props = mock.props || {};
    if (mock.style) {
      props.className = mock.style;
    }

    const baseComponent: UIComponent = {
      id: `comp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      type: mapToComponentType(mock.type),
      props: props,
    };

    // Рекурсивно обрабатываем children, если они есть
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

  // Функция для преобразования MockResponse в UIComponent[]
  const transformMockToComponents = (mockData: MockResponse): UIComponent[] => {
    if (!mockData || !mockData.children) return [];
    return mockData.children.map((child: MockComponent, index: number) =>
      transformMockToComponent(child, index)
    );
  };

  // В функции handleGenerate добавьте:
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Пожалуйста, введите описание интерфейса');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('Генерируем для промпта:', prompt); // ОТЛАДКА

      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Получаем моковый ответ
      const mockResponse = getMockResponse(prompt);
      console.log('Моковый ответ:', mockResponse); // ОТЛАДКА

      setGeneratedJSON(mockResponse);

      // Сохраняем в store
      if (currentProject) {
        const components = transformMockToComponents(mockResponse);
        console.log('Преобразованные компоненты:', components); // ОТЛАДКА

        setCurrentProject({
          ...currentProject,
          components: components,
          updatedAt: new Date(),
        });

        saveProject();
        console.log('Проект сохранен, компонентов:', components.length); // ОТЛАДКА
      }

      console.log('Сгенерированный JSON:', mockResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при генерации');
      console.error('Ошибка генерации:', err); // ОТЛАДКА
    } finally {
      setIsGenerating(false);
    }
  };

  // Функции для демонстрации разных состояний
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

  // Используем generatedJSON для отображения в интерфейсе (добавим панель с JSON)
  const showJSONPreview = generatedJSON && showTestButtons; // Показываем JSON только в тестовом режиме

  return (
    <div className="min-h-screen bg-background">
      {/* Верхняя панель */}
      <nav className="bg-surface border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            AI UI Designer
          </Link>
          <div className="flex items-center space-x-4">
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
                placeholder="Опишите интерфейс... (например: 'Сделай страницу входа с формой и кнопкой')"
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

            {/* Панель с JSON (только в тестовом режиме) */}
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
          <h3 className="font-semibold mb-4">Компоненты</h3>
          <div className="space-y-2">
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Кнопка
            </div>
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Текст
            </div>
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Карточка
            </div>
            <div className="p-3 bg-background rounded border border-border cursor-move hover:border-primary">
              Поле ввода
            </div>
          </div>

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

        {/* Центральная область - холст */}
        <main className="flex-1 bg-[#f8f9fa] p-8 overflow-auto">
          {currentProject ? (
            <Canvas
              components={currentProject.components}
              selectedId={selectedComponentId}
              onSelectComponent={selectComponent}
            />
          ) : (
            <div className="text-center text-text-secondary">
              <p className="mb-4">✨ Загрузка...</p>
            </div>
          )}
        </main>

        {/* Правая панель - свойства */}
        <aside className="w-80 bg-surface border-l border-border p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Свойства</h3>
          <div className="text-text-secondary text-sm">
            {selectedComponentId ? (
              <div>
                <p className="text-primary">Выбран компонент: {selectedComponentId}</p>
                <p className="mt-2 text-xs">Здесь будет редактор свойств</p>
              </div>
            ) : (
              <p>Выберите компонент на холсте для редактирования свойств</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditorPage;
