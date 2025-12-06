-- Migração: Sistema de Drip Content e Produtos Ocultos
-- Execute este SQL no Supabase SQL Editor

-- 1. Adiciona campos nas tabelas existentes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER DEFAULT 0;

ALTER TABLE modules
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER DEFAULT 0;

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER DEFAULT 0;

-- 2. Cria tabela para rastrear quando o usuário ganhou acesso ao produto
CREATE TABLE IF NOT EXISTS user_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 3. Cria índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_product_access_user_id ON user_product_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_access_product_id ON user_product_access(product_id);
CREATE INDEX IF NOT EXISTS idx_user_product_access_granted_at ON user_product_access(granted_at);
CREATE INDEX IF NOT EXISTS idx_products_webhook_secret ON products(webhook_secret);

-- 4. Popula a tabela user_product_access com os dados existentes
-- IMPORTANTE: Só insere produtos que realmente existem na tabela products
INSERT INTO user_product_access (user_id, product_id, granted_at)
SELECT DISTINCT
  u.id,
  p.id,
  NOW()
FROM users u
CROSS JOIN LATERAL unnest(u.product_ids::uuid[]) AS product_id
INNER JOIN products p ON p.id = product_id
WHERE u.product_ids IS NOT NULL
  AND array_length(u.product_ids, 1) > 0
ON CONFLICT (user_id, product_id) DO NOTHING;

-- 5. Comentários para documentação
COMMENT ON COLUMN products.is_hidden IS 'Se true, o produto não aparece nas recomendações da home (apenas para quem já comprou)';
COMMENT ON COLUMN products.unlock_after_days IS 'Número de dias após a compra para liberar o produto (0 = imediato)';
COMMENT ON COLUMN modules.unlock_after_days IS 'Número de dias após a compra do produto para liberar o módulo (0 = imediato)';
COMMENT ON COLUMN lessons.unlock_after_days IS 'Número de dias após a compra do produto para liberar a aula (0 = imediato)';
COMMENT ON TABLE user_product_access IS 'Rastreia quando cada usuário ganhou acesso a cada produto (para liberação progressiva)';

-- 6. Verifica quantos registros foram inseridos
SELECT
  COUNT(*) as total_acessos_registrados,
  COUNT(DISTINCT user_id) as usuarios_com_acesso,
  COUNT(DISTINCT product_id) as produtos_com_usuarios
FROM user_product_access;

