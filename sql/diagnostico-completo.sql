-- DIAGNÓSTICO COMPLETO - Identificar o problema do cadastro
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR ESTRUTURA DA TABELA
SELECT '=== ESTRUTURA DA TABELA ===' as info;

-- Verificar se a tabela existe
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Verificar colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR RLS E POLÍTICAS
SELECT '=== RLS E POLÍTICAS ===' as info;

-- Verificar se RLS está habilitado
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
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 3. VERIFICAR CONSTRAINTS
SELECT '=== CONSTRAINTS ===' as info;

-- Verificar constraints
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 4. VERIFICAR PERMISSÕES
SELECT '=== PERMISSÕES ===' as info;

-- Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'users' AND table_schema = 'public';

-- 5. VERIFICAR TRIGGERS
SELECT '=== TRIGGERS ===' as info;

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 6. VERIFICAR FUNÇÕES
SELECT '=== FUNÇÕES ===' as info;

-- Verificar funções relacionadas
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' OR routine_name LIKE '%auth%';

-- 7. TESTE DE INSERÇÃO MANUAL
SELECT '=== TESTE DE INSERÇÃO ===' as info;

-- Verificar se há usuários no auth.users
SELECT id, email, created_at 
FROM auth.users 
LIMIT 3;

-- 8. VERIFICAR SEQUENCES
SELECT '=== SEQUENCES ===' as info;

-- Verificar sequences relacionadas
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value
FROM information_schema.sequences 
WHERE sequence_schema = 'public' AND sequence_name LIKE '%user%';

SELECT '=== DIAGNÓSTICO CONCLUÍDO ===' as info; 