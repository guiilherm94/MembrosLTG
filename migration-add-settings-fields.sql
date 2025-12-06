-- Migration: Add new fields to site_settings table
-- Execute this in your Supabase SQL editor

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS system_name TEXT DEFAULT 'LowzinGO - Membros',
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS support_page_content TEXT;

-- Update existing row if it exists
UPDATE site_settings
SET system_name = 'LowzinGO - Membros'
WHERE system_name IS NULL;
