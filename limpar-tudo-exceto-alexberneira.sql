-- LIMPAR TODOS OS USUÁRIOS EXCETO alexberneira@gmail.com
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos identificar o ID do usuário alexberneira@gmail.com
SELECT 
    id,
    email,
    username,
    created_at
FROM users 
WHERE email = 'alexberneira@gmail.com';

-- 2. Verificar se existe no auth.users
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email = 'alexberneira@gmail.com';

-- 3. Fazer backup dos dados do alexberneira@gmail.com
-- (vamos usar o ID que encontramos acima)

-- 4. Remover todos os usuários da tabela users EXCETO alexberneira@gmail.com
DELETE FROM users 
WHERE email != 'alexberneira@gmail.com';

-- 5. Remover todos os usuários do auth.users EXCETO alexberneira@gmail.com
DELETE FROM auth.users 
WHERE email != 'alexberneira@gmail.com';

-- 6. Limpar dados relacionados (produtos, analytics, etc.)
-- Remover produtos de outros usuários
DELETE FROM products 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE email = 'alexberneira@gmail.com'
);

-- Remover visualizações de outros usuários
DELETE FROM catalog_views 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE email = 'alexberneira@gmail.com'
);

-- 7. Verificar o resultado final
SELECT 
    'users' as tabela,
    COUNT(*) as total
FROM users
UNION ALL
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
    'products' as tabela,
    COUNT(*) as total
FROM products
UNION ALL
SELECT 
    'catalog_views' as tabela,
    COUNT(*) as total
FROM catalog_views;

-- 8. Verificar dados do usuário restante
SELECT 
    u.id,
    u.email,
    u.username,
    u.whatsapp_number,
    u.is_active,
    u.created_at,
    au.raw_user_meta_data
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'alexberneira@gmail.com'; 