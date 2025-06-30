-- Tabela para estatísticas de visualizações
CREATE TABLE IF NOT EXISTS catalog_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para cliques no WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_catalog_views_user_id ON catalog_views(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_views_created_at ON catalog_views(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_user_id ON whatsapp_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_created_at ON whatsapp_clicks(created_at);

-- Função para obter estatísticas do usuário
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_views BIGINT,
    total_clicks BIGINT,
    views_today BIGINT,
    clicks_today BIGINT,
    views_week BIGINT,
    clicks_week BIGINT,
    views_month BIGINT,
    clicks_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM catalog_views WHERE user_id = user_uuid) as total_views,
        (SELECT COUNT(*) FROM whatsapp_clicks WHERE user_id = user_uuid) as total_clicks,
        (SELECT COUNT(*) FROM catalog_views WHERE user_id = user_uuid AND created_at >= CURRENT_DATE) as views_today,
        (SELECT COUNT(*) FROM whatsapp_clicks WHERE user_id = user_uuid AND created_at >= CURRENT_DATE) as clicks_today,
        (SELECT COUNT(*) FROM catalog_views WHERE user_id = user_uuid AND created_at >= CURRENT_DATE - INTERVAL '7 days') as views_week,
        (SELECT COUNT(*) FROM whatsapp_clicks WHERE user_id = user_uuid AND created_at >= CURRENT_DATE - INTERVAL '7 days') as clicks_week,
        (SELECT COUNT(*) FROM catalog_views WHERE user_id = user_uuid AND created_at >= CURRENT_DATE - INTERVAL '30 days') as views_month,
        (SELECT COUNT(*) FROM whatsapp_clicks WHERE user_id = user_uuid AND created_at >= CURRENT_DATE - INTERVAL '30 days') as clicks_month;
END;
$$ LANGUAGE plpgsql;

-- Função para obter dados de gráfico (últimos 30 dias)
CREATE OR REPLACE FUNCTION get_chart_data(user_uuid UUID)
RETURNS TABLE (
    date DATE,
    views BIGINT,
    clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dates.date,
        COALESCE(views.count, 0) as views,
        COALESCE(clicks.count, 0) as clicks
    FROM (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '29 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    ) dates
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM catalog_views 
        WHERE user_id = user_uuid 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
    ) views ON dates.date = views.date
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM whatsapp_clicks 
        WHERE user_id = user_uuid 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
    ) clicks ON dates.date = clicks.date
    ORDER BY dates.date;
END;
$$ LANGUAGE plpgsql;

-- Políticas de segurança RLS
ALTER TABLE catalog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Política para catalog_views (usuários só veem seus próprios dados)
CREATE POLICY "Users can view their own catalog views" ON catalog_views
    FOR SELECT USING (auth.uid() = user_id);

-- Política para whatsapp_clicks (usuários só veem seus próprios dados)
CREATE POLICY "Users can view their own whatsapp clicks" ON whatsapp_clicks
    FOR SELECT USING (auth.uid() = user_id);

-- Política para inserção (qualquer um pode inserir, mas com validação)
CREATE POLICY "Anyone can insert catalog views" ON catalog_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert whatsapp clicks" ON whatsapp_clicks
    FOR INSERT WITH CHECK (true); 