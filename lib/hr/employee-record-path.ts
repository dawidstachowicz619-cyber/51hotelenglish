import { encodeHotelSlug } from "@/lib/hr/hotel-slug";

export function hrEmployeeRecordPath(employeeId: string): string {
  return `/admin/hr/employees/${encodeURIComponent(employeeId)}`;
}

export function platformEmployeeRecordPath(
  hotel: string,
  employeeId: string
): string {
  return `/admin/platform/hotel/${encodeHotelSlug(hotel)}/employees/${encodeURIComponent(employeeId)}`;
}

export function decodeEmployeeIdParam(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}
