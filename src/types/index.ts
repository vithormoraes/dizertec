// Tipos globais do DizerTech

// Status de projeto
export type ProjectStatus = 'active' | 'archived' | 'on-hold'

// Roles de membros
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'

// Ambientes de deploy
export type DeploymentEnvironment = 'development' | 'staging' | 'production'

// Ambiente de credencial de acesso
export type CredentialEnvironment = 'production' | 'staging' | 'development'

// Status de deployment
export type DeploymentStatus = 'success' | 'failed' | 'pending' | 'building'

// Status e prioridade de tarefas
export type TaskStatus = 'pending' | 'in-progress' | 'review' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

// Profile do usuário
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email?: string
  created_at: string
  updated_at: string
}

// Projeto
export interface Project {
  id: string
  name: string
  description: string | null
  repository_url: string | null
  technologies: string[]
  status: ProjectStatus
  owner_id: string
  created_at: string
  updated_at: string
  // Relações
  owner?: Profile
  members?: ProjectMember[]
  deployments?: Deployment[]
  notes?: ProjectNote[]
}

// Membro do projeto
export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: MemberRole
  created_at: string
  // Relações
  user?: Profile
  project?: Project
}

// Deployment
export interface Deployment {
  id: string
  project_id: string
  environment: DeploymentEnvironment
  url: string | null
  status: DeploymentStatus
  deployed_at: string
  deployed_by: string
  git_commit: string | null
  git_branch: string | null
  created_at: string
  // Relações
  deployer?: Profile
  project?: Project
}

// Nota do projeto
export interface ProjectNote {
  id: string
  project_id: string
  title: string
  content: string | null
  author_id: string
  created_at: string
  updated_at: string
  // Relações
  author?: Profile
  project?: Project
}

// Tarefas do projeto
export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  owner_id: string
  due_date: string | null
  tags?: string[]
  technologies?: string[]
  prompts?: any[]
  outputFormat?: string
  created_at: string
  updated_at: string
  // Relações
  owner?: Profile
  project?: Project
}

// Credencial de acesso
export interface AccessCredential {
  id: string
  project_id: string
  service_name: string
  username: string
  password: string
  url: string | null
  environment: CredentialEnvironment
  created_at: string
  updated_at: string
}

// Materiais do projeto: arquivos
export interface ProjectMaterialFile {
  id: string
  project_id: string
  storage_path: string
  file_name: string
  content_type: string | null
  size_bytes: number
  description: string | null
  uploaded_by: string
  created_at: string
}

// Materiais do projeto: instruções/códigos
export type ProjectMaterialNoteKind = 'instructions' | 'code'

export interface ProjectMaterialNote {
  id: string
  project_id: string
  kind: ProjectMaterialNoteKind
  title: string
  content: string
  created_by: string
  created_at: string
  updated_at: string
}

// Instrucoes gerais
export type InstructionKind = 'document' | 'link' | 'text'

export interface GeneralInstruction {
  id: string
  title: string
  category: string | null
  kind: InstructionKind
  description: string | null
  content: string | null
  link_url: string | null
  storage_path: string | null
  mime_type: string | null
  size_bytes: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Repositório Git
export interface GitRepository {
  id: string
  project_id: string
  repository_url: string
  last_sync_at: string | null
  default_branch: string | null
  created_at: string
  updated_at: string
}

// Analytics do projeto
export interface ProjectAnalytics {
  id: string
  project_id: string
  date: string
  commits_count: number
  deployments_count: number
  active_members_count: number
  created_at: string
}

// Estatísticas do dashboard
export interface DashboardStats {
  total_projects: number
  active_projects: number
  total_deployments: number
  successful_deployments: number
  total_members: number
  recent_activity: ActivityItem[]
}

// Item de atividade
export interface ActivityItem {
  id: string
  type: 'deployment' | 'note' | 'member' | 'project'
  title: string
  description: string
  timestamp: string
  project_id?: string
  project_name?: string
  user?: Profile
}

// Filtros de projeto
export interface ProjectFilters {
  status?: ProjectStatus
  technology?: string
  search?: string
}

// Paginação
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
