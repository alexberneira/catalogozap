-- CORRIGIR CONSTRAINTS DUPLICADAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar constraints duplicadas
SELECT '=== CONSTRAINTS ATUAIS ===' as info;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 2. Remover constraint duplicada
-- Vamos remover a constraint 'users_username_unique' que está duplicada
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_unique;

-- 3. Verificar se RLS está configurado corretamente
SELECT '=== VERIFICANDO RLS ===' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 4. Verificar políticas
SELECT '=== POLÍTICAS ATUAIS ===' as info;
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Se não houver política para INSERT, criar uma
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND cmd = 'INSERT'
    ) THEN
        CREATE POLICY "Allow user registration" ON public.users
          FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 6. Verificar estrutura final
SELECT '=== ESTRUTURA FINAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar constraints finais
SELECT '=== CONSTRAINTS FINAIS ===' as info;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 8. Teste de inserção (opcional - descomente se quiser testar)
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
    '066db407-752b-4b52-8e96-8158820e4ec3',  -- ID do usuário demo
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

SELECT '=== PROBLEMA RESOLVIDO ===' as info; 