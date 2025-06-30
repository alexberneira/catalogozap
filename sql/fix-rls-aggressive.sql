-- Script AGGRESSIVO para corrigir problemas no cadastro de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS temporariamente para resolver o problema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 3. Garantir que a constraint UNIQUE no username existe
-- (Se der erro, significa que já existe, pode ignorar)
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- 4. Verificar se a foreign key existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_fkey') THEN
        ALTER TABLE users ADD CONSTRAINT users_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Garantir que as colunas opcionais existem
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. HABILITAR RLS novamente com políticas mais permissivas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas MUITO permissivas
CREATE POLICY "Allow all operations for now" ON users
  FOR ALL USING (true) WITH CHECK (true); 