import { buildProgressionMap } from "@/lib/course/progression-map";
import { FRONT_DESK_DEPARTMENTS } from "@/lib/types/front-desk-department";

let cachedTotal: number | null = null;

/** 前厅四大岗位全部关卡总数（用于进度百分比） */
export function getTotalFrontDeskLessons(): number {
  if (cachedTotal !== null) return cachedTotal;
  cachedTotal = FRONT_DESK_DEPARTMENTS.reduce(
    (sum, dept) => sum + buildProgressionMap(dept.id).length,
    0
  );
  return cachedTotal;
}
