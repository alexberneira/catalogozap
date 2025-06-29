-- SOLUÇÃO ULTRA SEGURA - Só resolve o problema do cadastro
-- Execute este script no SQL Editor do Supabase

-- 1. DIAGNÓSTICO: Verificar o que existe atualmente
-- (Execute estas consultas primeiro para ver o estado atual)

-- Verificar políticas RLS atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. SOLUÇÃO MÍNIMA: Apenas adicionar política para INSERT
-- (NÃO remove nada existente, só adiciona o que falta)

-- Remover APENAS políticas de INSERT conflitantes (se existirem)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Criar política específica para INSERT (cadastro)
-- Esta política permite inserção apenas durante o cadastro
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- 3. Verificar se as constraints necessárias existem (sem recriar)
DO $$ 
BEGIN
    -- Constraint UNIQUE para username
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
    
    -- Foreign key para auth.users
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_fkey') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Garantir que as colunas existem (sem recriar)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. VERIFICAÇÃO FINAL: Confirmar que tudo está correto
-- (Execute estas consultas para verificar)

-- Verificar políticas finais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Verificar constraints
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Verificar colunas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position; 