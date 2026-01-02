# DizerTech

Plataforma de gerenciamento de projetos e deployments desenvolvida com Next.js 14, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- **Autenticação** - Login/Signup com Supabase Auth
- **Dashboard** - Visão geral com estatísticas e atividades recentes
- **Gerenciamento de Projetos** - CRUD completo de projetos
- **Deployments** - Registro e acompanhamento de deploys por ambiente
- **Notas** - Documentação e notas por projeto
- **Colaboração** - Sistema de membros com diferentes roles
- **Analytics** - Métricas e gráficos de evolução

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Estado**: Zustand
- **Validação**: Zod + React Hook Form
- **Gráficos**: Recharts

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/dizertech.git
cd dizertech
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Configure o banco de dados no Supabase:

   - Crie um novo projeto no [Supabase](https://supabase.com)
   - Execute o script SQL em `supabase/migrations/001_initial_schema.sql` no SQL Editor
   - (Opcional) Execute o seed em `supabase/seed.sql` para dados de exemplo

5. Execute o projeto:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/               # API Routes
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   └── layout/            # Header, Sidebar
├── lib/
│   ├── supabase/          # Cliente Supabase
│   ├── utils/             # Funções utilitárias
│   └── validations/       # Schemas Zod
├── hooks/                 # Custom hooks
├── store/                 # Zustand stores
└── types/                 # Tipos TypeScript
```

## 🗄️ Banco de Dados

### Tabelas Principais

- `profiles` - Perfis de usuários
- `projects` - Projetos
- `project_members` - Membros do projeto
- `deployments` - Registros de deploy
- `project_notes` - Notas e documentação
- `git_repositories` - Cache de info Git
- `project_analytics` - Métricas

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS configuradas:

- Usuários só veem projetos onde são membros
- Apenas owners/admins podem editar projetos
- Membros podem criar deployments e notas

## 🎨 Componentes UI

O projeto utiliza [shadcn/ui](https://ui.shadcn.com/) para componentes base:

- Button, Card, Input, Select
- Dialog, Tabs
- Avatar, Badge
- E outros...

## 📝 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de linting
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `NEXT_PUBLIC_SITE_URL` | URL do site (para redirecionamentos) |

## 🚧 Próximos Passos

- [ ] Integração com GitHub/GitLab APIs
- [ ] Webhooks para sincronização automática
- [ ] Notificações em tempo real
- [ ] Exportação de relatórios
- [ ] Templates de projeto
- [ ] Integração com CI/CD

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.
