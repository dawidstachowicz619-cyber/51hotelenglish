import { buildCurrentEmployeeRecord } from "@/lib/hr/current-employee-record";
import { upsertHotelEmployee } from "@/lib/hr/roster-storage";

export function syncCurrentUserToRoster(): void {
  if (typeof window === "undefined") return;

  const record = buildCurrentEmployeeRecord();
  if (!record) return;

  const hotel = record.hotel?.trim();
  if (!hotel || hotel === "51HotelEnglish") return;

  upsertHotelEmployee(hotel, record);
}
