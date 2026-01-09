-- ============================================
-- DizerTech - Instrucoes Gerais (docs/links/textos)
-- ============================================

-- Bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('general-instructions', 'general-instructions', false)
ON CONFLICT (id) DO NOTHING;

-- Tipo ENUM para kind
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instruction_kind') THEN
    CREATE TYPE instruction_kind AS ENUM ('document', 'link', 'text');
  END IF;
END $$;

-- Tabela principal
CREATE TABLE IF NOT EXISTS public.general_instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT,
  kind instruction_kind NOT NULL DEFAULT 'text',
  description TEXT,
  content TEXT,
  link_url TEXT,
  storage_path TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_general_instructions_kind ON public.general_instructions(kind);
CREATE INDEX IF NOT EXISTS idx_general_instructions_category ON public.general_instructions(category);
CREATE INDEX IF NOT EXISTS idx_general_instructions_updated_at ON public.general_instructions(updated_at DESC);

CREATE TRIGGER update_general_instructions_updated_at
  BEFORE UPDATE ON public.general_instructions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.general_instructions ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler
CREATE POLICY "Authenticated can read general instructions"
  ON public.general_instructions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Somente autor insere
CREATE POLICY "Author inserts general instructions"
  ON public.general_instructions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Somente autor atualiza
CREATE POLICY "Author updates general instructions"
  ON public.general_instructions FOR UPDATE
  USING (auth.uid() = created_by);

-- Somente autor remove
CREATE POLICY "Author deletes general instructions"
  ON public.general_instructions FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- STORAGE policies para bucket general-instructions
-- ============================================

-- Leitura de objetos
CREATE POLICY "Auth read general instructions objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'general-instructions'
    AND auth.uid() IS NOT NULL
  );

-- Upload: exige prefixo general/ e usuario autenticado
CREATE POLICY "Auth upload general instructions objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'general-instructions'
    AND auth.uid() IS NOT NULL
    AND split_part(name, '/', 1) = 'general'
  );

-- Delete: somente owner do objeto
CREATE POLICY "Owner delete general instructions objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'general-instructions'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );
