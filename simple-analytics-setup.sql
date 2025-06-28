-- Tabela para estatísticas de visualizações
CREATE TABLE IF NOT EXISTS catalog_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para cliques no WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_catalog_views_user_id ON catalog_views(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_views_created_at ON catalog_views(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_user_id ON whatsapp_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_created_at ON whatsapp_clicks(created_at);

-- Políticas de segurança RLS
ALTER TABLE catalog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Política para catalog_views (usuários só veem seus próprios dados)
DROP POLICY IF EXISTS "Users can view their own catalog views" ON catalog_views;
CREATE POLICY "Users can view their own catalog views" ON catalog_views
    FOR SELECT USING (auth.uid() = user_id);

-- Política para whatsapp_clicks (usuários só veem seus próprios dados)
DROP POLICY IF EXISTS "Users can view their own whatsapp clicks" ON whatsapp_clicks;
CREATE POLICY "Users can view their own whatsapp clicks" ON whatsapp_clicks
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção (qualquer um pode inserir, mas com validação)
DROP POLICY IF EXISTS "Anyone can insert catalog views" ON catalog_views;
CREATE POLICY "Anyone can insert catalog views" ON catalog_views
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert whatsapp clicks" ON whatsapp_clicks;
CREATE POLICY "Anyone can insert whatsapp clicks" ON whatsapp_clicks
    FOR INSERT WITH CHECK (true); 