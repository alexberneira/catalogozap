-- ANÁLISE COMPLETA DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase para investigar o problema

-- 1. VERIFICAR ESTRUTURA DA TABELA USERS
SELECT '=== ESTRUTURA DA TABELA USERS ===' as info;

-- Verificar se a tabela existe
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Verificar colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINTS
SELECT '=== CONSTRAINTS DA TABELA USERS ===' as info;

-- Verificar todas as constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
ORDER BY contype, conname;

-- 3. VERIFICAR RLS E POLÍTICAS
SELECT '=== RLS E POLÍTICAS ===' as info;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESABILITADO' END as status_rls
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- 4. VERIFICAR PERMISSÕES
SELECT '=== PERMISSÕES DA TABELA ===' as info;

-- Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable,
    CASE 
        WHEN grantee = 'postgres' THEN 'SUPERUSER'
        WHEN grantee = 'authenticated' THEN 'USUÁRIOS AUTENTICADOS'
        WHEN grantee = 'anon' THEN 'USUÁRIOS ANÔNIMOS'
        WHEN grantee = 'service_role' THEN 'SERVICE ROLE'
        ELSE grantee
    END as role_description
FROM information_schema.table_privileges 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 5. VERIFICAR TRIGGERS
SELECT '=== TRIGGERS ===' as info;

-- Verificar triggers na tabela
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'users'
ORDER BY trigger_name;

-- 6. VERIFICAR FUNÇÕES RELACIONADAS
SELECT '=== FUNÇÕES RELACIONADAS ===' as info;

-- Verificar funções que podem estar relacionadas
SELECT 
    routine_name,
    routine_type,
    security_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' 
   OR routine_name LIKE '%auth%'
   OR routine_name LIKE '%insert%'
   OR routine_name LIKE '%create%'
ORDER BY routine_name;

-- 7. VERIFICAR ÍNDICES
SELECT '=== ÍNDICES ===' as info;

-- Verificar índices da tabela
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY indexname;

-- 8. VERIFICAR DADOS EXISTENTES
SELECT '=== DADOS EXISTENTES ===' as info;

-- Contar registros
SELECT COUNT(*) as total_usuarios FROM public.users;

-- Mostrar alguns registros
SELECT 
    id,
    email,
    username,
    is_active,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. VERIFICAR SEQUENCES
SELECT '=== SEQUENCES ===' as info;

-- Verificar sequences relacionadas
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public' 
  AND (sequence_name LIKE '%user%' OR sequence_name LIKE '%id%')
ORDER BY sequence_name;

-- 10. TESTE DE INSERÇÃO MANUAL
SELECT '=== TESTE DE INSERÇÃO MANUAL ===' as info;

-- Verificar se há usuários no auth.users para testar
SELECT 
    'Usuários disponíveis no auth.users:' as info,
    COUNT(*) as total
FROM auth.users;

-- Mostrar alguns usuários do auth.users
SELECT 
    id,
    email,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO'
        ELSE 'NÃO CONFIRMADO'
    END as status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

SELECT '=== ANÁLISE CONCLUÍDA ===' as info; 