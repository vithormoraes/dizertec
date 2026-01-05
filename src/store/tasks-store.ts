import { create } from 'zustand'
import type { ProjectTask, TaskStatus, TaskPriority } from '@/types'

interface TasksState {
  tasks: ProjectTask[]
  isLoading: boolean
  setTasks: (tasks: ProjectTask[]) => void
  addTask: (task: ProjectTask) => void
  updateTask: (id: string, updates: Partial<ProjectTask>) => void
  deleteTask: (id: string) => void
  setLoading: (loading: boolean) => void
  getTasksByProject: (projectId: string) => ProjectTask[]
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => 
      t.id === id ? { ...t, ...updates } : t
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  getTasksByProject: (projectId) => {
    return get().tasks.filter((t) => t.project_id === projectId)
  }
}))
