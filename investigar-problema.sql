-- INVESTIGAR PROBLEMA DE CONFLITO DE ID
-- Execute este script no Supabase SQL Editor

-- 1. Verificar exatamente o que está na tabela users
SELECT 
    id,
    email,
    username,
    created_at,
    is_active
FROM users 
ORDER BY created_at;

-- 2. Verificar exatamente o que está no auth.users
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
ORDER BY created_at;

-- 3. Verificar se há algum ID duplicado ou conflitante
SELECT 
    'users' as tabela,
    id,
    email
FROM users
UNION ALL
SELECT 
    'auth.users' as tabela,
    id,
    email
FROM auth.users
ORDER BY id;

-- 4. Verificar se há algum trigger ou função que possa estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 5. Verificar as políticas RLS da tabela users
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

-- 6. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 7. Verificar constraints da tabela users
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass; 