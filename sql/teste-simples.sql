-- TESTE SIMPLES - Identificar problema do cadastro
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 'Tabela users existe?' as pergunta, 
       CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') 
            THEN 'SIM' ELSE 'NÃO' END as resposta;

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 'RLS habilitado?' as pergunta,
       CASE WHEN rowsecurity THEN 'SIM' ELSE 'NÃO' END as resposta
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 4. Verificar políticas
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Verificar constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- 6. Verificar permissões
SELECT grantee, privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'users' AND table_schema = 'public';

-- 7. Teste de inserção manual (se houver usuários no auth.users)
SELECT 'Usuários no auth.users:' as info, COUNT(*) as total
FROM auth.users;

-- Mostrar alguns usuários se existirem
SELECT id, email, created_at 
FROM auth.users 
LIMIT 3; 