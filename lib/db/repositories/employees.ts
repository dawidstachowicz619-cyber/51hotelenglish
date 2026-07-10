import { employeeRowToRecord, learningRecordToEmployeeRow } from "@/lib/db/mappers";
import { ensureHotel, findHotelById, findHotelByName } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EmployeeRow } from "@/lib/supabase/database.types";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

async function hotelNameForRow(row: EmployeeRow): Promise<string> {
  if (!row.hotel_id) return "";
  const hotel = await findHotelById(row.hotel_id);
  return hotel?.name ?? "";
}

export async function listHotelEmployees(
  hotelName: string
): Promise<EmployeeLearningRecord[]> {
  const hotel = await findHotelByName(hotelName.trim());
  if (!hotel) return [];

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("employees")
    .select("*")
    .eq("hotel_id", hotel.id)
    .eq("is_hidden", false)
    .order("total_points", { ascending: false });
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) =>
      employeeRowToRecord(row, hotel.name)
    )
  );
}

export async function listAllEmployees(): Promise<EmployeeLearningRecord[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("employees")
    .select("*")
    .eq("is_hidden", false)
    .order("total_points", { ascending: false });
  if (error) throw error;

  const rows: EmployeeRow[] = data ?? [];
  const hotelNames = new Map<string, string>();
  for (const row of rows) {
    if (!hotelNames.has(row.hotel_id)) {
      hotelNames.set(row.hotel_id, await hotelNameForRow(row));
    }
  }

  return rows.map((row) =>
    employeeRowToRecord(row, hotelNames.get(row.hotel_id) ?? "")
  );
}

export async function upsertEmployeeFromRecord(
  record: EmployeeLearningRecord
): Promise<EmployeeRow> {
  const hotel = await ensureHotel(record.hotel);
  const db = getSupabaseAdmin();
  const patch = learningRecordToEmployeeRow(record, hotel.id);

  const { data: byPhone } = await db
    .from("employees")
    .select("*")
    .eq("hotel_id", hotel.id)
    .eq("phone", record.phone)
    .maybeSingle();

  if (byPhone) {
    const { data, error } = await db
      .from("employees")
      .update({ ...patch, is_hidden: false })
      .eq("id", byPhone.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await db
    .from("employees")
    .insert({
      ...patch,
      hotel_id: hotel.id,
      phone: record.phone,
      nickname: record.nickname,
      is_imported: record.isImported ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function addEmployee(
  hotelName: string,
  record: EmployeeLearningRecord
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!record.nickname.trim()) return { ok: false, error: "姓名为空" };
  if (!record.role.trim()) return { ok: false, error: "职位为空" };
  if (!record.phone) return { ok: false, error: "手机号为空" };
  if (!/^1\d{10}$/.test(record.phone)) {
    return { ok: false, error: "手机号格式不正确" };
  }

  const hotel = await ensureHotel(hotelName);
  const db = getSupabaseAdmin();

  const { data: existing } = await db
    .from("employees")
    .select("id")
    .eq("hotel_id", hotel.id)
    .eq("phone", record.phone)
    .maybeSingle();
  if (existing) return { ok: false, error: "该手机号已存在" };

  const patch = learningRecordToEmployeeRow(record, hotel.id);
  const { error } = await db.from("employees").insert({
    ...patch,
    hotel_id: hotel.id,
    legacy_id: record.id.startsWith("import-") ? record.id : `import-${record.phone}`,
    is_imported: true,
    is_hidden: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function hideEmployee(
  hotelName: string,
  employeeId: string
): Promise<void> {
  const hotel = await findHotelByName(hotelName.trim());
  if (!hotel) return;

  const db = getSupabaseAdmin();
  await db
    .from("employees")
    .update({ is_hidden: true })
    .eq("hotel_id", hotel.id)
    .or(`id.eq.${employeeId},legacy_id.eq.${employeeId},learner_profile_id.eq.${employeeId}`);
}

export async function bulkImportEmployees(
  hotelName: string,
  records: EmployeeLearningRecord[]
): Promise<number> {
  let added = 0;
  for (const record of records) {
    const result = await addEmployee(hotelName, record);
    if (result.ok) added += 1;
  }
  return added;
}

export async function getEmployeeById(
  employeeId: string
): Promise<EmployeeLearningRecord | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("employees")
    .select("*")
    .or(`id.eq.${employeeId},legacy_id.eq.${employeeId},learner_profile_id.eq.${employeeId}`)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const hotelName = await hotelNameForRow(data);
  return employeeRowToRecord(data, hotelName);
}
