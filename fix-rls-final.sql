-- Script FINAL para corrigir problemas no cadastro de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow all operations for now" ON users;

-- 3. Garantir que as colunas opcionais existem
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. HABILITAR RLS novamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Criar política MUITO permissiva para resolver o problema
CREATE POLICY "Allow all operations for now" ON users
  FOR ALL USING (true) WITH CHECK (true); 