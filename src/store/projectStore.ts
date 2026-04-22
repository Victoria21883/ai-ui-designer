// src/store/projectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIComponent } from '../types/types';

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

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  snapshot: Project;
  description: string;
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Светлая тема',
  colors: { primary: '#3b82f6', background: '#ffffff', text: { primary: '#111827' } },
  spacing: { md: '1rem' },
  borderRadius: { md: '0.375rem' },
};

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  selectedComponentId: string | null;
  isLoading: boolean;
  error: string | null;

  // История
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Флаг для группировки действий
  isBatching: boolean;
  batchedDescription: string | null;

  // Основные действия
  setCurrentProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;
  addComponent: (component: UIComponent) => void;
  updateComponent: (id: string, updates: Partial<UIComponent>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  generateNewProject: (name: string, description?: string) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;

  // История
  undo: () => void;
  redo: () => void;
  saveToHistory: (description: string, force?: boolean) => void;
  clearHistory: () => void;
  setHistory: (history: HistoryEntry[]) => void; // ✅ ДОБАВЛЕНО

  // Группировка действий
  startBatch: (description: string) => void;
  endBatch: () => void;
}

const MAX_HISTORY_SIZE = 50;

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      selectedComponentId: null,
      isLoading: false,
      error: null,

      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,

      isBatching: false,
      batchedDescription: null,

      // ========== ОСНОВНЫЕ ДЕЙСТВИЯ ==========

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      updateProject: (updates) => {
        const state = get();
        if (!state.currentProject) return;

        set({
          currentProject: {
            ...state.currentProject,
            ...updates,
            updatedAt: new Date(),
          },
        });
      },

      addComponent: (component) => {
        const state = get();
        if (!state.currentProject) return;

        // Если не в режиме батчинга, сохраняем в историю
        if (!state.isBatching) {
          state.saveToHistory(`➕ Добавлен компонент: ${component.type}`);
        }

        set({
          currentProject: {
            ...state.currentProject,
            components: [...state.currentProject.components, component],
            updatedAt: new Date(),
          },
        });
      },

      updateComponent: (id, updates) => {
        const state = get();
        if (!state.currentProject) return;

        const component = state.currentProject.components.find((c) => c.id === id);
        if (!component) return;

        // Если не в режиме батчинга, сохраняем в историю
        if (!state.isBatching) {
          state.saveToHistory(`✏️ Обновлен компонент: ${component.type}`);
        }

        const updateComponents = (components: UIComponent[]): UIComponent[] => {
          return components.map((comp) => {
            if (comp.id === id) return { ...comp, ...updates } as UIComponent;
            if (comp.children) return { ...comp, children: updateComponents(comp.children) };
            return comp;
          });
        };

        set({
          currentProject: {
            ...state.currentProject,
            components: updateComponents(state.currentProject.components),
            updatedAt: new Date(),
          },
        });
      },

      removeComponent: (id) => {
        const state = get();
        if (!state.currentProject) return;

        const component = state.currentProject.components.find((c) => c.id === id);

        // Если не в режиме батчинга, сохраняем в историю
        if (!state.isBatching) {
          state.saveToHistory(
            component ? `🗑️ Удален компонент: ${component.type}` : '🗑️ Удален компонент'
          );
        }

        const filterComponents = (components: UIComponent[]): UIComponent[] => {
          return components
            .filter((comp) => comp.id !== id)
            .map((comp) => ({
              ...comp,
              children: comp.children ? filterComponents(comp.children) : undefined,
            }));
        };

        set({
          currentProject: {
            ...state.currentProject,
            components: filterComponents(state.currentProject.components),
            updatedAt: new Date(),
          },
        });

        if (state.selectedComponentId === id) {
          set({ selectedComponentId: null });
        }
      },

      selectComponent: (id) => set({ selectedComponentId: id }),

      generateNewProject: (name, description) => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
          components: [],
          theme: defaultTheme,
        };

        const state = get();
        state.saveToHistory(`📁 Создан новый проект: ${name}`);

        set({
          currentProject: newProject,
          projects: [...state.projects, newProject],
          selectedComponentId: null,
        });
      },

      saveProject: () => {
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const updatedProject = { ...currentProject, updatedAt: new Date() };
        const existingIndex = projects.findIndex((p) => p.id === currentProject.id);

        if (existingIndex >= 0) {
          const updatedProjects = [...projects];
          updatedProjects[existingIndex] = updatedProject;
          set({ projects: updatedProjects, currentProject: updatedProject });
        } else {
          set({ projects: [...projects, updatedProject], currentProject: updatedProject });
        }
      },

      loadProject: (id) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === id);
        if (project) {
          set({ currentProject: project, selectedComponentId: null });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // ========== ИСТОРИЯ ==========

      saveToHistory: (description: string, force = false) => {
        const { currentProject, history, historyIndex, isBatching, batchedDescription } = get();

        if (!currentProject) return;

        // Если в режиме батчинга и не force, накапливаем описание
        if (isBatching && !force) {
          const newDescription = batchedDescription
            ? `${batchedDescription} → ${description}`
            : description;
          set({ batchedDescription: newDescription });
          return;
        }

        // Создаем глубокую копию текущего проекта
        const snapshot: Project = JSON.parse(JSON.stringify(currentProject));

        const finalDescription = batchedDescription || description;

        const newEntry: HistoryEntry = {
          id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(),
          snapshot,
          description: finalDescription,
        };

        // Удаляем все состояния после текущего индекса
        const newHistory = history.slice(0, historyIndex + 1);

        // Добавляем новое состояние
        newHistory.push(newEntry);

        // Ограничиваем размер истории
        while (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }

        const newIndex = newHistory.length - 1;

        set({
          history: newHistory,
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: false,
          batchedDescription: null,
        });
      },

      undo: () => {
        const { history, historyIndex, currentProject } = get();

        if (historyIndex <= 0 || !currentProject) return;

        const newIndex = historyIndex - 1;
        const previousState = history[newIndex];

        if (previousState) {
          set({
            currentProject: previousState.snapshot,
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true,
            selectedComponentId: null,
          });
        }
      },

      redo: () => {
        const { history, historyIndex, currentProject } = get();

        if (historyIndex >= history.length - 1 || !currentProject) return;

        const newIndex = historyIndex + 1;
        const nextState = history[newIndex];

        if (nextState) {
          set({
            currentProject: nextState.snapshot,
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < history.length - 1,
            selectedComponentId: null,
          });
        }
      },

      clearHistory: () => {
        set({
          history: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false,
          batchedDescription: null,
          isBatching: false,
        });
      },

      // ✅ ДОБАВЛЕНО: Функция для прямого обновления истории
      setHistory: (history) => {
        set({ history });
      },

      // ========== ГРУППИРОВКА ДЕЙСТВИЙ ==========

      startBatch: (description: string) => {
        set({
          isBatching: true,
          batchedDescription: description,
        });
      },

      endBatch: () => {
        const { isBatching, batchedDescription } = get();

        if (isBatching && batchedDescription) {
          get().saveToHistory(batchedDescription, true);
        }

        set({
          isBatching: false,
          batchedDescription: null,
        });
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
);
