-- CORRIGIR POLÍTICAS RLS PARA CADASTRO
-- Execute este script no SQL Editor do Supabase

-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.users;

-- 2. CRIAR POLÍTICA CORRETA PARA INSERT
CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 3. CRIAR POLÍTICA PARA INSERT ANÔNIMO (durante cadastro)
CREATE POLICY "Enable insert for anonymous users" ON public.users
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- 4. CRIAR POLÍTICA PARA SELECT PÚBLICO
CREATE POLICY "Enable read access for all users" ON public.users
    FOR SELECT 
    TO public
    USING (true);

-- 5. CRIAR POLÍTICA PARA UPDATE DO PRÓPRIO USUÁRIO
CREATE POLICY "Enable update for users based on user_id" ON public.users
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6. CRIAR POLÍTICA PARA DELETE DO PRÓPRIO USUÁRIO
CREATE POLICY "Enable delete for users based on user_id" ON public.users
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = id);

-- 7. VERIFICAR POLÍTICAS CRIADAS
SELECT 
    policyname,
    cmd as command,
    permissive,
    roles,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- 8. TESTE DE INSERÇÃO
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'teste-correcao-' || extract(epoch from now())::text || '@exemplo.com';
    test_username TEXT := 'teste-' || extract(epoch from now())::text;
    insert_result RECORD;
BEGIN
    RAISE NOTICE 'Testando inserção após correção...';
    RAISE NOTICE 'User ID: %', test_user_id;
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
    
    RAISE NOTICE '✅ Inserção bem-sucedida após correção!';
    RAISE NOTICE 'Dados inseridos: %', insert_result;
    
    -- Limpar dados de teste
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE '🗑️ Dados de teste removidos';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na inserção: %', SQLERRM;
        RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;

SELECT '=== CORREÇÃO CONCLUÍDA ===' as info; 