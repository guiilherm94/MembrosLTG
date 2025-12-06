-- Adiciona campo default_theme na tabela site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS default_theme TEXT DEFAULT 'dark';

-- Atualiza registros existentes para ter o tema dark como padrão
UPDATE site_settings
SET default_theme = 'dark'
WHERE default_theme IS NULL;
