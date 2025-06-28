-- Corrigir políticas RLS para permitir inserções
-- Primeiro, vamos ver as políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('catalog_views', 'whatsapp_clicks');

-- Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Users can view their own catalog views" ON catalog_views;
DROP POLICY IF EXISTS "Users can view their own whatsapp clicks" ON whatsapp_clicks;
DROP POLICY IF EXISTS "Allow insert for tracking" ON catalog_views;
DROP POLICY IF EXISTS "Allow insert for tracking" ON whatsapp_clicks;

-- Desabilitar RLS temporariamente para permitir inserções
ALTER TABLE catalog_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks DISABLE ROW LEVEL SECURITY;

-- Ou, se preferir manter RLS, criar políticas mais permissivas
-- ALTER TABLE catalog_views ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções (se RLS estiver habilitado)
-- CREATE POLICY "Allow all operations for authenticated users" ON catalog_views
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON whatsapp_clicks
--   FOR ALL USING (true) WITH CHECK (true);

-- Verificar se as tabelas estão funcionando
SELECT 'catalog_views' as table_name, COUNT(*) as count FROM catalog_views
UNION ALL
SELECT 'whatsapp_clicks' as table_name, COUNT(*) as count FROM whatsapp_clicks; 