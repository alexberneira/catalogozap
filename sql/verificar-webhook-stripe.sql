-- Script para verificar se o webhook está funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário que você testou
SELECT 
    id,
    email,
    username,
    is_active,
    stripe_customer_id,
    stripe_subscription_id,
    created_at,
    updated_at
FROM users 
WHERE email = 'alexberneira@outlook.com'  -- Substitua pelo email do usuário testado
ORDER BY created_at DESC;

-- 2. Verificar se há outros usuários com o mesmo customer_id
SELECT 
    id,
    email,
    username,
    is_active,
    stripe_customer_id,
    stripe_subscription_id
FROM users 
WHERE stripe_customer_id = 'cus_SaVboRXicyQIhv'  -- Substitua pelo customer_id do usuário
ORDER BY created_at DESC;

-- 3. Verificar se há usuários com subscription_id que pode estar causando conflito
SELECT 
    id,
    email,
    username,
    is_active,
    stripe_customer_id,
    stripe_subscription_id
FROM users 
WHERE stripe_subscription_id IS NOT NULL
ORDER BY created_at DESC;

-- 4. Verificar se há usuários ativos que deveriam estar inativos
SELECT 
    id,
    email,
    username,
    is_active,
    stripe_customer_id,
    stripe_subscription_id
FROM users 
WHERE is_active = true
ORDER BY created_at DESC;

-- 5. Verificar se há usuários inativos que deveriam estar ativos
SELECT 
    id,
    email,
    username,
    is_active,
    stripe_customer_id,
    stripe_subscription_id
FROM users 
WHERE is_active = false
ORDER BY created_at DESC;

-- 6. Verificar se há duplicatas de customer_id
SELECT 
    stripe_customer_id,
    COUNT(*) as total_usuarios
FROM users 
WHERE stripe_customer_id IS NOT NULL
GROUP BY stripe_customer_id
HAVING COUNT(*) > 1
ORDER BY total_usuarios DESC;

-- 7. Verificar se há duplicatas de subscription_id
SELECT 
    stripe_subscription_id,
    COUNT(*) as total_usuarios
FROM users 
WHERE stripe_subscription_id IS NOT NULL
GROUP BY stripe_subscription_id
HAVING COUNT(*) > 1
ORDER BY total_usuarios DESC; 