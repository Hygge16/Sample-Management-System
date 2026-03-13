-- 转借功能：当前持有人、转借一次性 token
ALTER TABLE records ADD COLUMN IF NOT EXISTS current_holder TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS transfer_token TEXT;

-- 刷新 API 缓存
NOTIFY pgrst, 'reload schema';
