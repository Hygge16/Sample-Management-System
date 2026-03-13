-- 1. 创建名为 images 的存储桶 (Bucket)，如果已存在则忽略
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 允许公开访问 images 桶中的图片
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- 3. 允许所有人上传图片到 images 桶
CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images');

-- 4. 允许所有人更新 images 桶中的图片
CREATE POLICY "Public Update" 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'images');
