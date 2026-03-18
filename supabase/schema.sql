-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- https://supabase.com/dashboard/project/_/sql

-- 样品表
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  total_stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 若表已存在，添加图片列：ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS records (
  id BIGINT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  current_holder TEXT,
  transfer_token TEXT,
  transferred_from TEXT,
  transferred_at TEXT,
  quantity INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  return_date TEXT NOT NULL,
  no_return BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT '待审批',
  created_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 若表已存在，添加 applicant_name 列：ALTER TABLE records ADD COLUMN IF NOT EXISTS applicant_name TEXT DEFAULT '匿名';
-- 若表已存在，添加 no_return 列：ALTER TABLE records ADD COLUMN IF NOT EXISTS no_return BOOLEAN NOT NULL DEFAULT FALSE;
-- 若表已存在，添加转借字段：ALTER TABLE records ADD COLUMN IF NOT EXISTS current_holder TEXT; ALTER TABLE records ADD COLUMN IF NOT EXISTS transfer_token TEXT;
-- 若表已存在，添加转借来源/时间：ALTER TABLE records ADD COLUMN IF NOT EXISTS transferred_from TEXT; ALTER TABLE records ADD COLUMN IF NOT EXISTS transferred_at TEXT;

-- 通知表（新申请提醒管理员）
CREATE TABLE IF NOT EXISTS notices (
  id BIGINT PRIMARY KEY,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS logs (
  id BIGINT PRIMARY KEY,
  action TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Realtime（新申请时管理员可实时收到）
-- 若执行报错，可在 Dashboard -> Database -> Replication 中手动勾选 records、notices
ALTER PUBLICATION supabase_realtime ADD TABLE records;
ALTER PUBLICATION supabase_realtime ADD TABLE notices;

-- 插入初始样品（可选，含示例图片）
INSERT INTO items (id, name, stock, total_stock, image_url) VALUES
  ('1', '样品A', 10, 10, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=256'),
  ('2', '样品B', 5, 5, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=256')
ON CONFLICT (id) DO NOTHING;
