'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils'
import type { ProjectTask, TaskPriority, TaskStatus } from '@/types'

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  high: { bg: 'bg-rose-500/20', text: 'text-rose-200' },
  medium: { bg: 'bg-indigo-500/20', text: 'text-indigo-200' },
  low: { bg: 'bg-slate-500/20', text: 'text-slate-200' },
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'border-amber-500/30',
  'in-progress': 'border-sky-500/30',
  review: 'border-purple-500/30',
  completed: 'border-emerald-500/30',
}

interface KanbanTaskCardProps {
  task: ProjectTask
  onTaskClick?: (task: ProjectTask) => void
}

export function KanbanTaskCard({ task, onTaskClick }: KanbanTaskCardProps) {
  const priorityColor = PRIORITY_COLORS[task.priority]
  const statusColor = STATUS_COLORS[task.status]

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <Draggable draggableId={task.id} index={0}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onTaskClick?.(task)}
          className={cn(
            'rounded-xl border bg-background/80 backdrop-blur-sm p-4 transition-all cursor-pointer hover:border-white/20',
            statusColor,
            snapshot.isDragging && 'shadow-2xl shadow-black/50 scale-105'
          )}
        >
          {/* Título e Prioridade */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <h4 className="flex-1 text-sm font-semibold leading-tight text-foreground">
              {task.title}
            </h4>
            <Badge
              variant="secondary"
              className={cn('text-xs font-medium', priorityColor.bg, priorityColor.text)}
            >
              {task.priority === 'high' && 'Alta'}
              {task.priority === 'medium' && 'Média'}
              {task.priority === 'low' && 'Baixa'}
            </Badge>
          </div>

          {/* Descrição */}
          {task.description && (
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}

          {/* Rodapé: Responsável e Data */}
          <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
            {/* Responsável */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.owner?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(task.owner?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {task.owner?.full_name?.split(' ')[0] || 'Equipe'}
              </span>
            </div>

            {/* Data de entrega */}
            {task.due_date && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  isOverdue ? 'text-red-400' : 'text-muted-foreground'
                )}
              >
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                <span>{formatRelativeDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
