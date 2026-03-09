// src/store/projectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Импортируем общие типы (путь может отличаться, проверьте где лежит types.ts)
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
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      selectedComponentId: null,
      isLoading: false,
      error: null,

      setCurrentProject: (project) => set({ currentProject: project }),

      updateProject: (updates) =>
        set((state) => ({
          currentProject: state.currentProject ? { ...state.currentProject, ...updates } : null,
        })),

      addComponent: (component) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              components: [...state.currentProject.components, component],
              updatedAt: new Date(),
            },
          };
        }),

      updateComponent: (id, updates) =>
        set((state) => {
          if (!state.currentProject) return state;
          const updateComponents = (components: UIComponent[]): UIComponent[] => {
            return components.map((comp) => {
              if (comp.id === id) return { ...comp, ...updates } as UIComponent;
              if (comp.children) return { ...comp, children: updateComponents(comp.children) };
              return comp;
            });
          };
          return {
            currentProject: {
              ...state.currentProject,
              components: updateComponents(state.currentProject.components),
              updatedAt: new Date(),
            },
          };
        }),

      removeComponent: (id) =>
        set((state) => {
          if (!state.currentProject) return state;
          const filterComponents = (components: UIComponent[]): UIComponent[] => {
            return components
              .filter((comp) => comp.id !== id)
              .map((comp) => ({
                ...comp,
                children: comp.children ? filterComponents(comp.children) : undefined,
              }));
          };
          return {
            currentProject: {
              ...state.currentProject,
              components: filterComponents(state.currentProject.components),
              updatedAt: new Date(),
            },
          };
        }),

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
        set((state) => ({
          currentProject: newProject,
          projects: [...state.projects, newProject],
          selectedComponentId: null,
        }));
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
        if (project) set({ currentProject: project, selectedComponentId: null });
      },

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);
