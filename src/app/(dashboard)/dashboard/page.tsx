'use client'

import Link from 'next/link'
import { 
  FolderKanban, 
  Rocket, 
  Users, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  formatRelativeDate, 
  getInitials, 
  getStatusColor, 
  getDeploymentStatusColor,
  getStatusLabel,
} from '@/lib/utils'
import { 
  mockProjects, 
  mockDeployments, 
  mockActivities,
  mockDashboardStats,
  mockUsers
} from '@/lib/mock-data'

const getDeploymentIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'building':
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }
}

export default function DashboardPage() {
  const stats = mockDashboardStats
  const recentProjects = mockProjects.slice(0, 3)
  const recentDeployments = mockDeployments.slice(0, 4)
  const activity = mockActivities.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus projetos e atividades
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <FolderKanban className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Projetos
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_projects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_projects} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Deployments
            </CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_deployments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successful_deployments} com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.successful_deployments / stats.total_deployments) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              nos deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Membros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              colaboradores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projetos Recentes</CardTitle>
              <CardDescription>
                Seus projetos atualizados recentemente
              </CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{project.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Atualizado {formatRelativeDate(project.updated_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {project.technologies.slice(0, 2).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Deployments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Deployments Recentes</CardTitle>
              <CardDescription>
                Últimos deployments realizados
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDeployments.map((deployment) => {
              const project = mockProjects.find(p => p.id === deployment.project_id)
              return (
                <div 
                  key={deployment.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getDeploymentIcon(deployment.status)}
                    <div>
                      <p className="font-medium text-sm">
                        {project?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deployment.git_branch} • {deployment.git_commit?.slice(0, 7)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className={getDeploymentStatusColor(deployment.status)}>
                      {getStatusLabel(deployment.status)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeDate(deployment.deployed_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas ações nos seus projetos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.user?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(item.user?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{item.title}</span>
                    {item.project_name && (
                      <span className="text-muted-foreground"> em {item.project_name}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
