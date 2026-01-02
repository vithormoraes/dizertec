-- ============================================
-- DizerTech - Dados de Exemplo (Seed)
-- ============================================
-- Este arquivo pode ser usado para popular o banco
-- com dados de exemplo para desenvolvimento/testes
-- ============================================

-- Nota: Este seed assume que você já tem um usuário criado
-- via autenticação do Supabase. Substitua os UUIDs pelos
-- IDs reais dos usuários criados.

-- Para executar este seed:
-- 1. Crie um usuário no Supabase Auth
-- 2. Copie o UUID do usuário
-- 3. Substitua 'SEU_USER_ID_AQUI' pelo UUID real
-- 4. Execute o SQL

-- Exemplo de projetos (descomente e ajuste após criar usuário):

/*
-- Variável para o ID do usuário (substitua pelo ID real)
DO $$
DECLARE
  user_id UUID := 'SEU_USER_ID_AQUI';
  project1_id UUID;
  project2_id UUID;
  project3_id UUID;
BEGIN

  -- Criar projetos
  INSERT INTO public.projects (id, name, description, repository_url, technologies, status, owner_id)
  VALUES 
    (uuid_generate_v4(), 'E-commerce Platform', 'Plataforma completa de e-commerce com carrinho, checkout e integração com gateways de pagamento.', 'https://github.com/user/ecommerce', ARRAY['Next.js', 'TypeScript', 'Tailwind', 'Stripe', 'PostgreSQL'], 'active', user_id)
  RETURNING id INTO project1_id;
  
  INSERT INTO public.projects (id, name, description, repository_url, technologies, status, owner_id)
  VALUES 
    (uuid_generate_v4(), 'Mobile App API', 'Backend RESTful para aplicativo mobile de delivery.', 'https://github.com/user/mobile-api', ARRAY['Node.js', 'Express', 'PostgreSQL', 'Redis'], 'active', user_id)
  RETURNING id INTO project2_id;
  
  INSERT INTO public.projects (id, name, description, repository_url, technologies, status, owner_id)
  VALUES 
    (uuid_generate_v4(), 'Admin Dashboard', 'Painel administrativo para gerenciamento de conteúdo.', 'https://github.com/user/admin', ARRAY['React', 'Material UI', 'GraphQL'], 'on-hold', user_id)
  RETURNING id INTO project3_id;

  -- Criar membros do projeto (owner é adicionado automaticamente)
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES 
    (project1_id, user_id, 'owner'),
    (project2_id, user_id, 'owner'),
    (project3_id, user_id, 'owner');

  -- Criar deployments
  INSERT INTO public.deployments (project_id, environment, url, status, deployed_by, git_commit, git_branch)
  VALUES 
    (project1_id, 'production', 'https://ecommerce.com', 'success', user_id, 'abc123def', 'main'),
    (project1_id, 'staging', 'https://staging.ecommerce.com', 'success', user_id, 'def456ghi', 'develop'),
    (project1_id, 'development', 'https://dev.ecommerce.com', 'failed', user_id, 'ghi789jkl', 'feature/checkout'),
    (project2_id, 'production', 'https://api.mobile.com', 'success', user_id, 'jkl012mno', 'main'),
    (project2_id, 'staging', 'https://staging.api.mobile.com', 'building', user_id, 'mno345pqr', 'develop');

  -- Criar notas
  INSERT INTO public.project_notes (project_id, title, content, author_id)
  VALUES 
    (project1_id, 'Documentação da API', 'Endpoints principais documentados no Swagger. Acesse /api/docs para ver a documentação completa.', user_id),
    (project1_id, 'Setup do ambiente local', 'Para configurar o ambiente local, siga os passos no README.md do repositório.', user_id),
    (project2_id, 'Roadmap Q1 2024', 'Funcionalidades planejadas:\n- Autenticação OAuth\n- Cache Redis\n- Rate limiting', user_id);

  -- Criar analytics de exemplo
  INSERT INTO public.project_analytics (project_id, date, commits_count, deployments_count, active_members_count)
  VALUES 
    (project1_id, CURRENT_DATE - INTERVAL '6 days', 5, 2, 3),
    (project1_id, CURRENT_DATE - INTERVAL '5 days', 8, 1, 3),
    (project1_id, CURRENT_DATE - INTERVAL '4 days', 12, 3, 4),
    (project1_id, CURRENT_DATE - INTERVAL '3 days', 6, 2, 3),
    (project1_id, CURRENT_DATE - INTERVAL '2 days', 10, 4, 4),
    (project1_id, CURRENT_DATE - INTERVAL '1 day', 15, 2, 5),
    (project1_id, CURRENT_DATE, 8, 1, 4);

END $$;
*/

-- Para limpar os dados de exemplo:
/*
TRUNCATE public.project_analytics CASCADE;
TRUNCATE public.project_notes CASCADE;
TRUNCATE public.deployments CASCADE;
TRUNCATE public.git_repositories CASCADE;
TRUNCATE public.project_members CASCADE;
TRUNCATE public.projects CASCADE;
*/
