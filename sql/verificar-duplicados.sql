-- Verificar dados duplicados na tabela users
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os usuários na tabela users
SELECT 
    id,
    email,
    username,
    created_at,
    is_active
FROM users 
ORDER BY created_at DESC;

-- 2. Verificar se há IDs duplicados
SELECT 
    id,
    COUNT(*) as total
FROM users 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 3. Verificar usuários no auth.users
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 4. Verificar se há conflitos entre auth.users e users
SELECT 
    u.id,
    u.email as users_email,
    u.username,
    au.email as auth_email,
    au.raw_user_meta_data
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NOT NULL;

-- 5. Verificar usuários órfãos (só em auth.users)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 6. Verificar usuários órfãos (só em users)
SELECT 
    u.id,
    u.email,
    u.username,
    u.created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL; 