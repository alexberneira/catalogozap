-- TESTE DE INSERÇÃO - Identificar problema específico
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há usuários no auth.users para testar
SELECT 'Usuários disponíveis para teste:' as info;
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;

-- 2. Teste de inserção com um usuário existente (substitua o ID)
-- Descomente e substitua o ID por um usuário real do auth.users

/*
-- Teste 1: Inserção básica
INSERT INTO public.users (
    id,
    email,
    username,
    whatsapp_number,
    is_active,
    created_at
) VALUES (
    'SUBSTITUA_PELO_ID_REAL',  -- Substitua por um ID real do auth.users
    'teste@exemplo.com',
    'teste-catalogo',
    '5511999999999',
    true,
    NOW()
);

-- Verificar se foi inserido
SELECT * FROM public.users WHERE username = 'teste-catalogo';

-- Limpar teste
DELETE FROM public.users WHERE username = 'teste-catalogo';
*/

-- 3. Verificar se há algum trigger ou função interferindo
SELECT 'Triggers na tabela users:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 4. Verificar se há alguma função relacionada
SELECT 'Funções relacionadas:' as info;
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' OR routine_name LIKE '%auth%';

-- 5. Teste de permissões
SELECT 'Permissões da tabela users:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'users' AND table_schema = 'public';

-- 6. Verificar se há algum erro específico
SELECT 'Verificando se há erros de constraint:' as info;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass; 