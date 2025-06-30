-- SOLUÇÃO ALTERNATIVA: Função para contornar RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Criar função para inserir usuário (contorna RLS)
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_username TEXT,
    user_whatsapp TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        username,
        whatsapp_number,
        is_active,
        created_at
    ) VALUES (
        user_id,
        user_email,
        user_username,
        user_whatsapp,
        true,
        NOW()
    );
    
    RETURN true;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Username já está em uso';
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Usuário não encontrado no auth.users';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar perfil: %', SQLERRM;
END;
$$;

-- 2. Garantir que as colunas existem
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Verificar se as constraints existem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_fkey') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Dar permissão para a função
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;

-- 5. Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile' AND routine_schema = 'public';

SELECT '=== FUNÇÃO CRIADA COM SUCESSO ===' as info; 