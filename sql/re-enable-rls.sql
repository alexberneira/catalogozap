-- Script para reabilitar RLS depois que o cadastro funcionar
-- Execute este script APÓS testar o cadastro

-- 1. Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas seguras
-- Política para SELECT (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política para UPDATE (usuários só atualizam seus próprios dados)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para INSERT (permitir cadastro)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Verificar se as políticas foram criadas
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

-- 4. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

SELECT '=== RLS REABILITADO COM POLÍTICAS SEGURAS ===' as info; 