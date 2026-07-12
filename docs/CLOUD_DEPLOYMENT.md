# 云端部署说明（Vercel + Supabase）

生产环境请确保 **所有学习数据与 HR 配置均走 Supabase**，Vercel 仅负责运行 Next.js 应用。

## 必需环境变量（Vercel）

```env
NEXT_PUBLIC_USE_CLOUD_STORAGE=true
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SECRET=（强随机字符串）
PLATFORM_ADMIN_PASSWORD=...
CRON_SECRET=...
```

## Supabase 迁移（按顺序执行）

在 Supabase SQL Editor 中依次运行 `supabase/migrations/` 下脚本，至少包括：

| 文件 | 内容 |
|------|------|
| `001_initial_schema.sql` | 学员、员工、学习进度 |
| `002_learning_export_snapshots.sql` | 学习数据导出 |
| `004_hotel_course_assignments.sql` | 课程分配 |
| `005_hotel_cloud_data.sql` | 部门设置、HR 培训课件 |

## 云端数据一览

| 数据 | 存储位置 |
|------|----------|
| 学员进度、积分、测评 | `learner_profiles` + `learning_progress` |
| 学习活动记录 | `learning_history` |
| 员工花名册 | `employees` |
| 课程分配 | `hotel_course_assignments` |
| 酒店部门 | `hotel_departments` |
| HR 上传培训 | `hr_training_modules` |
| HR 账号 / 权限 / 酒店 | `hr_admin_accounts` / `hotel_hr_permissions` / `hotels` |
| 每日学习数据 ZIP | Supabase Storage `learning-exports` |

浏览器 localStorage 仅作**本地缓存**，登录后会从云端拉取并回写。

## 更新课程 vs 学习数据

- **改课程标题、题目内容**（不改 ID）→ 学员进度**保留**，界面显示新课程内容。
- **改课程 ID、关卡 nodeId** → 旧进度仍在数据库，但可能显示为「未完成」；更新课程时请保持 ID 稳定。
- 重新部署 Vercel **不会**删除 Supabase 中的学习数据。

## 首次上线迁移

HR 管理员首次在云端登录时，系统会自动将本机已有的：

- 课程分配
- 部门设置
- HR 培训课件

上传到 Supabase（若云端尚无记录）。

## 定时任务

`vercel.json` 中 Cron 每天触发学习数据全量导出；需配置 `CRON_SECRET`。
