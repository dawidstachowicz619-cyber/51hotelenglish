import { PROGRESS_KEYS } from "@/lib/db/config";
import type { LearnerBootstrapPayload } from "@/lib/db/mappers";
import type { LearnerProfileRow } from "@/lib/supabase/database.types";
import { profileRowToUserPoints } from "@/lib/db/mappers";
import { historyRowToEntry } from "@/lib/db/mappers";
import { getOrCreateLearner, updateLearner } from "@/lib/db/repositories/learners";
import { upsertEmployeeFromRecord } from "@/lib/db/repositories/employees";
import { buildCurrentEmployeeRecordFromData } from "@/lib/db/build-employee-record";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserPointsProfile } from "@/lib/types/points";
import type { FrontDeskProgress } from "@/lib/types/course-progress";
import type { LevelTestProgress } from "@/lib/types/assessment";
import type { LearningHistoryEntry } from "@/lib/types/learning-record";
import type { LearnerSyncPayload } from "@/lib/db/mappers";

const EMPTY_FRONT_DESK: FrontDeskProgress = { completedNodeIds: [] };

async function loadProgressMap(learnerId: string): Promise<Record<string, unknown>> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("learning_progress")
    .select("progress_key, data")
    .eq("learner_id", learnerId);
  if (error) throw error;
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) {
    map[row.progress_key] = row.data;
  }
  return map;
}

async function upsertProgress(
  learnerId: string,
  progressKey: string,
  data: unknown
): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("learning_progress").upsert(
    {
      learner_id: learnerId,
      progress_key: progressKey,
      data: data as object,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "learner_id,progress_key" }
  );
  if (error) throw error;
}

export async function bootstrapLearner(
  learnerId: string | null
): Promise<{ learnerId: string; payload: LearnerBootstrapPayload }> {
  const learner = await getOrCreateLearner(learnerId);
  const progressMap = await loadProgressMap(learner.id);

  const db = getSupabaseAdmin();
  const { data: historyRows, error: historyError } = await db
    .from("learning_history")
    .select("*")
    .eq("learner_id", learner.id)
    .order("occurred_at", { ascending: false })
    .limit(500);
  if (historyError) throw historyError;

  const profile = profileRowToUserPoints(learner);

  return {
    learnerId: learner.id,
    payload: {
      profile,
      trialLessonsUsed: learner.trial_lessons_used,
      progress: {
        frontDesk: (progressMap[PROGRESS_KEYS.frontDesk] as FrontDeskProgress) ?? EMPTY_FRONT_DESK,
        cefrTests: (progressMap[PROGRESS_KEYS.cefrTests] as LevelTestProgress) ?? {},
        russianDaily: (progressMap[PROGRESS_KEYS.russianDaily] as Record<string, unknown>) ?? {},
        russianCampaign: (progressMap[PROGRESS_KEYS.russianCampaign] as Record<string, unknown>) ?? {},
        russianItems: (progressMap[PROGRESS_KEYS.russianItems] as Record<string, unknown>) ?? {},
        employeeTraining: (progressMap[PROGRESS_KEYS.employeeTraining] as Record<string, unknown>) ?? {},
        employeeMeta: (learner.employee_meta as Record<string, unknown>) ?? {},
        catalogLinks: (progressMap[PROGRESS_KEYS.catalogLinks] as Record<string, boolean>) ?? {},
      },
      history: (historyRows ?? []).map(historyRowToEntry),
    },
  };
}

export async function syncLearnerData(
  learnerId: string,
  body: LearnerSyncPayload
): Promise<void> {
  const learner = await getOrCreateLearner(learnerId);

  if (body.profile) {
    const hotelName = body.profile.hotel?.trim();
    let hotelId = learner.hotel_id;
    if (hotelName && hotelName !== "51HotelEnglish") {
      const { ensureHotel } = await import("@/lib/db/repositories/hotels");
      const hotel = await ensureHotel(hotelName);
      hotelId = hotel.id;
    }

    await updateLearner(learner.id, {
      nickname: body.profile.nickname,
      phone: body.profile.phone ?? "",
      hotel_name: body.profile.hotel,
      hotel_id: hotelId,
      total_points: body.profile.totalPoints,
      weekly_points: body.profile.weeklyPoints,
      week_start: body.profile.weekStart || null,
      cefr_level: body.profile.cefrLevel,
      assessment_score: body.profile.assessmentScore,
      points_history: body.profile.history,
      visited_courses: body.profile.visitedCourses,
      last_daily_bonus: body.profile.lastDailyBonus,
      hr_registered: body.profile.hrRegistered ?? false,
    });
  }

  if (typeof body.trialLessonsUsed === "number") {
    await updateLearner(learner.id, { trial_lessons_used: body.trialLessonsUsed });
  }

  if (body.progress) {
    const entries: [string, unknown][] = [
      [PROGRESS_KEYS.frontDesk, body.progress.frontDesk],
      [PROGRESS_KEYS.cefrTests, body.progress.cefrTests],
      [PROGRESS_KEYS.russianDaily, body.progress.russianDaily],
      [PROGRESS_KEYS.russianCampaign, body.progress.russianCampaign],
      [PROGRESS_KEYS.russianItems, body.progress.russianItems],
      [PROGRESS_KEYS.employeeTraining, body.progress.employeeTraining],
      [PROGRESS_KEYS.catalogLinks, body.progress.catalogLinks],
    ];
    for (const [key, data] of entries) {
      if (data !== undefined) await upsertProgress(learner.id, key, data);
    }
    if (body.progress.employeeMeta !== undefined) {
      await updateLearner(learner.id, {
        employee_meta: body.progress.employeeMeta as LearnerProfileRow["employee_meta"],
      });
    }
  }

  if (body.historyAppend?.length) {
    const db = getSupabaseAdmin();
    const rows = body.historyAppend.map((entry) => ({
      learner_id: learner.id,
      occurred_at: entry.at,
      phase: entry.phase,
      ask_dimension: entry.ask,
      title: entry.title,
      subtitle: entry.subtitle ?? null,
      node_id: entry.nodeId ?? null,
      score: entry.score ?? null,
    }));
    const { error } = await db.from("learning_history").insert(rows);
    if (error) throw error;
  }

  const record = buildCurrentEmployeeRecordFromData(
    body.profile ?? profileRowToUserPoints(learner),
    body.progress?.frontDesk ?? EMPTY_FRONT_DESK,
    (body.progress?.cefrTests as LevelTestProgress) ?? {}
  );

  if (record && record.hotel !== "51HotelEnglish" && body.profile?.hrRegistered) {
    await upsertEmployeeFromRecord(record);
  }
}

export async function appendHistoryEntries(
  learnerId: string,
  entries: Omit<LearningHistoryEntry, "id">[]
): Promise<void> {
  await syncLearnerData(learnerId, { historyAppend: entries });
}

export async function saveProfileToCloud(
  learnerId: string,
  profile: UserPointsProfile
): Promise<void> {
  await syncLearnerData(learnerId, { profile });
}
