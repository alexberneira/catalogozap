-- Verificar status atual do usuário no banco de dados
-- Execute este script para ver se o webhook realmente desativou o usuário

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

-- Verificar também se há outros usuários com o mesmo customer_id
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
   AND stripe_customer_id != ''
ORDER BY created_at DESC; 