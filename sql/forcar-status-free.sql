-- Forçar status do usuário como free
-- Execute este script para garantir que o usuário está marcado como inativo

UPDATE users 
SET 
    is_active = false,
    stripe_subscription_id = NULL,
    stripe_customer_id = NULL
WHERE email = 'alexberneira@outlook.com' 
   OR username = 'alexberneira';

-- Verificar o resultado
SELECT 
    id,
    email,
    username,
    stripe_customer_id,
    stripe_subscription_id,
    is_active,
    created_at
FROM users 
WHERE email = 'alexberneira@outlook.com' 
   OR username = 'alexberneira'
ORDER BY created_at DESC; 