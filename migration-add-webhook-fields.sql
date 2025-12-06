-- Adiciona campos de webhook na tabela products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS webhook_secret TEXT DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS enabled_platforms JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS enable_access_removal BOOLEAN DEFAULT false;

-- Cria índice para webhook_secret para buscar produtos por webhook rapidamente
CREATE INDEX IF NOT EXISTS idx_products_webhook_secret ON products(webhook_secret);

-- Atualiza produtos existentes com secrets únicos
UPDATE products
SET webhook_secret = gen_random_uuid()::text
WHERE webhook_secret IS NULL;
