-- Script simples para corrigir problemas no cadastro de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- 2. Criar políticas mais permissivas
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 3. Garantir que a constraint UNIQUE no username existe
-- (Se der erro, significa que já existe, pode ignorar)
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username); 