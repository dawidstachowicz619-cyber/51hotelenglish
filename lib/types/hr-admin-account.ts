export type HrAdminAccount = {
  id: string;
  hotel: string;
  username: string;
  /** 演示环境明文存储；生产环境应使用服务端哈希 */
  password: string;
  displayName: string;
  email?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export const HR_ADMIN_ACCOUNTS_KEY = "51he-hr-admin-accounts";

export type CreateHrAdminAccountInput = {
  hotel: string;
  username: string;
  password: string;
  displayName: string;
  email?: string;
};
