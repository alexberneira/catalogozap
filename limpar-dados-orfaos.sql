-- Limpar dados órfãos que estão causando conflito
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários órfãos no auth.users (sem correspondência na tabela users)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 2. Remover usuários órfãos do auth.users (só os que não têm perfil na tabela users)
DELETE FROM auth.users 
WHERE id IN (
    SELECT au.id
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id
    WHERE u.id IS NULL
);

-- 3. Verificar se ainda há conflitos
SELECT 
    u.id,
    u.email as users_email,
    u.username,
    au.email as auth_email
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NOT NULL;

-- 4. Verificar usuários órfãos na tabela users (sem correspondência no auth.users)
SELECT 
    u.id,
    u.email,
    u.username,
    u.created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- 5. Remover usuários órfãos da tabela users (só os que não têm conta no auth.users)
DELETE FROM users 
WHERE id IN (
    SELECT u.id
    FROM users u
    LEFT JOIN auth.users au ON u.id = u.id
    WHERE au.id IS NULL
); 