import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

export type HotelDepartment = {
  id: string;
  name: string;
  subtitle?: string;
  /** 关联前厅英语课程模板（可选） */
  courseTrackId?: FrontDeskDepartmentId;
  order: number;
};

export const HOTEL_DEPARTMENTS_STORAGE_KEY = "51he-hotel-departments";

export const DEFAULT_HOTEL_DEPARTMENTS: HotelDepartment[] = [
  {
    id: "reception",
    name: "酒店接待",
    subtitle: "Front Desk Reception",
    courseTrackId: "reception",
    order: 0,
  },
  {
    id: "concierge",
    name: "礼宾部",
    subtitle: "Concierge",
    courseTrackId: "concierge",
    order: 1,
  },
  {
    id: "reservations",
    name: "预订部",
    subtitle: "Reservations",
    courseTrackId: "reservations",
    order: 2,
  },
  {
    id: "customer-service",
    name: "客服中心",
    subtitle: "Guest Relations",
    courseTrackId: "customer-service",
    order: 3,
  },
];

export const FRONT_DESK_TRACK_IDS: FrontDeskDepartmentId[] = [
  "reception",
  "concierge",
  "reservations",
  "customer-service",
];

export const COURSE_TRACK_LABELS: Record<FrontDeskDepartmentId, string> = {
  reception: "酒店接待岗位英语",
  concierge: "礼宾部英语",
  reservations: "预订部英语",
  "customer-service": "客服中心英语",
};

export function isFrontDeskDepartmentId(id: string): id is FrontDeskDepartmentId {
  return (FRONT_DESK_TRACK_IDS as string[]).includes(id);
}
