# 研发样品管理系统

React + Vite 构建的样品借用管理 PWA，支持 Supabase 云端同步与本地存储。

## 功能

- 样品浏览、扫码、申请借用
- 转借流程（二维码扫码接收）
- 借用记录、归还、上报丢失
- 管理员审批、库存管理、操作日志

## 快速开始

```bash
npm install
npm run dev
```

## 配置与部署

| 文档 | 说明 |
|------|------|
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Supabase 数据库配置 |
| [DEPLOY_CN.md](./DEPLOY_CN.md) | 部署指南（CloudBase / Vercel） |

### 部署方式

- **Vercel**：连接 GitHub 仓库即可自动部署，`vercel.json` 已配置 SPA 路由
- **CloudBase**：使用 `.github/workflows/deploy-cloudbase.yml`，推送 `main` 分支自动部署

## 技术栈

- React 19 + Vite 7
- React Router (Hash)
- Supabase（可选，未配置时使用 localStorage）
