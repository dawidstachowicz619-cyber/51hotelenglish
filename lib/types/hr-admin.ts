/** 酒店部门 id（由 HR 在本酒店部门设置中维护） */
export type EmployeeDepartment = string;

/** @deprecated 请使用 getDepartmentLabel(hotel, id) */
export const EMPLOYEE_DEPARTMENT_LABELS: Record<string, string> = {
  reception: "酒店接待",
  concierge: "礼宾部",
  reservations: "预订部",
  "customer-service": "客服中心",
  other: "其他部门",
};

export type EmployeeUpdatePatch = {
  nickname?: string;
  role?: string;
  department?: EmployeeDepartment;
  status?: EmployeeLearningRecord["status"];
  hireDate?: string | null;
  probationEndDate?: string | null;
};

export type EmployeeLearningRecord = {
  id: string;
  nickname: string;
  phone: string;
  hotel: string;
  department: EmployeeDepartment;
  role: string;
  cefrLevel: string;
  assessmentScore: number;
  passedAssessmentLevels: string[];
  totalPoints: number;
  weeklyPoints: number;
  completedLessons: number;
  totalLessons: number;
  courseProgressPercent: number;
  lastActiveAt: string;
  status: "active" | "inactive" | "new";
  /** 入职日期 ISO */
  hireDate?: string;
  /** 试用期结束日期 ISO */
  probationEndDate?: string;
  isLiveUser?: boolean;
  isImported?: boolean;
};

export type EmployeeImportRow = {
  department: string;
  position: string;
  name: string;
  phone: string;
  rowNumber: number;
};

export type EmployeeImportResult = {
  imported: EmployeeLearningRecord[];
  errors: { rowNumber: number; message: string }[];
  skipped: number;
};

export type DepartmentRankingEntry = {
  rank: number;
  department: EmployeeDepartment;
  label: string;
  count: number;
  avgProgress: number;
  avgAssessmentScore: number;
  avgPoints: number;
  activeRate: number;
  compositeScore: number;
};

export type HotelLearningStats = {
  totalEmployees: number;
  activeThisWeek: number;
  avgProgressPercent: number;
  avgAssessmentScore: number;
  assessmentPassRate: number;
  totalCompletedLessons: number;
  departmentBreakdown: { department: EmployeeDepartment; label: string; count: number; avgProgress: number }[];
  departmentRanking: DepartmentRankingEntry[];
  levelBreakdown: { level: string; count: number }[];
};

export type HrAdminSession = {
  hotel: string;
  accountId: string;
  username: string;
  displayName: string;
  loggedInAt: string;
};
