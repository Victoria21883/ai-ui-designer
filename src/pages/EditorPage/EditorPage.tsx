// src/pages/EditorPage/EditorPage.tsx
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
import { generateFullHTML } from '../../utils/htmlExporter';
import HTMLPreviewModal from '../../components/HTMLPreviewModal';
import FigmaExportButton from '../../components/FigmaExportButton';
import FigmaInstructions from '../../components/FigmaInstructions';
import ImageUploader from '../../components/ImageUploader';

interface VisionComponent {
  type?: string;
  text?: string;
  content?: string;
  placeholder?: string;
  style?: string;
  className?: string;
  props?: Record<string, unknown>;
  children?: VisionComponent[];
}

interface VisionResponseData {
  components?: VisionComponent[];
  children?: VisionComponent[];
}

const EditorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);

  const [uploadMode, setUploadMode] = useState<'text' | 'image'>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ========== ДЛЯ СМЕНЫ НАЗВАНИЯ ПРОЕКТА ==========
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const { undo, canUndo } = useProjectStore.getState();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const { redo, canRedo } = useProjectStore.getState();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateComponent = useCallback(
    (updates: Partial<UIComponent>) => {
      if (!currentProject || !selectedComponentId) return;
      const { saveToHistory } = useProjectStore.getState();
      saveToHistory(`✏️ Обновлен компонент`);
      const updateComponents = (components: UIComponent[]): UIComponent[] => {
        return components.map((comp) => {
          if (comp.id === selectedComponentId) return { ...comp, ...updates } as UIComponent;
          if (comp.children) return { ...comp, children: updateComponents(comp.children) };
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

  const getDefaultProps = useCallback((type: ComponentType): Record<string, unknown> => {
    switch (type) {
      case 'button':
        return {
          text: 'Кнопка',
          className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
        };
      case 'text':
        return { content: 'Новый текст', variant: 'p', className: 'text-gray-800' };
      case 'input':
        return {
          placeholder: 'Введите текст...',
          className:
            'w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
        };
      case 'card':
        return { className: 'p-4 bg-white rounded-lg shadow-md border' };
      case 'container':
        return { className: 'p-4' };
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

  const mapToComponentType = useCallback((type: string): ComponentType => {
    const validTypes: ComponentType[] = ['button', 'input', 'card', 'text', 'container', 'image'];
    const lowerType = type?.toLowerCase() as ComponentType;
    return validTypes.includes(lowerType) ? lowerType : 'text';
  }, []);

  // ========== ФУНКЦИЯ ПЕРЕИМЕНОВАНИЯ ==========
  const handleRenameProject = useCallback(() => {
    if (!currentProject || !tempName.trim()) {
      setIsEditingName(false);
      return;
    }
    const { saveToHistory } = useProjectStore.getState();
    saveToHistory(`🏷️ Переименован проект: ${tempName}`);
    setCurrentProject({ ...currentProject, name: tempName, updatedAt: new Date() });
    saveProject();
    setIsEditingName(false);
  }, [currentProject, tempName, setCurrentProject, saveProject]);

  const transformVisionToComponents = useCallback(
    (visionData: VisionResponseData): UIComponent[] => {
      const components = visionData.components || (visionData.children ? visionData.children : []);
      if (!Array.isArray(components)) return [];
      return components.map((comp: VisionComponent, index: number) => ({
        id: `vision-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        type: mapToComponentType(comp.type || 'text'),
        props: {
          text: comp.text || (comp.props?.text as string),
          content: comp.content || (comp.props?.content as string),
          placeholder: comp.placeholder || (comp.props?.placeholder as string),
          className: comp.style || comp.className || (comp.props?.className as string),
        },
        children: comp.children
          ? transformVisionToComponents({ components: comp.children })
          : undefined,
      }));
    },
    [mapToComponentType]
  );

  const handleImageUpload = useCallback(
    async (base64: string) => {
      if (!base64) return;
      setIsAnalyzing(true);
      setError(null);
      const { startBatch, endBatch } = useProjectStore.getState();
      startBatch(`🖼️ Анализ скриншота`);
      try {
        const { aiService } = await import('../../core/ai');
        const { analyzeUIVisionPrompt } = await import('../../core/ai/prompts');
        const { aiParser } = await import('../../core/ai/parser');
        const response = await aiService.generateFromImage({
          imageBase64: base64,
          prompt: analyzeUIVisionPrompt(),
        });
        const parsed = aiParser.parseJSON(response.content);
        if (parsed.success && parsed.data) {
          const components = transformVisionToComponents(parsed.data as VisionResponseData);
          if (currentProject)
            setCurrentProject({ ...currentProject, components, updatedAt: new Date() });
          saveProject();
          alert(`✅ Проанализировано! Создано ${components.length} компонентов.`);
        } else {
          setError(parsed.error || 'Ошибка распознавания');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка анализа');
      } finally {
        setIsAnalyzing(false);
        endBatch();
      }
    },
    [currentProject, setCurrentProject, saveProject, transformVisionToComponents]
  );

  const transformMockToComponent = useCallback(
    (mock: MockComponent, index: number): UIComponent => {
      const props = mock.props || {};
      if (mock.style) props.className = mock.style;
      const baseComponent: UIComponent = {
        id: `comp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        type: mapToComponentType(mock.type),
        props: props,
      };
      if (mock.children && Array.isArray(mock.children)) {
        baseComponent.children = mock.children.map((child: MockComponent, childIndex: number) =>
          transformMockToComponent(child, childIndex)
        );
      }
      return baseComponent;
    },
    [mapToComponentType]
  );

  const transformMockToComponents = useCallback(
    (mockData: MockResponse): UIComponent[] => {
      if (!mockData || !mockData.children) return [];
      return mockData.children.map((child: MockComponent, index: number) =>
        transformMockToComponent(child, index)
      );
    },
    [transformMockToComponent]
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    const { startBatch, endBatch } = useProjectStore.getState();
    startBatch(`🤖 Генерация макета`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockResponse = getMockResponse(prompt);
      if (currentProject) {
        const components = transformMockToComponents(mockResponse);
        setCurrentProject({ ...currentProject, components, updatedAt: new Date() });
        saveProject();
      }
    } catch {
      setError('Ошибка при генерации');
    } finally {
      endBatch();
      setIsGenerating(false);
    }
  }, [prompt, currentProject, setCurrentProject, saveProject, transformMockToComponents]);

  const handleDropComponent = useCallback(
    (item: DragItem) => {
      if (!currentProject || !item.componentType) return;
      const { startBatch, endBatch } = useProjectStore.getState();
      startBatch(`➕ Добавлен компонент`);
      const newComponent: UIComponent = {
        id: `comp-${Date.now()}`,
        type: item.componentType,
        props: getDefaultProps(item.componentType),
      };
      setCurrentProject({
        ...currentProject,
        components: [...currentProject.components, newComponent],
        updatedAt: new Date(),
      });
      saveProject();
      selectComponent(newComponent.id);
      endBatch();
    },
    [currentProject, setCurrentProject, saveProject, selectComponent, getDefaultProps]
  );

  const handleMoveComponent = useCallback(
    (dragId: string, hoverId: string) => {
      if (!currentProject) return;
      const dragIndex = currentProject.components.findIndex((c) => c.id === dragId);
      const hoverIndex = currentProject.components.findIndex((c) => c.id === hoverId);
      if (dragIndex === -1 || hoverIndex === -1) return;
      const newComponents = [...currentProject.components];
      const [dragged] = newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, dragged);
      setCurrentProject({ ...currentProject, components: newComponents, updatedAt: new Date() });
    },
    [currentProject, setCurrentProject]
  );

  const handleDeleteComponent = useCallback(
    (id: string) => {
      if (!currentProject) return;
      setCurrentProject({
        ...currentProject,
        components: currentProject.components.filter((c) => c.id !== id),
        updatedAt: new Date(),
      });
      if (selectedComponentId === id) selectComponent(null);
    },
    [currentProject, setCurrentProject, selectedComponentId, selectComponent]
  );

  const handleDuplicateComponent = useCallback(
    (id: string) => {
      if (!currentProject) return;
      const comp = currentProject.components.find((c) => c.id === id);
      if (!comp) return;
      const newComp = { ...comp, id: `comp-${Date.now()}` };
      const index = currentProject.components.findIndex((c) => c.id === id);
      const newComponents = [...currentProject.components];
      newComponents.splice(index + 1, 0, newComp);
      setCurrentProject({ ...currentProject, components: newComponents, updatedAt: new Date() });
    },
    [currentProject, setCurrentProject]
  );

  const handleMoveUp = useCallback(
    (id: string) => {
      if (!currentProject) return;
      const index = currentProject.components.findIndex((c) => c.id === id);
      if (index <= 0) return;
      const newComponents = [...currentProject.components];
      [newComponents[index - 1], newComponents[index]] = [
        newComponents[index],
        newComponents[index - 1],
      ];
      setCurrentProject({ ...currentProject, components: newComponents, updatedAt: new Date() });
    },
    [currentProject, setCurrentProject]
  );

  const handleMoveDown = useCallback(
    (id: string) => {
      if (!currentProject) return;
      const index = currentProject.components.findIndex((c) => c.id === id);
      if (index === -1 || index === currentProject.components.length - 1) return;
      const newComponents = [...currentProject.components];
      [newComponents[index], newComponents[index + 1]] = [
        newComponents[index + 1],
        newComponents[index],
      ];
      setCurrentProject({ ...currentProject, components: newComponents, updatedAt: new Date() });
    },
    [currentProject, setCurrentProject]
  );

  const handleExportHTML = useCallback(() => {
    setShowHTMLPreview(true);
  }, []);
  const handleQuickExport = useCallback(() => {
    if (!currentProject) return;
    const html = generateFullHTML(currentProject.components, currentProject.name);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentProject]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background text-text-primary">
        <nav className="bg-surface border-b border-border px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              AI UI Designer
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <HistoryControls />
              <FigmaInstructions />

              {/* СМЕНА НАЗВАНИЯ ПРОЕКТА */}
              {currentProject && (
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-md border border-border group transition-all hover:border-primary">
                  {isEditingName ? (
                    <input
                      autoFocus
                      className="bg-transparent border-none outline-none text-sm font-medium w-40 text-primary"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleRenameProject}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameProject()}
                      onFocus={(e) => e.target.select()}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        setTempName(currentProject.name);
                        setIsEditingName(true);
                      }}
                      title="Нажмите, чтобы переименовать"
                    >
                      <span className="text-sm font-medium">Проект: {currentProject.name}</span>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        ✏️
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Link to="/preview/current">
                <button className="btn-secondary">Предпросмотр</button>
              </Link>
              <div className="relative group">
                <button className="btn-primary">📤 Экспорт ▼</button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={handleExportHTML}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    👁️ Предпросмотр HTML
                  </button>
                  <button
                    onClick={handleQuickExport}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    ⚡ Быстрый экспорт
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <div className="px-3 pb-2">
                    <FigmaExportButton
                      components={currentProject?.components || []}
                      projectName={currentProject?.name || 'project'}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg ${showHistory ? 'bg-primary text-white' : 'bg-surface hover:bg-surface-hover'}`}
              >
                📜
              </button>
            </div>
          </div>
        </nav>

        <div className="border-b border-border p-6 bg-surface/50">
          <div className="max-w-4xl mx-auto flex flex-col space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setUploadMode('text')}
                className={`px-4 py-2 rounded-lg ${uploadMode === 'text' ? 'bg-primary text-white' : 'bg-surface'}`}
              >
                💬 Текст
              </button>
              <button
                onClick={() => setUploadMode('image')}
                className={`px-4 py-2 rounded-lg ${uploadMode === 'image' ? 'bg-primary text-white' : 'bg-surface'}`}
              >
                🖼️ Изображение
              </button>
            </div>
            {uploadMode === 'text' ? (
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
                <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary">
                  {isGenerating ? '...' : 'Создать'}
                </button>
              </div>
            ) : (
              <ImageUploader onImageUpload={handleImageUpload} isProcessing={isAnalyzing} />
            )}
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-2 rounded">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex h-[calc(100vh-230px)]">
          <aside className="w-64 bg-surface border-r border-border p-4 overflow-y-auto">
            <ComponentPalette />
            <div className="mt-6 border-t pt-4">
              <FigmaInstructions />
            </div>
          </aside>
          {showHistory && (
            <aside className="w-80 bg-surface border-r border-border overflow-y-auto">
              <HistoryPanel />
            </aside>
          )}
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
              <div className="text-center mt-10">Загрузка...</div>
            )}
          </main>
          <aside className="w-80 bg-surface border-l border-border p-4 overflow-y-auto">
            <PropertyPanel component={selectedComponent || null} onUpdate={handleUpdateComponent} />
          </aside>
        </div>
      </div>
      <HTMLPreviewModal
        isOpen={showHTMLPreview}
        onClose={() => setShowHTMLPreview(false)}
        components={currentProject?.components || []}
        projectName={currentProject?.name || 'project'}
      />
    </DndProvider>
  );
};

export default EditorPage;
