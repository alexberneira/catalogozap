-- RECRIAR TABELA USERS DO ZERO
-- Execute este script no SQL Editor do Supabase

-- ATENÇÃO: Este script vai apagar a tabela users e recriar
-- Execute apenas se você não tiver dados importantes na tabela

-- 1. Fazer backup dos dados existentes (opcional)
-- CREATE TABLE users_backup AS SELECT * FROM public.users;

-- 2. Remover dependências
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 3. Remover triggers
DROP TRIGGER IF EXISTS handle_new_user ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;

-- 4. Remover funções relacionadas
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.on_auth_user_created();

-- 5. Remover constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 6. Remover a tabela
DROP TABLE IF EXISTS public.users;

-- 7. Recriar a tabela do zero
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar índices
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- 9. Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas seguras
-- Política para SELECT (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política para UPDATE (usuários só atualizam seus próprios dados)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para INSERT (permitir cadastro)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 11. Dar permissões
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 12. Verificar se foi criada corretamente
SELECT '=== VERIFICAÇÃO ===' as info;

-- Verificar estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users';

-- Verificar constraints
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

SELECT '=== TABELA RECRIADA COM SUCESSO ===' as info; 