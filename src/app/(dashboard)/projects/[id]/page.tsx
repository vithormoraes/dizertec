'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Settings,
  Users,
  FileText,
  Rocket,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ListChecks,
  Filter,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  formatRelativeDate,
  formatDateTime,
  getInitials,
  getStatusColor,
  getDeploymentStatusColor,
  getEnvironmentColor,
  getStatusLabel,
  getEnvironmentLabel,
  getRoleLabel
} from '@/lib/utils'
import { 
  getProjectById, 
  getProjectDeployments, 
  getProjectMembers, 
  getProjectNotes,
  getProjectTasks,
  getProjectCredentials,
  mockProjects 
} from '@/lib/mock-data'
import { ViewToggle, KanbanBoard, TaskModal } from '@/components/tasks'
import { AccessManagement } from '@/components/access-management'
import { useTasksStore } from '@/store/tasks-store'
import type { Project, Deployment, ProjectNote, ProjectMember, ProjectTask, TaskStatus, TaskPriority, AccessCredential } from '@/types'

const getDeploymentIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'building':
      return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }
}

type TaskFilter = 'all' | TaskStatus

type ViewMode = 'list' | 'kanban'

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-200 border border-amber-500/20' },
  'in-progress': { label: 'Em progresso', className: 'bg-sky-500/10 text-sky-200 border border-sky-500/20' },
  review: { label: 'Revisão', className: 'bg-purple-500/10 text-purple-200 border border-purple-500/20' },
  completed: { label: 'Concluída', className: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20' },
}

const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: 'Alta', className: 'bg-rose-500/10 text-rose-200 border border-rose-500/30' },
  medium: { label: 'Média', className: 'bg-indigo-500/10 text-indigo-200 border border-indigo-500/30' },
  low: { label: 'Baixa', className: 'bg-slate-500/10 text-slate-200 border border-slate-500/30' },
}

const TASK_FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'in-progress', label: 'Em progresso' },
  { value: 'review', label: 'Em revisão' },
  { value: 'completed', label: 'Concluídas' },
]

// Persistência da visualização
const STORAGE_KEY = `task-view-mode-:project-`

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [credentials, setCredentials] = useState<AccessCredential[]>([])
  const { addTask, updateTask: updateTaskStore } = useTasksStore()
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | undefined>()

  const taskStats = useMemo(() => {
    const pending = tasks.filter(task => task.status === 'pending').length
    const inProgress = tasks.filter(task => task.status === 'in-progress').length
    const review = tasks.filter(task => task.status === 'review').length
    const completed = tasks.filter(task => task.status === 'completed').length
    return {
      pending,
      inProgress,
      review,
      completed,
      total: tasks.length,
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') {
      return tasks
    }

    return tasks.filter(task => task.status === taskFilter)
  }, [tasks, taskFilter])

  const completionRate = taskStats.total
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0

  const activityHighlights = useMemo(() => {
    const deploymentEvents = deployments.map((deployment) => ({
      id: deployment.id,
      title: `Deploy ${getEnvironmentLabel(deployment.environment)}`,
      description: `${deployment.git_branch ?? 'main'} • ${getStatusLabel(deployment.status)}`,
      timestamp: deployment.deployed_at,
    }))

    const noteEvents = notes.map((note) => ({
      id: note.id,
      title: 'Nota atualizada',
      description: note.title,
      timestamp: note.updated_at,
    }))

    return [...deploymentEvents, ...noteEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4)
  }, [deployments, notes])

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStore(taskId, { status, updated_at: new Date().toISOString() })
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status, updated_at: new Date().toISOString() } : task
      )
    )
  }

  const handleOpenTaskModal = (task?: ProjectTask) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(undefined)
  }

  const handleSaveTask = (taskData: ProjectTask) => {
    updateTaskStore(taskData.id, taskData)
    setTasks((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === taskData.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = taskData
        return updated
      }
      return [taskData, ...prev]
    })
  }

  const handleAddTask = (task: ProjectTask) => {
    setTasks((prev) => [task, ...prev])
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    // Persistir no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}${projectId}`, mode)
    }
  }

  const hasTasks = tasks.length > 0

  useEffect(() => {
    // Carregar visualização salva do localStorage
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem(`${STORAGE_KEY}${projectId}`)
      if (savedViewMode === 'list' || savedViewMode === 'kanban') {
        setViewMode(savedViewMode)
      }
    }
  }, [projectId])

  useEffect(() => {
    const foundProject = getProjectById(projectId)
    if (foundProject) {
      setProject(foundProject)
      setDeployments(getProjectDeployments(projectId))
      setMembers(getProjectMembers(projectId))
      setNotes(getProjectNotes(projectId))
      setTasks(getProjectTasks(projectId))
      setCredentials(getProjectCredentials(projectId))
      setTaskFilter('all')
    }
  }, [projectId])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Projeto não encontrado</h2>
          <p className="text-muted-foreground mt-2">O projeto que você está procurando não existe.</p>
          <Link href="/projects" className="mt-4 inline-block">
            <Button>Voltar para projetos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {project.description}
            </p>
            <div className="flex items-center gap-4 mt-3">
              {project.repository_url && (
                <a 
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GitBranch className="h-4 w-4" />
                  {project.repository_url.replace('https://github.com/', '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <span className="text-sm text-muted-foreground">
                Criado {formatRelativeDate(project.created_at)}
              </span>
            </div>
          </div>
        </div>
        <Link href={`/projects/${params.id}/settings`}>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </Link>
      </div>

      {/* Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-background/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Descrição</CardTitle>
            <CardDescription>Contexto estratégico e status do projeto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{project.description ?? 'Nenhuma descrição detalhada cadastrada para este projeto.'}</p>
            <div className="grid gap-4 sm:grid-cols-3 text-xs uppercase tracking-wide text-muted-foreground/80">
              <div>
                <span className="block text-[11px]">Owner</span>
                <span className="font-semibold text-foreground">{project.owner?.full_name ?? 'Equipe DizerTech'}</span>
              </div>
              <div>
                <span className="block text-[11px]">Criado</span>
                <span className="font-semibold text-foreground">{formatRelativeDate(project.created_at)}</span>
              </div>
              <div>
                <span className="block text-[11px]">Última atualização</span>
                <span className="font-semibold text-foreground">{formatRelativeDate(project.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Tech Stack</CardTitle>
            <CardDescription>Stacks e integrações principais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-white/5 text-white/90">
                {tech}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Access Management */}
        <AccessManagement credentials={credentials} />
      </div>

      {/* Tasks + Activity */}
      <div className={`grid gap-6 ${hasTasks ? 'lg:grid-cols-3' : ''}`}>
        <Card className={`${hasTasks ? 'lg:col-span-2' : 'lg:col-span-3'} bg-background/40 border-white/5`}>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-4 w-4 text-primary" />
                Gerenciamento de Tarefas
              </CardTitle>
              <CardDescription>Controle o progresso crítico do checkout em tempo real.</CardDescription>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleOpenTaskModal()}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova Tarefa
                </Button>
                {hasTasks && <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />}
              </div>
              {hasTasks && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted/40 px-3 py-1">
                    Pendentes {taskStats.pending}
                  </span>
                  <span className="rounded-full bg-muted/40 px-3 py-1">
                    Em progresso {taskStats.inProgress}
                  </span>
                  <span className="rounded-full bg-muted/40 px-3 py-1">
                    Revisão {taskStats.review}
                  </span>
                  <span className="rounded-full bg-muted/40 px-3 py-1">
                    Concluídas {taskStats.completed}
                  </span>
                  <span className="rounded-full bg-muted/40 px-3 py-1">
                    {completionRate}% completo
                  </span>
                  <div className="w-full lg:w-48 space-y-1">
                    <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground/80">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Status</span>
                    </div>
                    <Select value={taskFilter} onValueChange={(value) => setTaskFilter(value as TaskFilter)}>
                      <SelectTrigger className="w-full border-white/10 bg-background/40">
                        <SelectValue placeholder="Filtrar status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {TASK_FILTER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'kanban' ? (
              <KanbanBoard 
                tasks={filteredTasks} 
                onTaskStatusChange={handleTaskStatusChange}
                onTaskClick={handleOpenTaskModal}
              />
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-muted-foreground">
                Nenhuma tarefa para o filtro selecionado.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const statusMeta = TASK_STATUS_CONFIG[task.status]
                const priorityMeta = TASK_PRIORITY_CONFIG[task.priority]

                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTaskModal(task)}
                    className="rounded-2xl border border-white/5 bg-background/40 p-4 backdrop-blur cursor-pointer hover:border-white/10 transition-colors"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`rounded-full px-3 py-1 ${priorityMeta.className}`}>
                            Prioridade {priorityMeta.label}
                          </span>
                          <span className={`rounded-full px-3 py-1 ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                          {task.due_date && (
                            <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">
                              Entrega {formatRelativeDate(task.due_date)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-foreground">{task.title}</p>
                          {task.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>Atualizado {formatRelativeDate(task.updated_at)}</span>
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-3 md:w-64">
                        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-background/60 p-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={task.owner?.avatar_url ?? undefined} />
                            <AvatarFallback>{getInitials(task.owner?.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-tight">{task.owner?.full_name ?? 'Equipe DizerTech'}</p>
                            <p className="text-xs text-muted-foreground">Responsável direto</p>
                          </div>
                        </div>

                        <Select
                          value={task.status}
                          onValueChange={(value) => handleTaskStatusChange(task.id, value as TaskStatus)}
                        >
                          <SelectTrigger className="border-white/10 bg-background/60">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map((status) => (
                              <SelectItem key={status} value={status}>
                                {TASK_STATUS_CONFIG[status].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant={task.status === 'completed' ? 'secondary' : 'outline'}
                          size="sm"
                          className="w-full"
                          onClick={() => handleTaskStatusChange(task.id, 'completed')}
                          disabled={task.status === 'completed'}
                        >
                          {task.status === 'completed' ? 'Tarefa concluída' : 'Marcar como concluída'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {hasTasks && (
          <Card className="bg-background/40 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Últimos movimentos vinculados a este projeto</CardDescription>
            </CardHeader>
            <CardContent>
              {activityHighlights.length ? (
                <div className="space-y-4">
                  {activityHighlights.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-none last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeDate(item.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem atividade recente cadastrada.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deployments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deployments" className="gap-2">
            <Rocket className="h-4 w-4" />
            Deployments
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Atividade
          </TabsTrigger>
        </TabsList>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Histórico de Deployments</h2>
            <Button>
              <Rocket className="mr-2 h-4 w-4" />
              Novo Deploy
            </Button>
          </div>

          {deployments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum deployment ainda</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Crie seu primeiro deployment para este projeto
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {deployments.map((deployment) => (
                <Card key={deployment.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      {getDeploymentIcon(deployment.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getEnvironmentColor(deployment.environment)}>
                            {getEnvironmentLabel(deployment.environment)}
                          </Badge>
                          <span className="text-sm font-medium">
                            {deployment.git_branch}
                          </span>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">
                            {deployment.git_commit?.slice(0, 7)}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(deployment.deployed_at)} por {deployment.deployer?.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={getDeploymentStatusColor(deployment.status)}>
                        {getStatusLabel(deployment.status)}
                      </Badge>
                      {deployment.url && (
                        <a 
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membros do Projeto</h2>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </div>

          <Card>
            <CardContent className="divide-y">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-4 first:pt-6 last:pb-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(member.user?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email} • Adicionado {formatRelativeDate(member.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{getRoleLabel(member.role)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notas e Documentação</h2>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Nova Nota
            </Button>
          </div>

          {notes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma nota ainda</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Crie sua primeira nota para documentar este projeto
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={note.author?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{getInitials(note.author?.full_name)}</AvatarFallback>
                      </Avatar>
                      <span>{note.author?.full_name}</span>
                      <span>•</span>
                      <span>Atualizado {formatRelativeDate(note.updated_at)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-xl font-semibold">Atividade Recente</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {[...deployments, ...notes].sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ).slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        {'environment' in item ? (
                          <>
                            Deploy em <span className="font-medium">{getEnvironmentLabel(item.environment)}</span>
                            {' - '}
                            <span className={item.status === 'success' ? 'text-green-600' : item.status === 'failed' ? 'text-red-600' : 'text-blue-600'}>
                              {getStatusLabel(item.status)}
                            </span>
                          </>
                        ) : (
                          <>
                            Nota atualizada: <span className="font-medium">{item.title}</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        projectId={project.id}
        ownerId={project.owner_id}
        availableUsers={members.map((m) => m.user!).filter(Boolean)}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
      />
    </div>
  )
}
