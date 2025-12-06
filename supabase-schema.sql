-- USERS TABLE (Custom Auth - sem MAU)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  product_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- PRODUCTS TABLE
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  sale_url TEXT,
  is_active BOOLEAN DEFAULT true,
  webhook_secret TEXT DEFAULT gen_random_uuid()::text,
  enabled_platforms JSONB DEFAULT '[]'::jsonb,
  enable_access_removal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_webhook_secret ON products(webhook_secret);

-- MODULES TABLE
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_modules_product ON modules(product_id);

-- LESSONS TABLE
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  video_url TEXT,
  video_type TEXT,
  description TEXT,
  files JSONB DEFAULT '[]',
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_module ON lessons(module_id);

-- LESSON PROGRESS TABLE
CREATE TABLE lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- SITE SETTINGS TABLE
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT DEFAULT 'LowzinGO - Membros',
  logo_url TEXT,
  banner_url TEXT,
  color_scheme TEXT DEFAULT 'green',
  default_theme TEXT DEFAULT 'dark',
  whatsapp_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  support_page_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO site_settings (color_scheme, system_name) VALUES ('green', 'LowzinGO - Membros');

-- RLS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);

CREATE POLICY "Users can read own progress" ON lesson_progress FOR SELECT USING (true);
CREATE POLICY "Users can insert own progress" ON lesson_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own progress" ON lesson_progress FOR UPDATE USING (true);

CREATE POLICY "Public read site settings" ON site_settings FOR SELECT USING (true);
