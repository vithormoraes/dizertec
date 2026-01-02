-- ============================================
-- DizerTech - Schema Inicial
-- ============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: profiles
-- Extensão da tabela auth.users
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar profile automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TIPOS ENUM
-- ============================================
CREATE TYPE project_status AS ENUM ('active', 'archived', 'on-hold');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE deployment_environment AS ENUM ('development', 'staging', 'production');
CREATE TYPE deployment_status AS ENUM ('success', 'failed', 'pending', 'building');

-- ============================================
-- TABELA: projects
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  status project_status DEFAULT 'active' NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: project_members
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);

-- ============================================
-- TABELA: deployments
-- ============================================
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  environment deployment_environment NOT NULL,
  url TEXT,
  status deployment_status DEFAULT 'pending' NOT NULL,
  deployed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deployed_by UUID NOT NULL REFERENCES public.profiles(id),
  git_commit TEXT,
  git_branch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX idx_deployments_environment ON public.deployments(environment);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_deployments_deployed_at ON public.deployments(deployed_at DESC);

-- ============================================
-- TABELA: project_notes
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_project_notes_project_id ON public.project_notes(project_id);

CREATE TRIGGER update_project_notes_updated_at
  BEFORE UPDATE ON public.project_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: git_repositories
-- ============================================
CREATE TABLE IF NOT EXISTS public.git_repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  repository_url TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ,
  default_branch TEXT DEFAULT 'main',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_git_repositories_updated_at
  BEFORE UPDATE ON public.git_repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: project_analytics
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  commits_count INTEGER DEFAULT 0,
  deployments_count INTEGER DEFAULT 0,
  active_members_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, date)
);

CREATE INDEX idx_project_analytics_project_id ON public.project_analytics(project_id);
CREATE INDEX idx_project_analytics_date ON public.project_analytics(date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.git_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: profiles
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of project members"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT pm.user_id FROM public.project_members pm
      WHERE pm.project_id IN (
        SELECT pm2.project_id FROM public.project_members pm2
        WHERE pm2.user_id = auth.uid()
      )
    )
  );

-- ============================================
-- POLÍTICAS: projects
-- ============================================
CREATE POLICY "Users can view projects they are members of"
  ON public.projects FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners can delete projects"
  ON public.projects FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- POLÍTICAS: project_members
-- ============================================
CREATE POLICY "Members can view project members"
  ON public.project_members FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can add members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update member roles"
  ON public.project_members FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can remove members"
  ON public.project_members FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    ) OR
    user_id = auth.uid() -- Members can remove themselves
  );

-- ============================================
-- POLÍTICAS: deployments
-- ============================================
CREATE POLICY "Members can view project deployments"
  ON public.deployments FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create deployments"
  ON public.deployments FOR INSERT
  WITH CHECK (
    deployed_by = auth.uid() AND (
      project_id IN (
        SELECT p.id FROM public.projects p
        WHERE p.owner_id = auth.uid()
      ) OR
      project_id IN (
        SELECT pm.project_id FROM public.project_members pm
        WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin', 'member')
      )
    )
  );

-- ============================================
-- POLÍTICAS: project_notes
-- ============================================
CREATE POLICY "Members can view project notes"
  ON public.project_notes FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create notes"
  ON public.project_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND (
      project_id IN (
        SELECT p.id FROM public.projects p
        WHERE p.owner_id = auth.uid()
      ) OR
      project_id IN (
        SELECT pm.project_id FROM public.project_members pm
        WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin', 'member')
      )
    )
  );

CREATE POLICY "Authors can update their notes"
  ON public.project_notes FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete notes"
  ON public.project_notes FOR DELETE
  USING (
    author_id = auth.uid() OR
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- POLÍTICAS: git_repositories
-- ============================================
CREATE POLICY "Members can view git repositories"
  ON public.git_repositories FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can manage git repositories"
  ON public.git_repositories FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- POLÍTICAS: project_analytics
-- ============================================
CREATE POLICY "Members can view project analytics"
  ON public.project_analytics FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

-- Analytics são gerenciados por funções internas
CREATE POLICY "System can insert analytics"
  ON public.project_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON public.project_analytics FOR UPDATE
  USING (true);
