# Supabase 生产环境部署指南

本文说明如何将 51HotelEnglish 从浏览器 **localStorage** 迁移到 **Supabase (PostgreSQL)**，实现：

- 学员学习数据多设备同步
- HR 统一查看全酒店学员数据
- 生产环境持久化存储

## 架构概览

```
学员浏览器                    Next.js API (Vercel)              Supabase
──────────                    ───────────────────              ────────
localStorage  ←hydrate/pull─  /api/learner/bootstrap  ────────→  learner_profiles
localStorage  ──push/sync──→  /api/learner/sync       ────────→  learning_progress
                                                              →  learning_history

HR 后台                       /api/hr/login           ────────→  hr_admin_accounts
                              /api/hr/employees       ────────→  employees

平台管理                      /api/platform/employees ────────→  employees (全平台)
```

**双模式运行：**

| 环境变量 | 行为 |
|---------|------|
| `NEXT_PUBLIC_USE_CLOUD_STORAGE=false` | 仅 localStorage（本地开发） |
| `NEXT_PUBLIC_USE_CLOUD_STORAGE=true` + Supabase 密钥 | 云端同步 + PostgreSQL |

## 1. 创建 Supabase 项目

1. 登录 [supabase.com](https://supabase.com) 创建项目
2. 在 **SQL Editor** 中执行：

```bash
supabase/migrations/001_initial_schema.sql
```

3. 在 **Project Settings → API** 复制：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`（**仅服务端，勿暴露到前端**）

## 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_USE_CLOUD_STORAGE=true
SESSION_SECRET=请替换为至少32位随机字符串
PLATFORM_ADMIN_PASSWORD=platform51
```

在 **Vercel** 项目 Settings → Environment Variables 中填入相同变量。

## 3. 创建首个 HR 账号

云端模式下 HR 账号存在数据库，不再使用 localStorage。用平台管理员密码创建：

```bash
curl -X PUT https://你的域名/api/hr/login \
  -H "Content-Type: application/json" \
  -H "x-platform-admin-password: platform51" \
  -d '{
    "hotel": "上海浦东丽思卡尔顿",
    "username": "hr_admin",
    "password": "your-secure-password",
    "displayName": "HR 管理员"
  }'
```

然后在 `/admin/hr` 用该账号登录。

## 4. 学员数据如何同步

启用云端后，`CloudSyncProvider` 会：

1. **启动时** `GET /api/learner/bootstrap` — 从数据库拉取进度，写入 localStorage
2. **学习时** 仍写 localStorage（现有代码无需大改），800ms 防抖后 `POST /api/learner/sync` 推送到云端
3. **切换设备/刷新** 再次 bootstrap，拉取最新数据

学员身份通过 httpOnly Cookie `51he_learner_id` 识别（首次访问自动创建）。

### 多设备说明（当前阶段）

- **同一浏览器**：Cookie 持久，数据自动同步 ✓
- **换设备**：需后续接入 Supabase Auth 手机号登录，将多个 `learner_profile` 绑定到同一账号（Phase 2）

## 5. HR 注册与云端

流程不变：

1. HR 在后台录入员工手机号
2. 学员在 `/profile` 填写相同手机号与酒店
3. 同步时 API 自动匹配 `employees` 表并设置 `hr_registered=true`

## 6. 数据库表说明

| 表名 | 用途 |
|------|------|
| `hotels` | 酒店 |
| `learner_profiles` | 学员档案、积分、HR 注册状态 |
| `employees` | HR 花名册 |
| `learning_progress` | 各课程进度 JSON（前厅、CEFR、俄语等） |
| `learning_history` | 学习活动流水 |
| `hr_admin_accounts` | HR 登录账号 |

## 7. 本地开发

```bash
# 不连云端，继续用 localStorage
NEXT_PUBLIC_USE_CLOUD_STORAGE=false npm run dev

# 连 Supabase 测试云端模式
NEXT_PUBLIC_USE_CLOUD_STORAGE=true npm run dev
```

## 8. Phase 2：手机号登录与跨设备同步

### 配置 Supabase 短信 OTP

1. Supabase Dashboard → **Authentication → Providers → Phone** → 启用
2. 配置 SMS 服务商（Twilio 等）
3. 执行 `supabase/migrations/002_phase2_auth.sql`

### 学员跨设备流程

1. 学员在 `/profile` → **手机号登录** → 收验证码 → 验证
2. 系统自动调用 `POST /api/auth/link`，将 Supabase Auth 用户与 `learner_profiles` 绑定
3. 若本机曾有匿名学习数据，自动合并到云端账号
4. 换设备后用同一手机号登录，即可拉取全部进度

### 本地数据自动迁移

启用云端后，若云端档案为空但本机 localStorage 有学习记录，首次同步会自动调用 `PUT /api/learner/migrate` 上传。

### 云端 API（Phase 2 新增）

| 路由 | 用途 |
|------|------|
| `POST /api/auth/link` | OTP 验证后绑定账号 |
| `DELETE /api/auth/link` | 退出登录 |
| `PUT /api/learner/migrate` | 手动/自动上传 localStorage |
| `GET /api/leaderboard` | 真实学员排行榜 |
| `GET/POST /api/platform/hotels` | 酒店列表 + HR 权限配置 |

### 排行榜与平台管理

- 排行榜：云端模式从 `learner_profiles` 聚合真实数据
- 平台管理：酒店注册、HR 权限存入 `hotels` + `hotel_hr_permissions` 表

## 9. 安全提醒

- `SUPABASE_SERVICE_ROLE_KEY` 仅用于 Next.js 服务端 API
- 生产环境务必更换 `SESSION_SECRET` 和 `PLATFORM_ADMIN_PASSWORD`
- HR 密码在数据库中以 salted SHA256 存储（`lib/auth/session.ts`）
