import { create } from 'zustand'
import type { Project, ProjectFilters } from '@/types'

interface ProjectsState {
  projects: Project[]
  selectedProject: Project | null
  filters: ProjectFilters
  isLoading: boolean
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setSelectedProject: (project: Project | null) => void
  setFilters: (filters: ProjectFilters) => void
  setLoading: (loading: boolean) => void
  clearFilters: () => void
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  selectedProject: null,
  filters: {},
  isLoading: false,
  
  setProjects: (projects) => set({ projects }),
  
  addProject: (project) => set((state) => ({ 
    projects: [project, ...state.projects] 
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === id ? { ...p, ...updates } : p
    ),
    selectedProject: state.selectedProject?.id === id 
      ? { ...state.selectedProject, ...updates }
      : state.selectedProject
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    selectedProject: state.selectedProject?.id === id 
      ? null 
      : state.selectedProject
  })),
  
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearFilters: () => set({ filters: {} }),
}))
