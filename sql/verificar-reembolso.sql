-- Script para verificar status da assinatura após reembolso
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados do usuário no banco
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
WHERE email = 'teste@teste.com'  -- Substitua pelo email do usuário testado
ORDER BY created_at DESC;

-- 2. Verificar se há webhooks do Stripe registrados
SELECT 
    event_type,
    created_at,
    data
FROM stripe_webhooks 
WHERE event_type IN ('invoice.payment_refunded', 'customer.subscription.updated', 'customer.subscription.deleted')
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar logs de assinatura (se existir tabela de logs)
-- SELECT * FROM subscription_logs WHERE user_email = 'teste@teste.com' ORDER BY created_at DESC;

-- 4. Verificar se o trigger está funcionando
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%subscription%' OR trigger_name LIKE '%user%';

-- 5. Verificar políticas RLS na tabela users
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