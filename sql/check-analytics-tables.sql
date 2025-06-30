-- Verificar se as tabelas de analytics existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('catalog_views', 'whatsapp_clicks') THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('catalog_views', 'whatsapp_clicks');

-- Se as tabelas não existem, criá-las
CREATE TABLE IF NOT EXISTS catalog_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_catalog_views_user_id ON catalog_views(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_views_created_at ON catalog_views(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_user_id ON whatsapp_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_product_id ON whatsapp_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_created_at ON whatsapp_clicks(created_at);

-- Verificar se as políticas RLS existem
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

-- Criar políticas RLS se não existirem
ALTER TABLE catalog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Política para catalog_views - usuários podem ver apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view their own catalog views" ON catalog_views;
CREATE POLICY "Users can view their own catalog views" ON catalog_views
  FOR SELECT USING (auth.uid() = user_id);

-- Política para whatsapp_clicks - usuários podem ver apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view their own whatsapp clicks" ON whatsapp_clicks;
CREATE POLICY "Users can view their own whatsapp clicks" ON whatsapp_clicks
  FOR SELECT USING (auth.uid() = user_id);

-- Permitir inserção de dados (para tracking)
DROP POLICY IF EXISTS "Allow insert for tracking" ON catalog_views;
CREATE POLICY "Allow insert for tracking" ON catalog_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for tracking" ON whatsapp_clicks;
CREATE POLICY "Allow insert for tracking" ON whatsapp_clicks
  FOR INSERT WITH CHECK (true);

-- Verificar dados existentes
SELECT 'catalog_views' as table_name, COUNT(*) as count FROM catalog_views
UNION ALL
SELECT 'whatsapp_clicks' as table_name, COUNT(*) as count FROM whatsapp_clicks; 