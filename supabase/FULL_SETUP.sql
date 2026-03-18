-- ============================================================
-- 研发样品管理系统 - Supabase 完整初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中一次性执行
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. 样品表
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  total_stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 借用记录表
CREATE TABLE IF NOT EXISTS records (
  id BIGINT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL DEFAULT '匿名',
  current_holder TEXT,
  transfer_token TEXT,
  quantity INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  return_date TEXT NOT NULL,
  no_return BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT '待审批',
  created_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 通知表（新申请提醒管理员）
CREATE TABLE IF NOT EXISTS notices (
  id BIGINT PRIMARY KEY,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 操作日志表
CREATE TABLE IF NOT EXISTS logs (
  id BIGINT PRIMARY KEY,
  action TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 若表已存在，补充可能缺失的列
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS current_holder TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS transfer_token TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS transferred_from TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS transferred_at TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS no_return BOOLEAN NOT NULL DEFAULT FALSE;

-- 6. 启用 Realtime（管理员可实时收到新申请）
-- 若报错，到 Dashboard -> Database -> Replication 中手动勾选 records、notices
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE records;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notices;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7. 插入初始样品（可选，若已有数据可跳过）
INSERT INTO items (id, name, stock, total_stock, image_url) VALUES
  ('1', '样品A', 10, 10, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=256'),
  ('2', '样品B', 5, 5, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=256')
ON CONFLICT (id) DO NOTHING;

-- 8. 图片存储桶（用于样品图片上传，可选）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 9. 存储桶策略（允许公开读取、上传、更新）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'images');

-- 10. 刷新 API 缓存
NOTIFY pgrst, 'reload schema';
