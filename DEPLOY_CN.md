# 国内部署指南

将应用部署到国内可访问的平台，无需 VPN。

> 参考文档：[腾讯云 CloudBase 与 Git 平台 CI/CD 集成](https://docs.cloudbase.net/hosting/cli-devops)

---

## 方案一：腾讯云 CloudBase 静态托管（推荐）

CloudBase 静态托管支持国内 CDN 加速，配合 GitHub Actions 可实现推送即部署。

### 前置准备

#### 1. 开通 CloudBase 环境

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/tcb)
2. 进入「云开发」→ 新建环境（选择「按量计费」）
3. 在环境中开通「静态网站托管」服务
4. 记录**环境 ID**（如 `xxx-xxxxx`）

#### 2. 获取 API 密钥

1. 打开 [API 密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 创建或获取 `SecretId` 和 `SecretKey`
3. 妥善保管，不要泄露

### 方式 A：GitHub Actions 自动部署（推荐）

项目已包含 `.github/workflows/deploy-cloudbase.yml`，配置好 GitHub Secrets 后，每次推送到 `main` 分支会自动部署。

#### 配置 GitHub Secrets

在 GitHub 仓库中：**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

添加以下 Secrets：

| 名称 | 说明 |
|------|------|
| `TCB_SECRET_ID` | 腾讯云 SecretId |
| `TCB_SECRET_KEY` | 腾讯云 SecretKey |
| `TCB_ENV_ID` | CloudBase 环境 ID |
| `VITE_SUPABASE_URL` | Supabase 项目 URL（使用 Supabase 时必填） |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥（使用 Supabase 时必填） |
| `VITE_ADMIN_PASSWORD` | 管理员密码（可选，默认 123456） |

#### 推送触发部署

```bash
git add .
git commit -m "Deploy to CloudBase"
git push origin main
```

推送后到 **Actions** 标签页查看部署进度。成功后访问 CloudBase 控制台中的静态托管地址。

### 方式 B：本地手动部署

```bash
# 1. 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 2. 登录（会提示输入 SecretId、SecretKey）
tcb login

# 3. 构建项目
npm run build

# 4. 部署到静态托管（将 ./dist 部署到云端根路径）
tcb hosting deploy ./dist / -e 你的环境ID
```

参数说明：

| 参数 | 说明 |
|------|------|
| `./dist` | 本地构建产物目录 |
| `/` | 云端目标路径（根目录） |
| `-e` | CloudBase 环境 ID |

### 访问地址

部署完成后，在 CloudBase 控制台 → 静态网站托管 → 可查看默认访问域名（如 `xxx.tcloudbaseapp.com`），国内可直接访问。

### 转借/直接访问路由需配置 404 回退

扫码转借会打开 `/receive/xxx/yyy` 等路径，需让 CloudBase 对 404 返回 `index.html`，由前端路由处理：

1. 进入 CloudBase 控制台 → 静态网站托管
2. 找到「设置」或「基础配置」
3. 将**错误文档** / **404 页面** 设置为 `index.html`

若控制台无此选项，项目已生成 `404.html`（与 index.html 相同），部分环境会自动使用。

---

## 方案二：腾讯云 Webify（备选）

若 GitHub Actions 无法使用，可用 Webify Git 导入。构建命令 `npm run build`，输出目录 `dist`。

---

## 方案三：阿里云 OSS / 腾讯云 COS

手动构建后上传 `dist` 目录到对象存储，开启静态网站托管。详见原文档。

---

## 环境变量说明

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `VITE_ADMIN_PASSWORD` | 管理员密码（默认 123456） |
