-- DESABILITAR O TRIGGER QUE ESTÁ CAUSANDO CONFLITOS
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar o trigger on_auth_user_created
ALTER TABLE users DISABLE TRIGGER on_auth_user_created;

-- 2. Verificar se foi desabilitado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 3. Verificar o status do trigger
SELECT 
    tgname,
    tgrelid::regclass,
    tgfoid::regproc,
    tgtype,
    tgenabled,
    tgisinternal
FROM pg_trigger 
WHERE tgrelid = 'users'::regclass;

-- 4. Teste: tentar inserir um usuário manualmente para verificar
-- (não execute esta parte ainda, só para verificar se o trigger está desabilitado) 