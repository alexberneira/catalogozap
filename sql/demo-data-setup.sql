-- Script para criar dados de exemplo no Supabase
-- Execute este script no SQL Editor do Supabase para resolver o problema RLS

-- Criar função para inserir dados de exemplo
CREATE OR REPLACE FUNCTION create_demo_data()
RETURNS void AS $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Inserir usuário demo (desabilitar RLS temporariamente)
  INSERT INTO users (id, email, username, whatsapp_number, is_active)
  VALUES (
    gen_random_uuid(),
    'demo@catalogozap.com',
    'demo',
    '5511999999999',
    true
  ) RETURNING id INTO demo_user_id;

  -- Inserir produtos de exemplo
  INSERT INTO products (user_id, title, description, image_url, price)
  VALUES 
    (demo_user_id, 'Smartphone Galaxy S23', 'Smartphone Samsung Galaxy S23 com 128GB, tela de 6.1", câmera tripla de 50MP. Perfeito para fotos e jogos.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop', 3499.99),
    (demo_user_id, 'Notebook Dell Inspiron', 'Notebook Dell Inspiron com Intel i5, 8GB RAM, SSD 256GB. Ideal para trabalho e estudos.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', 2899.99),
    (demo_user_id, 'Fone de Ouvido Bluetooth', 'Fone de ouvido sem fio com cancelamento de ruído, bateria de longa duração. Qualidade de som premium.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', 299.99);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função
SELECT create_demo_data(); 