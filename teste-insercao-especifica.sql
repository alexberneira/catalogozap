-- TESTE DE INSERÇÃO ESPECÍFICA
-- Execute este script para testar inserções e identificar o problema

-- 1. VERIFICAR USUÁRIO DE TESTE NO AUTH
SELECT '=== VERIFICANDO USUÁRIO DE TESTE ===' as info;

-- Verificar se existe um usuário de teste no auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO'
        ELSE 'NÃO CONFIRMADO'
    END as status
FROM auth.users 
WHERE email LIKE '%teste%' OR email LIKE '%exemplo%'
ORDER BY created_at DESC 
LIMIT 5;

-- 2. TESTE DE INSERÇÃO COM DADOS FIXOS
SELECT '=== TESTE DE INSERÇÃO COM DADOS FIXOS ===' as info;

-- Tentar inserir um usuário com dados fixos
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'teste-insercao-' || extract(epoch from now())::text || '@exemplo.com';
    test_username TEXT := 'teste-' || extract(epoch from now())::text;
    insert_result RECORD;
BEGIN
    RAISE NOTICE 'Tentando inserir usuário: %', test_user_id;
    RAISE NOTICE 'Email: %', test_email;
    RAISE NOTICE 'Username: %', test_username;
    
    -- Tentar inserção
    INSERT INTO public.users (
        id,
        email,
        username,
        whatsapp_number,
        is_active,
        created_at
    ) VALUES (
        test_user_id,
        test_email,
        test_username,
        '5511999999999',
        true,
        now()
    ) RETURNING * INTO insert_result;
    
    RAISE NOTICE '✅ Inserção bem-sucedida!';
    RAISE NOTICE 'Dados inseridos: %', insert_result;
    
    -- Verificar se foi realmente inserido
    PERFORM COUNT(*) FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'Verificação: Usuário encontrado na tabela';
    
    -- Limpar dados de teste
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE '🗑️ Dados de teste removidos';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na inserção: %', SQLERRM;
        RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;

-- 3. TESTE DE INSERÇÃO COM USUÁRIO AUTH EXISTENTE
SELECT '=== TESTE COM USUÁRIO AUTH EXISTENTE ===' as info;

-- Pegar um usuário existente do auth.users para teste
DO $$
DECLARE
    auth_user RECORD;
    insert_result RECORD;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id, email INTO auth_user 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
    LIMIT 1;
    
    IF auth_user.id IS NULL THEN
        RAISE NOTICE '❌ Nenhum usuário confirmado encontrado no auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usando usuário auth: %', auth_user.id;
    RAISE NOTICE 'Email: %', auth_user.email;
    
    -- Verificar se já existe na tabela users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
        RAISE NOTICE '⚠️ Usuário já existe na tabela users';
        RETURN;
    END IF;
    
    -- Tentar inserção
    INSERT INTO public.users (
        id,
        email,
        username,
        whatsapp_number,
        is_active,
        created_at
    ) VALUES (
        auth_user.id,
        auth_user.email,
        'teste-' || extract(epoch from now())::text,
        '5511999999999',
        true,
        now()
    ) RETURNING * INTO insert_result;
    
    RAISE NOTICE '✅ Inserção bem-sucedida!';
    RAISE NOTICE 'Dados inseridos: %', insert_result;
    
    -- Limpar dados de teste
    DELETE FROM public.users WHERE id = auth_user.id;
    RAISE NOTICE '🗑️ Dados de teste removidos';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na inserção: %', SQLERRM;
        RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;

-- 4. TESTE DE PERMISSÕES
SELECT '=== TESTE DE PERMISSÕES ===' as info;

-- Verificar permissões atuais do usuário
SELECT 
    current_user as usuario_atual,
    session_user as sessao_usuario,
    current_database() as banco_atual,
    current_schema as schema_atual;

-- Verificar se o usuário atual pode inserir
SELECT 
    has_table_privilege(current_user, 'public.users', 'INSERT') as pode_inserir,
    has_table_privilege(current_user, 'public.users', 'SELECT') as pode_selecionar,
    has_table_privilege(current_user, 'public.users', 'UPDATE') as pode_atualizar,
    has_table_privilege(current_user, 'public.users', 'DELETE') as pode_deletar;

-- 5. TESTE DE RLS
SELECT '=== TESTE DE RLS ===' as info;

-- Verificar se RLS está bloqueando
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Verificar se RLS está habilitado
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE tablename = 'users' AND schemaname = 'public';
    
    RAISE NOTICE 'RLS habilitado: %', rls_enabled;
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'users';
    
    RAISE NOTICE 'Número de políticas: %', policy_count;
    
    -- Listar políticas
    FOR policy IN 
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'users'
        ORDER BY cmd, policyname
    LOOP
        RAISE NOTICE 'Política: % - Comando: %', policy.policyname, policy.cmd;
        IF policy.qual IS NOT NULL THEN
            RAISE NOTICE '  Using: %', policy.qual;
        END IF;
        IF policy.with_check IS NOT NULL THEN
            RAISE NOTICE '  Check: %', policy.with_check;
        END IF;
    END LOOP;
END $$;

SELECT '=== TESTES CONCLUÍDOS ===' as info; 