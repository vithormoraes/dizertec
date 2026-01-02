'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  mockProjects 
} from '@/lib/mock-data'
import type { Project, Deployment, ProjectNote, ProjectMember } from '@/types'

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

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [notes, setNotes] = useState<ProjectNote[]>([])

  useEffect(() => {
    const foundProject = getProjectById(projectId)
    if (foundProject) {
      setProject(foundProject)
      setDeployments(getProjectDeployments(projectId))
      setMembers(getProjectMembers(projectId))
      setNotes(getProjectNotes(projectId))
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

      {/* Technologies */}
      <div className="flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <Badge key={tech} variant="outline">
            {tech}
          </Badge>
        ))}
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
    </div>
  )
}
