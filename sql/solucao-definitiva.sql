-- SOLUÇÃO DEFINITIVA - Recriar tabela users do zero
-- Execute este script no SQL Editor do Supabase

-- ATENÇÃO: Este script vai apagar a tabela users e recriar
-- Se você tem dados importantes, faça backup primeiro

-- 1. Fazer backup dos dados existentes (opcional)
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM public.users;

-- 2. Remover todas as dependências
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
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;

-- 6. Remover a tabela
DROP TABLE IF EXISTS public.users;

-- 7. Recriar a tabela do zero com estrutura limpa
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    whatsapp_number TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Adicionar constraints uma por vez
ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.users ADD CONSTRAINT users_username_unique 
  UNIQUE (username);

-- 9. Criar índices
CREATE INDEX users_username_idx ON public.users(username);
CREATE INDEX users_email_idx ON public.users(email);

-- 10. Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 11. Criar políticas seguras
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 12. Dar permissões
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 13. Verificar se foi criada corretamente
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
    policyname,
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

-- 14. Teste de inserção (opcional)
/*
-- Teste com um usuário existente
INSERT INTO public.users (
    id,
    email,
    username,
    whatsapp_number,
    is_active,
    created_at
) VALUES (
    '066db407-752b-4b52-8e96-8158820e4ec3',
    'demo@catalogozap.com',
    'teste-catalogo',
    '5511999999999',
    true,
    NOW()
);

-- Verificar se foi inserido
SELECT * FROM public.users WHERE username = 'teste-catalogo';

-- Limpar teste
DELETE FROM public.users WHERE username = 'teste-catalogo';
*/

SELECT '=== TABELA RECRIADA COM SUCESSO ===' as info; 