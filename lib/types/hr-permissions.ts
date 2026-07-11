/** 酒店 HR 可分配的功能权限 */
export type HrPermissionKey =
  | "dashboard"
  | "employees"
  | "departments"
  | "catalog"
  | "training"
  | "reports";

export const HR_PERMISSION_KEYS: HrPermissionKey[] = [
  "dashboard",
  "employees",
  "departments",
  "catalog",
  "training",
  "reports",
];

export const HR_PERMISSION_LABELS: Record<
  HrPermissionKey,
  { label: string; description: string }
> = {
  dashboard: {
    label: "数据看板",
    description: "查看员工统计、部门排名与 CEFR 分布",
  },
  employees: {
    label: "员工管理",
    description: "添加、导入、删除员工及查看列表",
  },
  departments: {
    label: "部门设置",
    description: "自定义本酒店组织架构部门",
  },
  catalog: {
    label: "课程资源分配",
    description: "从通用课程资源中心分配课程给员工",
  },
  training: {
    label: "培训上传",
    description: "上传培训文档并生成视频课与测验",
  },
  reports: {
    label: "试用期档案",
    description: "查看员工详情与打印试用期学习档案",
  },
};

export type HotelHrPermissions = {
  hotel: string;
  /** 是否开通 HR 后台访问 */
  enabled: boolean;
  permissions: Record<HrPermissionKey, boolean>;
  note?: string;
  updatedAt: string;
};

export const HOTEL_HR_PERMISSIONS_KEY = "51he-hotel-hr-permissions";

export type PlatformAdminSession = {
  role: "platform-admin";
  loggedInAt: string;
};

export const PLATFORM_ADMIN_SESSION_KEY = "51he-platform-admin-session";
export const PLATFORM_ADMIN_PASSWORD_KEY = "51he-platform-admin-password";

/** 演示环境平台管理员密码 */
export const PLATFORM_ADMIN_DEMO_PASSWORD = "platform51";
