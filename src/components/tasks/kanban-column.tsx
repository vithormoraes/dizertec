'use client'

import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanTaskCard } from './kanban-task-card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/utils'
import type { ProjectTask, TaskStatus } from '@/types'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: ProjectTask[]
  onTaskClick?: (task: ProjectTask) => void
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-200',
  'in-progress': 'bg-sky-500/20 text-sky-200',
  review: 'bg-purple-500/20 text-purple-200',
  completed: 'bg-emerald-500/20 text-emerald-200',
}

export function KanbanColumn({ title, status, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <div className="flex h-full flex-col p-4">
      {/* Cabeçalho da coluna */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
          {title}
        </h3>
        <Badge
          variant="secondary"
          className={cn(
            'h-6 min-w-[24px] rounded-full px-2 text-xs font-medium',
            STATUS_COLORS[status]
          )}
        >
          {tasks.length}
        </Badge>
      </div>

      {/* Lista de tarefas com rolagem */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {tasks.map((task) => (
          <KanbanTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
        ))}

        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
            <p className="text-xs text-muted-foreground">Nenhuma tarefa</p>
          </div>
        )}
      </div>
    </div>
  )
}
