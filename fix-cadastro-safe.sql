-- Solução SEGURA para corrigir apenas o problema do cadastro
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há algum trigger automático que pode estar causando problema
-- (Só remove se existir e estiver causando conflito)
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- 2. Verificar se há alguma função que pode estar causando problema
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' OR routine_name LIKE '%auth%';

-- 3. Verificar as políticas RLS atuais
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

-- 4. Criar uma política específica para cadastro (mais segura)
-- Primeiro, remover apenas políticas conflitantes
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- 5. Criar política específica para inserção durante cadastro
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- 6. Manter políticas existentes para outras operações
-- (Não remover as políticas de SELECT e UPDATE se existirem)

-- 7. Verificar se a constraint UNIQUE existe (sem recriar se já existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
END $$;

-- 8. Verificar se a foreign key existe (sem recriar se já existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_fkey') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 9. Garantir que as colunas opcionais existem
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); 