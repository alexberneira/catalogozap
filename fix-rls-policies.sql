-- Corrigir políticas RLS para permitir inserções
-- Primeiro, vamos ver as políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('catalog_views', 'whatsapp_clicks');

-- Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Users can view their own catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Users can view their own whatsapp clicks" ON whatsapp_clicks;
DROP POLICY IF EXISTS "Allow insert for tracking" ON catalog_views;
DROP POLICY IF EXISTS "Allow insert for tracking" ON whatsapp_clicks;

-- Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE catalog_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks DISABLE ROW LEVEL SECURITY;

-- Ou, se preferir manter RLS, criar políticas mais permissivas
-- ALTER TABLE catalog_views ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções (se RLS estiver habilitado)
-- CREATE POLICY "Allow all operations for authenticated users" ON catalog_views
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON whatsapp_clicks
--   FOR ALL USING (true) WITH CHECK (true);

-- Verificar se as tabelas estão funcionando
SELECT 'catalog_views' as table_name, COUNT(*) as count FROM catalog_views
UNION ALL
SELECT 'whatsapp_clicks' as table_name, COUNT(*) as count FROM whatsapp_clicks;

-- Script para corrigir políticas RLS que podem estar causando problemas no cadastro
-- Execute este script no SQL Editor do Supabase

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recriar políticas com permissões mais específicas
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Adicionar política para permitir inserção durante o cadastro
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

-- Verificar se a tabela users tem as colunas corretas
-- Se não tiver, adicionar as colunas necessárias
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Garantir que a constraint UNIQUE no username existe
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_username_unique UNIQUE (username);

-- Verificar se a foreign key para auth.users existe
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; 