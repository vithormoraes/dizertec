-- ============================================
-- DizerTech - Materiais do Projeto (Arquivos + Notas)
-- ============================================

-- Bucket privado para materiais
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-materials', 'project-materials', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ENUM: tipo de nota
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_material_note_kind') THEN
    CREATE TYPE project_material_note_kind AS ENUM ('instructions', 'code');
  END IF;
END $$;

-- ============================================
-- TABELA: project_material_files
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_material_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT,
  size_bytes BIGINT NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_project_material_files_project_id ON public.project_material_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_material_files_created_at ON public.project_material_files(created_at DESC);

-- ============================================
-- TABELA: project_material_notes
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_material_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind project_material_note_kind DEFAULT 'instructions' NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_material_notes_project_id ON public.project_material_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_material_notes_updated_at ON public.project_material_notes(updated_at DESC);

CREATE TRIGGER update_project_material_notes_updated_at
  BEFORE UPDATE ON public.project_material_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.project_material_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_material_notes ENABLE ROW LEVEL SECURITY;

-- Helpers de membership (repete padrão do schema inicial)
-- SELECT
CREATE POLICY "Members can view project material files"
  ON public.project_material_files FOR SELECT
  USING (
    project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
    OR project_id IN (SELECT pm.project_id FROM public.project_members pm WHERE pm.user_id = auth.uid())
  );

CREATE POLICY "Members can view project material notes"
  ON public.project_material_notes FOR SELECT
  USING (
    project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
    OR project_id IN (SELECT pm.project_id FROM public.project_members pm WHERE pm.user_id = auth.uid())
  );

-- INSERT
CREATE POLICY "Members can upload project material files"
  ON public.project_material_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND (
      project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
      OR project_id IN (
        SELECT pm.project_id FROM public.project_members pm
        WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin', 'member')
      )
    )
  );

CREATE POLICY "Members can create project material notes"
  ON public.project_material_notes FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND (
      project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
      OR project_id IN (
        SELECT pm.project_id FROM public.project_members pm
        WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin', 'member')
      )
    )
  );

-- UPDATE
CREATE POLICY "Authors and admins can update project material notes"
  ON public.project_material_notes FOR UPDATE
  USING (
    created_by = auth.uid()
    OR project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
    OR project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- DELETE
CREATE POLICY "Uploaders and admins can delete project material files"
  ON public.project_material_files FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
    OR project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Authors and admins can delete project material notes"
  ON public.project_material_notes FOR DELETE
  USING (
    created_by = auth.uid()
    OR project_id IN (SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid())
    OR project_id IN (
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- STORAGE POLICIES (bucket privado)
-- Path esperado: projects/<project_id>/<...>
-- ============================================

-- Leitura
CREATE POLICY "Project members can read project materials objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-materials'
    AND split_part(name, '/', 1) = 'projects'
    AND split_part(name, '/', 2) ~* '^[0-9a-f-]{36}$'
    AND (split_part(name, '/', 2))::uuid IN (
      SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid()
      UNION
      SELECT pm.project_id FROM public.project_members pm WHERE pm.user_id = auth.uid()
    )
  );

-- Upload
CREATE POLICY "Project members can upload project materials objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-materials'
    AND split_part(name, '/', 1) = 'projects'
    AND split_part(name, '/', 2) ~* '^[0-9a-f-]{36}$'
    AND (split_part(name, '/', 2))::uuid IN (
      SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid()
      UNION
      SELECT pm.project_id FROM public.project_members pm
      WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin', 'member')
    )
  );

-- Remoção (dono do objeto OU owner/admin do projeto)
CREATE POLICY "Project members can delete project materials objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-materials'
    AND split_part(name, '/', 1) = 'projects'
    AND split_part(name, '/', 2) ~* '^[0-9a-f-]{36}$'
    AND (
      owner = auth.uid()
      OR (split_part(name, '/', 2))::uuid IN (
        SELECT p.id FROM public.projects p WHERE p.owner_id = auth.uid()
        UNION
        SELECT pm.project_id FROM public.project_members pm
        WHERE pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
      )
    )
  );
