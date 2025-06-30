-- Script de teste para verificar se o cadastro está funcionando
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as políticas RLS estão corretas
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

-- 2. Verificar se a tabela users tem as colunas necessárias
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se as constraints existem
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 4. Testar inserção manual (simular cadastro)
-- ATENÇÃO: Este teste só funciona se você tiver um usuário no auth.users
-- Substitua 'SEU_USER_ID_AQUI' pelo ID de um usuário real do auth.users

-- Primeiro, verificar se há usuários no auth.users
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;

-- Se houver usuários, você pode testar a inserção:
-- (Descomente e substitua o ID se quiser testar)

/*
INSERT INTO public.users (
    id,
    email,
    username,
    whatsapp_number,
    is_active,
    created_at
) VALUES (
    'SEU_USER_ID_AQUI',
    'teste@exemplo.com',
    'teste-catalogo',
    '5511999999999',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verificar se foi inserido
SELECT * FROM public.users WHERE username = 'teste-catalogo';
*/ 