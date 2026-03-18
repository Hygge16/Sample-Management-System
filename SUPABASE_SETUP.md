# Supabase 配置指南

配置完成后，他人可通过同一链接访问系统并提交申请，管理员可实时收到新申请通知。

## 1. 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 新建项目（New Project）
3. 记录 **Project URL** 和 **anon public** key（Settings → API）

## 2. 执行数据库脚本

1. 在 Supabase 中打开 **SQL Editor**
2. 复制 `supabase/FULL_SETUP.sql` 完整内容并执行（一次性完成所有表、列、Realtime、存储桶初始化）
3. 若 Realtime 相关语句报错，可在 **Database → Replication** 中手动为 `records`、`notices` 表开启 Realtime

## 3. 配置环境变量

1. 复制 `.env.example` 为 `.env`
2. 填入你的 Supabase 配置：

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. 运行与部署

```bash
npm run dev
```

部署到 CloudBase 时，在 GitHub Secrets 中配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`，他人即可通过部署链接访问。详见 `DEPLOY_CN.md`。

## 5. 行为说明

- **未配置 Supabase**：使用 localStorage，数据仅本地可见
- **已配置 Supabase**：数据存储在云端，多人共享
- **Admin 页面**：订阅 `records` 和 `notices` 的 Realtime，有新申请时自动刷新
