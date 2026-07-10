import { buildCurrentEmployeeRecord } from "@/lib/hr/current-employee-record";
import { isHrRegisteredUser } from "@/lib/hr/hr-registration";
import { upsertHotelEmployee } from "@/lib/hr/roster-storage";

export function syncCurrentUserToRoster(): void {
  if (typeof window === "undefined") return;
  if (!isHrRegisteredUser()) return;

  const record = buildCurrentEmployeeRecord();
  if (!record) return;

  const hotel = record.hotel?.trim();
  if (!hotel || hotel === "51HotelEnglish") return;

  upsertHotelEmployee(hotel, record);
}
