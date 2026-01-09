'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'kanban'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-background/40 p-1">
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          'h-8',
          viewMode === 'list' && 'bg-background shadow-sm'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('kanban')}
        className={cn(
          'h-8',
          viewMode === 'kanban' && 'bg-background shadow-sm'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  )
}
