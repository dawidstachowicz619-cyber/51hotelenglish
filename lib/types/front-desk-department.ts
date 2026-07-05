export type FrontDeskDepartmentId =
  | "reception"
  | "concierge"
  | "reservations"
  | "customer-service";

export type FrontDeskDepartment = {
  id: FrontDeskDepartmentId;
  title: string;
  subtitle: string;
  description: string;
  /** 对应工作场景 id 列表 */
  scenarioIds: string[];
};

export const FRONT_DESK_DEPARTMENTS: FrontDeskDepartment[] = [
  {
    id: "reception",
    title: "酒店接待岗位英语",
    subtitle: "Front Desk Reception",
    description: "入住退房、迎宾问候、问询指引等前台接待核心流程。",
    scenarioIds: ["check-in", "check-out", "guest-inquiry"],
  },
  {
    id: "concierge",
    title: "礼宾部英语",
    subtitle: "Concierge",
    description: "行李服务、餐厅预订、本地推荐、VIP 迎送等礼宾专属场景。",
    scenarioIds: ["special-requests", "vip-group"],
  },
  {
    id: "reservations",
    title: "预订部英语",
    subtitle: "Reservations",
    description: "电话/在线预订、散客询价、房态确认与订单修改。",
    scenarioIds: ["reservation-walkin"],
  },
  {
    id: "customer-service",
    title: "客服中心英语",
    subtitle: "Guest Relations / Call Center",
    description: "客诉处理、服务补救、危机沟通与跟进回访。",
    scenarioIds: ["problem-solving", "crisis-management"],
  },
];

export const DEPARTMENT_BY_ID = Object.fromEntries(
  FRONT_DESK_DEPARTMENTS.map((d) => [d.id, d])
) as Record<FrontDeskDepartmentId, FrontDeskDepartment>;

export function getDepartmentForScenario(
  scenarioId: string
): FrontDeskDepartment | undefined {
  return FRONT_DESK_DEPARTMENTS.find((d) => d.scenarioIds.includes(scenarioId));
}

export function getScenariosForDepartment(
  departmentId: FrontDeskDepartmentId
): string[] {
  return DEPARTMENT_BY_ID[departmentId]?.scenarioIds ?? [];
}
