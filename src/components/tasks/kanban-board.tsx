'use client'

import { useState } from 'react'
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { KanbanColumn } from './kanban-column'
import type { ProjectTask, TaskStatus } from '@/types'

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'pending', title: 'A Fazer' },
  { id: 'in-progress', title: 'Em Progresso' },
  { id: 'review', title: 'Revisão' },
  { id: 'completed', title: 'Concluído' },
]

interface KanbanBoardProps {
  tasks: ProjectTask[]
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
  onTaskClick?: (task: ProjectTask) => void
}

export function KanbanBoard({ tasks, onTaskStatusChange, onTaskClick }: KanbanBoardProps) {
  const [columns] = useState(COLUMNS)

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Se não houver destino ou for o mesmo lugar, não faz nada
    if (!destination || destination.droppableId === source.droppableId) {
      return
    }

    // Atualiza o status da tarefa
    onTaskStatusChange(draggableId, destination.droppableId as TaskStatus)
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)

          return (
            <div
              key={column.id}
              className={cn(
                'flex-shrink-0 w-80 bg-background/30 rounded-2xl border border-white/5',
                'flex flex-col max-h-[calc(100vh-400px)]'
              )}
            >
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      'flex flex-col h-full',
                      snapshot.isDraggingOver && 'bg-white/5'
                    )}
                  >
                    <KanbanColumn
                      title={column.title}
                      status={column.id}
                      tasks={columnTasks}
                      onTaskClick={onTaskClick}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
