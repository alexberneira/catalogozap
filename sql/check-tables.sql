-- Script para verificar a estrutura das tabelas existentes
-- Execute este script no SQL Editor do Supabase

-- Verificar estrutura da tabela User
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela Post
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Post'
ORDER BY ordinal_position;

-- Verificar dados existentes na tabela User
SELECT * FROM "User" LIMIT 5;

-- Verificar dados existentes na tabela Post
SELECT * FROM "Post" LIMIT 5; 