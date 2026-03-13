-- 添加 applicant_name 到 records 表
ALTER TABLE records ADD COLUMN IF NOT EXISTS applicant_name TEXT DEFAULT '匿名';
