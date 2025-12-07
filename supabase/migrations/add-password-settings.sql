-- Adiciona configurações de senha para novos usuários criados via webhook
ALTER TABLE site_settings
ADD COLUMN password_type TEXT DEFAULT 'default' CHECK (password_type IN ('default', 'temporary', 'email')),
ADD COLUMN default_password TEXT DEFAULT 'senha123';

-- Atualizar registro existente
UPDATE site_settings
SET password_type = 'default',
    default_password = 'senha123'
WHERE id IS NOT NULL;

COMMENT ON COLUMN site_settings.password_type IS 'Tipo de senha para novos usuários: default (senha padrão), temporary (aleatória), email (usa o email como senha)';
COMMENT ON COLUMN site_settings.default_password IS 'Senha padrão quando password_type = default';
