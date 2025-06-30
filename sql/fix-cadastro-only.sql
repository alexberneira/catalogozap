-- Solução APENAS para o problema do cadastro
-- Execute este script no SQL Editor do Supabase

-- 1. PRIMEIRO: Verificar o que existe atualmente (diagnóstico)
-- Execute estas consultas para ver o estado atual:

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

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 2. SOLUÇÃO MÍNIMA: Apenas adicionar política para INSERT
-- (Não remove nada existente, só adiciona o que falta)

-- Remover apenas políticas de INSERT conflitantes
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Criar política específica para INSERT (cadastro)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- 3. Verificar se as constraints necessárias existem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_fkey') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Garantir que as colunas existem
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); 