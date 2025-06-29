-- Verificar dados de usuários para debug do webhook
-- Execute este script para verificar se há dados inconsistentes

-- 1. Verificar todos os usuários com dados do Stripe
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
WHERE stripe_customer_id IS NOT NULL 
   OR stripe_subscription_id IS NOT NULL
ORDER BY created_at DESC;

-- 2. Verificar usuários ativos (premium)
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

-- 3. Verificar usuários inativos (free)
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at
FROM users 
WHERE is_active = false
ORDER BY created_at DESC;

-- 4. Verificar usuários com customer_id mas sem subscription_id
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

-- 5. Verificar usuários com subscription_id mas sem customer_id
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

-- 6. Contar usuários por status
SELECT 
    is_active,
    COUNT(*) as total,
    COUNT(stripe_customer_id) as com_customer_id,
    COUNT(stripe_subscription_id) as com_subscription_id
FROM users 
GROUP BY is_active;

-- 7. Verificar usuários criados recentemente (últimas 24h)
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