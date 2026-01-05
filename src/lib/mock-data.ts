// Dados mockados para desenvolvimento
import type { Profile, Project, Deployment, ProjectNote, ProjectMember, DashboardStats, ActivityItem, ProjectTask, AccessCredential } from '@/types'

// Usuário mockado
export const mockUser: Profile = {
  id: 'mock-user-1',
  full_name: 'Vithor Moraes',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vithor',
  email: 'vithor@dizertech.com',
  created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  updated_at: new Date().toISOString(),
}

// Outros usuários mockados (para membros de projetos)
export const mockUsers: Profile[] = [
  mockUser,
  {
    id: 'mock-user-2',
    full_name: 'Maria Santos',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    email: 'maria@dizertech.com',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-user-3',
    full_name: 'João Silva',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
    email: 'joao@dizertech.com',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-user-4',
    full_name: 'Ana Costa',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    email: 'ana@dizertech.com',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-user-5',
    full_name: 'Pedro Oliveira',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    email: 'pedro@dizertech.com',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Projetos mockados
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform',
    description: 'Plataforma completa de e-commerce com carrinho, checkout e integração com gateways de pagamento. Desenvolvida com as melhores práticas de UX/UI.',
    repository_url: 'https://github.com/dizertech/ecommerce',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'Stripe', 'PostgreSQL', 'Redis'],
    status: 'active',
    owner_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    owner: mockUser,
  },
  {
    id: 'proj-2',
    name: 'Mobile App API',
    description: 'Backend RESTful para aplicativo mobile de delivery. API robusta com autenticação JWT e rate limiting.',
    repository_url: 'https://github.com/dizertech/mobile-api',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    status: 'active',
    owner_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    owner: mockUser,
  },
  {
    id: 'proj-3',
    name: 'Admin Dashboard',
    description: 'Painel administrativo para gerenciamento de conteúdo e usuários. Interface moderna e responsiva.',
    repository_url: 'https://github.com/dizertech/admin',
    technologies: ['React', 'Material UI', 'GraphQL', 'Apollo'],
    status: 'on-hold',
    owner_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    owner: mockUser,
  },
  {
    id: 'proj-4',
    name: 'Landing Page Builder',
    description: 'Ferramenta drag-and-drop para criar landing pages de forma visual sem código.',
    repository_url: 'https://github.com/dizertech/landing-builder',
    technologies: ['Vue.js', 'Tailwind', 'Supabase', 'Vercel'],
    status: 'active',
    owner_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    owner: mockUser,
  },
  {
    id: 'proj-5',
    name: 'Chat Real-time',
    description: 'Aplicação de chat em tempo real com suporte a grupos, mensagens privadas e compartilhamento de arquivos.',
    repository_url: 'https://github.com/dizertech/chat-app',
    technologies: ['Next.js', 'Socket.io', 'MongoDB', 'AWS S3'],
    status: 'active',
    owner_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    owner: mockUser,
  },
  {
    id: 'proj-6',
    name: 'Legacy System',
    description: 'Sistema legado em manutenção. Migração planejada para Q2 2025.',
    repository_url: 'https://github.com/dizertech/legacy',
    technologies: ['PHP', 'MySQL', 'jQuery'],
    status: 'archived',
    owner_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    owner: mockUser,
  },
]

// Deployments mockados
export const mockDeployments: Deployment[] = [
  {
    id: 'deploy-1',
    project_id: 'proj-1',
    environment: 'production',
    url: 'https://ecommerce.dizertech.com',
    status: 'success',
    deployed_at: new Date(Date.now() - 3600000).toISOString(),
    deployed_by: 'mock-user-1',
    git_commit: 'a1b2c3d',
    git_branch: 'main',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    deployer: mockUser,
  },
  {
    id: 'deploy-2',
    project_id: 'proj-1',
    environment: 'staging',
    url: 'https://staging.ecommerce.dizertech.com',
    status: 'success',
    deployed_at: new Date(Date.now() - 7200000).toISOString(),
    deployed_by: 'mock-user-2',
    git_commit: 'd4e5f6g',
    git_branch: 'develop',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    deployer: mockUsers[1],
  },
  {
    id: 'deploy-3',
    project_id: 'proj-1',
    environment: 'development',
    url: 'https://dev.ecommerce.dizertech.com',
    status: 'failed',
    deployed_at: new Date(Date.now() - 86400000).toISOString(),
    deployed_by: 'mock-user-3',
    git_commit: 'h7i8j9k',
    git_branch: 'feature/checkout',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    deployer: mockUsers[2],
  },
  {
    id: 'deploy-4',
    project_id: 'proj-2',
    environment: 'production',
    url: 'https://api.mobile.dizertech.com',
    status: 'success',
    deployed_at: new Date(Date.now() - 1800000).toISOString(),
    deployed_by: 'mock-user-1',
    git_commit: 'l0m1n2o',
    git_branch: 'main',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    deployer: mockUser,
  },
  {
    id: 'deploy-5',
    project_id: 'proj-2',
    environment: 'staging',
    url: 'https://staging.api.mobile.dizertech.com',
    status: 'building',
    deployed_at: new Date(Date.now() - 900000).toISOString(),
    deployed_by: 'mock-user-4',
    git_commit: 'p3q4r5s',
    git_branch: 'develop',
    created_at: new Date(Date.now() - 900000).toISOString(),
    deployer: mockUsers[3],
  },
  {
    id: 'deploy-6',
    project_id: 'proj-4',
    environment: 'production',
    url: 'https://builder.dizertech.com',
    status: 'success',
    deployed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    deployed_by: 'mock-user-1',
    git_commit: 't6u7v8w',
    git_branch: 'main',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    deployer: mockUser,
  },
  {
    id: 'deploy-7',
    project_id: 'proj-5',
    environment: 'production',
    url: 'https://chat.dizertech.com',
    status: 'success',
    deployed_at: new Date(Date.now() - 86400000).toISOString(),
    deployed_by: 'mock-user-5',
    git_commit: 'x9y0z1a',
    git_branch: 'main',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    deployer: mockUsers[4],
  },
]

// Membros de projeto mockados
export const mockProjectMembers: ProjectMember[] = [
  // E-commerce Platform
  { id: 'pm-1', project_id: 'proj-1', user_id: 'mock-user-1', role: 'owner', created_at: new Date(Date.now() - 86400000 * 30).toISOString(), user: mockUsers[0] },
  { id: 'pm-2', project_id: 'proj-1', user_id: 'mock-user-2', role: 'admin', created_at: new Date(Date.now() - 86400000 * 25).toISOString(), user: mockUsers[1] },
  { id: 'pm-3', project_id: 'proj-1', user_id: 'mock-user-3', role: 'member', created_at: new Date(Date.now() - 86400000 * 20).toISOString(), user: mockUsers[2] },
  { id: 'pm-4', project_id: 'proj-1', user_id: 'mock-user-4', role: 'member', created_at: new Date(Date.now() - 86400000 * 10).toISOString(), user: mockUsers[3] },
  // Mobile App API
  { id: 'pm-5', project_id: 'proj-2', user_id: 'mock-user-1', role: 'owner', created_at: new Date(Date.now() - 86400000 * 45).toISOString(), user: mockUsers[0] },
  { id: 'pm-6', project_id: 'proj-2', user_id: 'mock-user-3', role: 'admin', created_at: new Date(Date.now() - 86400000 * 40).toISOString(), user: mockUsers[2] },
  { id: 'pm-7', project_id: 'proj-2', user_id: 'mock-user-5', role: 'member', created_at: new Date(Date.now() - 86400000 * 15).toISOString(), user: mockUsers[4] },
  // Admin Dashboard
  { id: 'pm-8', project_id: 'proj-3', user_id: 'mock-user-1', role: 'owner', created_at: new Date(Date.now() - 86400000 * 60).toISOString(), user: mockUsers[0] },
  { id: 'pm-9', project_id: 'proj-3', user_id: 'mock-user-2', role: 'member', created_at: new Date(Date.now() - 86400000 * 50).toISOString(), user: mockUsers[1] },
  // Landing Page Builder
  { id: 'pm-10', project_id: 'proj-4', user_id: 'mock-user-1', role: 'owner', created_at: new Date(Date.now() - 86400000 * 15).toISOString(), user: mockUsers[0] },
  { id: 'pm-11', project_id: 'proj-4', user_id: 'mock-user-4', role: 'admin', created_at: new Date(Date.now() - 86400000 * 10).toISOString(), user: mockUsers[3] },
  // Chat Real-time
  { id: 'pm-12', project_id: 'proj-5', user_id: 'mock-user-1', role: 'owner', created_at: new Date(Date.now() - 86400000 * 20).toISOString(), user: mockUsers[0] },
  { id: 'pm-13', project_id: 'proj-5', user_id: 'mock-user-5', role: 'admin', created_at: new Date(Date.now() - 86400000 * 18).toISOString(), user: mockUsers[4] },
  { id: 'pm-14', project_id: 'proj-5', user_id: 'mock-user-2', role: 'member', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), user: mockUsers[1] },
]

// Notas mockadas
export const mockNotes: ProjectNote[] = [
  {
    id: 'note-1',
    project_id: 'proj-1',
    title: 'Documentação da API de Pagamentos',
    content: '## Endpoints de Pagamento\n\n- `POST /api/payments/create` - Criar pagamento\n- `GET /api/payments/:id` - Consultar pagamento\n- `POST /api/payments/:id/refund` - Estornar pagamento\n\n### Autenticação\nTodas as requisições devem incluir o header `Authorization: Bearer <token>`',
    author_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: mockUsers[0],
  },
  {
    id: 'note-2',
    project_id: 'proj-1',
    title: 'Setup do Ambiente Local',
    content: '## Pré-requisitos\n\n- Node.js 18+\n- PostgreSQL 14+\n- Redis 7+\n\n## Instalação\n\n```bash\nnpm install\ncp .env.example .env.local\nnpm run dev\n```',
    author_id: 'mock-user-2',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    author: mockUsers[1],
  },
  {
    id: 'note-3',
    project_id: 'proj-1',
    title: 'Roadmap Q1 2025',
    content: '## Funcionalidades Planejadas\n\n- [ ] Integração com PIX\n- [ ] Sistema de cupons\n- [ ] Wishlist de produtos\n- [ ] Reviews de produtos\n- [ ] Sistema de afiliados',
    author_id: 'mock-user-1',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    author: mockUsers[0],
  },
  {
    id: 'note-4',
    project_id: 'proj-2',
    title: 'Arquitetura da API',
    content: '## Camadas\n\n1. **Controllers** - Recebem requisições HTTP\n2. **Services** - Lógica de negócio\n3. **Repositories** - Acesso a dados\n4. **Models** - Entidades do domínio\n\n## Padrões utilizados\n- Repository Pattern\n- Dependency Injection\n- Error Handling Middleware',
    author_id: 'mock-user-3',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    author: mockUsers[2],
  },
  {
    id: 'note-5',
    project_id: 'proj-5',
    title: 'Protocolo WebSocket',
    content: '## Eventos\n\n### Cliente → Servidor\n- `message:send` - Enviar mensagem\n- `typing:start` - Usuário digitando\n- `typing:stop` - Usuário parou de digitar\n\n### Servidor → Cliente\n- `message:received` - Nova mensagem\n- `user:online` - Usuário ficou online\n- `user:offline` - Usuário ficou offline',
    author_id: 'mock-user-5',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    author: mockUsers[4],
  },
]

// Credenciais de acesso mockadas
export const mockCredentials: AccessCredential[] = [
  {
    id: 'cred-1',
    project_id: 'proj-1',
    service_name: 'Supabase Admin',
    username: 'admin@ecommerce.com',
    password: 'Sup3rS3cureP@ssw0rd!',
    url: 'https://app.supabase.com',
    environment: 'production',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cred-2',
    project_id: 'proj-1',
    service_name: 'Admin Dashboard',
    username: 'admin@dizertech.com',
    password: 'D@shb0ard2025!',
    url: 'https://admin.ecommerce.dizertech.com',
    environment: 'production',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'cred-3',
    project_id: 'proj-1',
    service_name: 'AWS Console',
    username: 'dizertech-admin',
    password: 'AWS!Prod#2025',
    url: 'https://console.aws.amazon.com',
    environment: 'production',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'cred-4',
    project_id: 'proj-1',
    service_name: 'Stripe Dashboard',
    username: 'ecommerce@dizertech.com',
    password: 'Str1pe$taging!',
    url: 'https://dashboard.stripe.com',
    environment: 'staging',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'cred-5',
    project_id: 'proj-1',
    service_name: 'Supabase Dev',
    username: 'dev@ecommerce.com',
    password: 'D3vEnvP@ss123',
    url: 'https://app.supabase.com',
    environment: 'development',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

// Tarefas mockadas
export const mockTasks: ProjectTask[] = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Homologar integração PIX',
    description: 'Finalizar testes com o provedor de pagamentos e validar fluxos de falha.',
    status: 'in-progress',
    priority: 'high',
    owner_id: 'mock-user-2',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    owner: mockUsers[1],
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    title: 'Melhorar performance da vitrine',
    description: 'Auditar CLS e otimizar imagens hero no Core Web Vitals.',
    status: 'pending',
    priority: 'medium',
    owner_id: 'mock-user-3',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    owner: mockUsers[2],
  },
  {
    id: 'task-3',
    project_id: 'proj-1',
    title: 'Fluxo de e-mails transacionais',
    description: 'Configurar templates para carrinho abandonado e atualização de pedido.',
    status: 'completed',
    priority: 'low',
    owner_id: 'mock-user-5',
    due_date: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    owner: mockUsers[4],
  },
  {
    id: 'task-4',
    project_id: 'proj-1',
    title: 'Checklist de acessibilidade',
    description: 'Garantir contraste AA e navegação por teclado em todo checkout.',
    status: 'in-progress',
    priority: 'high',
    owner_id: 'mock-user-4',
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    owner: mockUsers[3],
  },
  {
    id: 'task-5',
    project_id: 'proj-1',
    title: 'Monitoramento de erros no checkout',
    description: 'Adicionar alertas no Sentry para passos críticos do funil de compra.',
    status: 'pending',
    priority: 'high',
    owner_id: 'mock-user-1',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    owner: mockUsers[0],
  },
]

// Estatísticas do Dashboard
export const mockDashboardStats: DashboardStats = {
  total_projects: 6,
  active_projects: 4,
  total_deployments: 45,
  successful_deployments: 42,
  total_members: 5,
  recent_activity: [],
}

// Atividades mockadas
export const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'deployment',
    title: 'Deploy em produção',
    description: 'E-commerce Platform - Deploy concluído com sucesso',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    project_id: 'proj-1',
    project_name: 'E-commerce Platform',
    user: mockUsers[0],
  },
  {
    id: 'act-2',
    type: 'deployment',
    title: 'Deploy em produção',
    description: 'Mobile App API - Deploy concluído com sucesso',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    project_id: 'proj-2',
    project_name: 'Mobile App API',
    user: mockUsers[0],
  },
  {
    id: 'act-3',
    type: 'note',
    title: 'Nova nota adicionada',
    description: 'Documentação da API de Pagamentos atualizada',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    project_id: 'proj-1',
    project_name: 'E-commerce Platform',
    user: mockUsers[0],
  },
  {
    id: 'act-4',
    type: 'member',
    title: 'Novo membro',
    description: 'Ana Costa foi adicionada ao projeto',
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
    project_id: 'proj-1',
    project_name: 'E-commerce Platform',
    user: mockUsers[3],
  },
  {
    id: 'act-5',
    type: 'deployment',
    title: 'Deploy falhou',
    description: 'E-commerce Platform - Erro no build',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    project_id: 'proj-1',
    project_name: 'E-commerce Platform',
    user: mockUsers[2],
  },
  {
    id: 'act-6',
    type: 'project',
    title: 'Projeto criado',
    description: 'Chat Real-time foi criado',
    timestamp: new Date(Date.now() - 86400000 * 20).toISOString(),
    project_id: 'proj-5',
    project_name: 'Chat Real-time',
    user: mockUsers[0],
  },
  {
    id: 'act-7',
    type: 'note',
    title: 'Nota atualizada',
    description: 'Roadmap Q1 2025 foi atualizado',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    project_id: 'proj-1',
    project_name: 'E-commerce Platform',
    user: mockUsers[0],
  },
]

// Função para obter deployments de um projeto
export function getProjectDeployments(projectId: string): Deployment[] {
  return mockDeployments.filter(d => d.project_id === projectId)
}

// Função para obter membros de um projeto
export function getProjectMembers(projectId: string): ProjectMember[] {
  return mockProjectMembers.filter(m => m.project_id === projectId)
}

// Função para obter notas de um projeto
export function getProjectNotes(projectId: string): ProjectNote[] {
  return mockNotes.filter(n => n.project_id === projectId)
}

// Função para obter tarefas de um projeto
export function getProjectTasks(projectId: string): ProjectTask[] {
  return mockTasks.filter(task => task.project_id === projectId)
}

// Função para obter credenciais de um projeto
export function getProjectCredentials(projectId: string): AccessCredential[] {
  return mockCredentials.filter(c => c.project_id === projectId)
}

// Função para obter um projeto por ID
export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find(p => p.id === projectId)
}
