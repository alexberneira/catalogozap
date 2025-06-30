-- RESTAURAR DADOS DO BACKUP (se necessário)
-- Execute este script APÓS recriar a tabela se quiser restaurar os dados

-- 1. Verificar se existe backup
SELECT '=== VERIFICANDO BACKUP ===' as info;
SELECT COUNT(*) as total_registros_backup FROM users_backup;

-- 2. Mostrar dados do backup
SELECT id, email, username, created_at FROM users_backup LIMIT 5;

-- 3. Restaurar dados (descomente se quiser restaurar)
/*
-- Restaurar dados do backup
INSERT INTO public.users (
    id,
    email,
    username,
    whatsapp_number,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    username,
    whatsapp_number,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at,
    updated_at
FROM users_backup
ON CONFLICT (id) DO NOTHING;

-- Verificar se foi restaurado
SELECT COUNT(*) as total_registros_restaurados FROM public.users;
*/

-- 4. Limpar backup (opcional)
-- DROP TABLE IF EXISTS users_backup;

SELECT '=== SCRIPT DE RESTAURAÇÃO CONCLUÍDO ===' as info; 