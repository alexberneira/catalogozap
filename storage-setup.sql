-- Configuração do Storage para imagens de produtos
-- Execute estas instruções no painel do Supabase

-- 1. Vá em "Storage" no menu lateral do Supabase
-- 2. Clique em "New bucket"
-- 3. Configure o bucket:
--    - Name: product-images
--    - Public bucket: ✅ (marcado)
--    - File size limit: 5MB (ou o valor que preferir)
--    - Allowed MIME types: image/*

-- 4. Após criar o bucket, configure as políticas RLS:

-- Política para permitir upload de imagens (apenas usuários autenticados)
CREATE POLICY "Users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.uid() IS NOT NULL
  );

-- Política para permitir visualização pública das imagens
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND 
    auth.uid() IS NOT NULL
  );

-- Política para permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND 
    auth.uid() IS NOT NULL
  ); 