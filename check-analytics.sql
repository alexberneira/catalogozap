-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('catalog_views', 'whatsapp_clicks');

-- Verificar se há dados nas tabelas
SELECT 
    'catalog_views' as tabela,
    COUNT(*) as total_registros
FROM catalog_views
UNION ALL
SELECT 
    'whatsapp_clicks' as tabela,
    COUNT(*) as total_registros
FROM whatsapp_clicks;

-- Verificar políticas RLS
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