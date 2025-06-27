-- Verificar usuário demo
SELECT * FROM users WHERE username = 'demo';

-- Verificar produtos do usuário demo (substitua o id se necessário)
SELECT * FROM products WHERE user_id = '066db407-752b-4b52-8e96-8158820e4ec3';

-- Contar produtos do usuário demo
SELECT COUNT(*) FROM products WHERE user_id = '066db407-752b-4b52-8e96-8158820e4ec3'; 