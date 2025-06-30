-- INVESTIGAR A FUNÇÃO DO TRIGGER QUE ESTÁ CAUSANDO PROBLEMAS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar a função handle_new_user
SELECT 
    proname,
    prosrc,
    proargtypes,
    prorettype
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Verificar triggers na tabela users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 4. Desabilitar temporariamente o trigger para teste
-- ALTER TABLE users DISABLE TRIGGER on_auth_user_created;

-- 5. Verificar se há outros triggers
SELECT 
    schemaname,
    tablename,
    triggername,
    tgtype,
    tgenabled
FROM pg_trigger 
WHERE tgrelid = 'users'::regclass;

-- 6. Verificar a definição completa do trigger
SELECT 
    tgname,
    tgrelid::regclass,
    tgfoid::regproc,
    tgtype,
    tgenabled,
    tgisinternal
FROM pg_trigger 
WHERE tgrelid = 'users'::regclass; 