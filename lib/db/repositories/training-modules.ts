import { ensureHotel, findHotelByName } from "@/lib/db/repositories/hotels";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { HrTrainingModuleRow } from "@/lib/supabase/database.types";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type {
  HrTrainingModule,
  TrainingDeliveryType,
  TrainingQuestion,
  TrainingSlide,
} from "@/lib/types/hr-training";
import type { AskDimension, LearningPhase } from "@/lib/types/learning-record";

const PLATFORM_HOTEL_NAME = "__platform__";

function rowToModule(row: HrTrainingModuleRow, hotelName: string): HrTrainingModule {
  return {
    id: row.legacy_id ?? row.id,
    hotel: hotelName,
    title: row.title,
    fileName: row.file_name,
    uploadedAt: row.uploaded_at,
    department: row.department as EmployeeDepartment | "all",
    phase: row.phase as LearningPhase,
    ask: row.ask_dimension as AskDimension,
    deliveryType: row.delivery_type as TrainingDeliveryType,
    videoUrl: row.video_url ?? undefined,
    videoDurationSec: row.video_duration_sec ?? undefined,
    source: row.source as HrTrainingModule["source"],
    slides: (row.slides as TrainingSlide[]) ?? [],
    questions: (row.questions as TrainingQuestion[]) ?? [],
    slideCount: row.slide_count,
    questionCount: row.question_count,
  };
}

function moduleToRow(
  module: HrTrainingModule,
  hotelId: string
): Omit<HrTrainingModuleRow, "id" | "created_at" | "updated_at"> & {
  updated_at?: string;
} {
  return {
    legacy_id: module.id,
    hotel_id: hotelId,
    title: module.title,
    file_name: module.fileName,
    uploaded_at: module.uploadedAt,
    department: module.department,
    phase: module.phase,
    ask_dimension: module.ask,
    delivery_type: module.deliveryType ?? "slides",
    video_url: module.videoUrl ?? null,
    video_duration_sec: module.videoDurationSec ?? null,
    source: module.source ?? "hr",
    slides: module.slides,
    questions: module.questions,
    slide_count: module.slideCount,
    question_count: module.questionCount,
    updated_at: new Date().toISOString(),
  };
}

async function resolveHotelId(hotelName: string): Promise<{ id: string; name: string }> {
  const name = hotelName.trim();
  if (name === "platform") {
    const hotel = await ensureHotel(PLATFORM_HOTEL_NAME);
    return { id: hotel.id, name: "platform" };
  }
  const hotel = await ensureHotel(name);
  return { id: hotel.id, name: hotel.name };
}

export async function listHotelTrainingModules(hotelName: string): Promise<HrTrainingModule[]> {
  const { id, name } = await resolveHotelId(hotelName);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("hr_training_modules")
    .select("*")
    .eq("hotel_id", id)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => rowToModule(row, name === PLATFORM_HOTEL_NAME ? "platform" : name));
}

export async function upsertHotelTrainingModule(module: HrTrainingModule): Promise<HrTrainingModule> {
  const { id: hotelId, name } = await resolveHotelId(module.hotel);
  const db = getSupabaseAdmin();
  const row = moduleToRow(module, hotelId);

  const { data: existing } = await db
    .from("hr_training_modules")
    .select("id")
    .eq("hotel_id", hotelId)
    .eq("legacy_id", module.id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await db
      .from("hr_training_modules")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return rowToModule(data, name === PLATFORM_HOTEL_NAME ? "platform" : name);
  }

  const { data, error } = await db
    .from("hr_training_modules")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return rowToModule(data, name === PLATFORM_HOTEL_NAME ? "platform" : name);
}

export async function removeHotelTrainingModule(
  hotelName: string,
  moduleId: string
): Promise<void> {
  const hotel = await findHotelByName(hotelName.trim() === "platform" ? PLATFORM_HOTEL_NAME : hotelName.trim());
  if (!hotel) return;
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("hr_training_modules")
    .delete()
    .eq("hotel_id", hotel.id)
    .eq("legacy_id", moduleId);
  if (error) throw error;
}

export async function migrateHotelTrainingModules(
  hotelName: string,
  localModules: HrTrainingModule[]
): Promise<HrTrainingModule[]> {
  const existing = await listHotelTrainingModules(hotelName);
  if (existing.length > 0) return existing;
  if (localModules.length === 0) return [];
  const saved: HrTrainingModule[] = [];
  for (const mod of localModules) {
    saved.push(await upsertHotelTrainingModule(mod));
  }
  return saved;
}

export async function listPlatformManagementCourses(): Promise<HrTrainingModule[]> {
  return listHotelTrainingModules("platform");
}

export async function upsertPlatformManagementCourse(
  module: HrTrainingModule
): Promise<HrTrainingModule> {
  return upsertHotelTrainingModule({
    ...module,
    hotel: "platform",
    phase: "management",
    source: "platform",
  });
}

export async function removePlatformManagementCourse(moduleId: string): Promise<void> {
  await removeHotelTrainingModule("platform", moduleId);
}
