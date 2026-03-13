-- 若 items 表已存在且无 image_url 列，执行此脚本
-- 在 Supabase SQL Editor 中运行

ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
