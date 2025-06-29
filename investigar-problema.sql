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

-- Investigar problema do webhook não encontrar usuários
-- Execute este script para entender por que o status não está sendo atualizado

-- 1. Verificar todos os usuários e seus dados do Stripe
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at,
    updated_at
FROM users 
ORDER BY created_at DESC;

-- 2. Verificar se há usuários com customer_id
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(stripe_customer_id) as com_customer_id,
    COUNT(stripe_subscription_id) as com_subscription_id,
    COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inativos
FROM users;

-- 3. Verificar usuários premium (ativos)
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at
FROM users 
WHERE is_active = true
ORDER BY created_at DESC;

-- 4. Verificar usuários que fizeram pagamento mas não têm customer_id
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at
FROM users 
WHERE stripe_subscription_id IS NOT NULL 
  AND stripe_customer_id IS NULL
ORDER BY created_at DESC;

-- 5. Verificar usuários com customer_id mas sem subscription_id
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at
FROM users 
WHERE stripe_customer_id IS NOT NULL 
  AND stripe_subscription_id IS NULL
ORDER BY created_at DESC;

-- 6. Verificar usuários criados nas últimas 24h
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at
FROM users 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 7. Verificar se há dados inconsistentes
SELECT 
    'Usuários com subscription_id mas sem customer_id' as problema,
    COUNT(*) as quantidade
FROM users 
WHERE stripe_subscription_id IS NOT NULL 
  AND stripe_customer_id IS NULL

UNION ALL

SELECT 
    'Usuários com customer_id mas sem subscription_id' as problema,
    COUNT(*) as quantidade
FROM users 
WHERE stripe_customer_id IS NOT NULL 
  AND stripe_subscription_id IS NULL

UNION ALL

SELECT 
    'Usuários ativos sem dados do Stripe' as problema,
    COUNT(*) as quantidade
FROM users 
WHERE is_active = true 
  AND stripe_customer_id IS NULL 
  AND stripe_subscription_id IS NULL; 