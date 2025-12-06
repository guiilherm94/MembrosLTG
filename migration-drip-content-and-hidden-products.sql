-- Adiciona campo is_hidden para ocultar produtos na home
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Adiciona campo unlock_after_days para liberação progressiva
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER DEFAULT 0;

ALTER TABLE modules
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER DEFAULT 0;

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER DEFAULT 0;

-- Cria tabela para rastrear quando o usuário ganhou acesso ao produto
CREATE TABLE IF NOT EXISTS user_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Cria índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_product_access_user_id ON user_product_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_access_product_id ON user_product_access(product_id);
CREATE INDEX IF NOT EXISTS idx_user_product_access_granted_at ON user_product_access(granted_at);

-- Popula a tabela user_product_access com os dados existentes
-- (para usuários que já têm acesso aos produtos)
INSERT INTO user_product_access (user_id, product_id, granted_at)
SELECT u.id, unnest(u.product_ids)::uuid, NOW()
FROM users u
WHERE u.product_ids IS NOT NULL AND array_length(u.product_ids, 1) > 0
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Comentários para documentação
COMMENT ON COLUMN products.is_hidden IS 'Se true, o produto não aparece nas recomendações da home (apenas para quem já comprou)';
COMMENT ON COLUMN products.unlock_after_days IS 'Número de dias após a compra para liberar o produto (0 = imediato)';
COMMENT ON COLUMN modules.unlock_after_days IS 'Número de dias após a compra do produto para liberar o módulo (0 = imediato)';
COMMENT ON COLUMN lessons.unlock_after_days IS 'Número de dias após a compra do produto para liberar a aula (0 = imediato)';
COMMENT ON TABLE user_product_access IS 'Rastreia quando cada usuário ganhou acesso a cada produto';
