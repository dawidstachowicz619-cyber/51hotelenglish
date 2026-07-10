import { PROGRESS_KEYS } from "@/lib/db/config";
import type { LearnerBootstrapPayload, LearnerSyncPayload } from "@/lib/db/mappers";
import { profileRowToUserPoints } from "@/lib/db/mappers";
import { bootstrapLearner, syncLearnerData } from "@/lib/db/repositories/learner-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LearnerProfileRow } from "@/lib/supabase/database.types";
import type { LevelTestProgress } from "@/lib/types/assessment";
import type { FrontDeskProgress } from "@/lib/types/course-progress";
import type { UserPointsProfile } from "@/lib/types/points";
import type { PointsEvent } from "@/lib/types/points";

function mergeFrontDesk(a: FrontDeskProgress, b: FrontDeskProgress): FrontDeskProgress {
  const ids = new Set([...a.completedNodeIds, ...b.completedNodeIds]);
  return { completedNodeIds: [...ids] };
}

function mergeCefrTests(a: LevelTestProgress, b: LevelTestProgress): LevelTestProgress {
  const merged: LevelTestProgress = { ...a };
  for (const [level, record] of Object.entries(b)) {
    const key = level as keyof LevelTestProgress;
    const existing = merged[key];
    if (!existing || (record && record.score > (existing.score ?? 0))) {
      merged[key] = record;
    }
  }
  return merged;
}

function mergeJsonRecords(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  return { ...a, ...b };
}

function mergeHistory(a: PointsEvent[], b: PointsEvent[]): PointsEvent[] {
  const seen = new Set<string>();
  const combined = [...a, ...b].sort(
    (x, y) => y.timestamp.localeCompare(x.timestamp)
  );
  const out: PointsEvent[] = [];
  for (const event of combined) {
    const key = `${event.action}-${event.timestamp}-${event.points}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(event);
  }
  return out.slice(0, 200);
}

function mergeProfiles(
  primary: UserPointsProfile,
  secondary: UserPointsProfile
): UserPointsProfile {
  return {
    ...primary,
    nickname: primary.nickname || secondary.nickname,
    hotel: primary.hotel || secondary.hotel,
    phone: primary.phone || secondary.phone,
    hrRegistered: primary.hrRegistered || secondary.hrRegistered,
    totalPoints: Math.max(primary.totalPoints, secondary.totalPoints),
    weeklyPoints: Math.max(primary.weeklyPoints, secondary.weeklyPoints),
    weekStart: primary.weekStart || secondary.weekStart,
    cefrLevel: primary.cefrLevel !== "—" ? primary.cefrLevel : secondary.cefrLevel,
    assessmentScore: Math.max(primary.assessmentScore, secondary.assessmentScore),
    history: mergeHistory(primary.history, secondary.history),
    lastDailyBonus: primary.lastDailyBonus || secondary.lastDailyBonus,
    visitedCourses: [
      ...new Set([...primary.visitedCourses, ...secondary.visitedCourses]),
    ],
  };
}

export async function mergeLearnerProfiles(
  canonicalId: string,
  secondaryId: string
): Promise<void> {
  if (canonicalId === secondaryId) return;

  const db = getSupabaseAdmin();
  const [{ data: canonical }, { data: secondary }] = await Promise.all([
    db.from("learner_profiles").select("*").eq("id", canonicalId).single(),
    db.from("learner_profiles").select("*").eq("id", secondaryId).single(),
  ]);

  if (!canonical || !secondary) return;

  const canonicalPayload = await bootstrapLearner(canonicalId);
  const secondaryPayload = await bootstrapLearner(secondaryId);

  const mergedProfile = mergeProfiles(
    canonicalPayload.payload.profile,
    secondaryPayload.payload.profile
  );
  mergedProfile.userId = canonicalId;

  const mergedProgress: LearnerSyncPayload["progress"] = {
    frontDesk: mergeFrontDesk(
      canonicalPayload.payload.progress.frontDesk,
      secondaryPayload.payload.progress.frontDesk
    ),
    cefrTests: mergeCefrTests(
      canonicalPayload.payload.progress.cefrTests,
      secondaryPayload.payload.progress.cefrTests
    ),
    russianDaily: mergeJsonRecords(
      canonicalPayload.payload.progress.russianDaily,
      secondaryPayload.payload.progress.russianDaily
    ),
    russianCampaign: mergeJsonRecords(
      canonicalPayload.payload.progress.russianCampaign,
      secondaryPayload.payload.progress.russianCampaign
    ),
    russianItems: mergeJsonRecords(
      canonicalPayload.payload.progress.russianItems,
      secondaryPayload.payload.progress.russianItems
    ),
    employeeTraining: mergeJsonRecords(
      canonicalPayload.payload.progress.employeeTraining,
      secondaryPayload.payload.progress.employeeTraining
    ),
    employeeMeta: mergeJsonRecords(
      canonicalPayload.payload.progress.employeeMeta,
      secondaryPayload.payload.progress.employeeMeta
    ),
  };

  const trialLessonsUsed = Math.max(
    canonicalPayload.payload.trialLessonsUsed,
    secondaryPayload.payload.trialLessonsUsed
  );

  await syncLearnerData(canonicalId, {
    profile: mergedProfile,
    progress: mergedProgress,
    trialLessonsUsed,
  });

  await db.from("learning_progress").delete().eq("learner_id", secondaryId);
  await db.from("learning_history").delete().eq("learner_id", secondaryId);
  await db
    .from("employees")
    .update({ learner_profile_id: canonicalId })
    .eq("learner_profile_id", secondaryId);
  await db.from("learner_profiles").delete().eq("id", secondaryId);
}

export async function linkAuthUserToLearner(
  authUserId: string,
  cookieLearnerId: string | null,
  phone?: string
): Promise<{ learnerId: string; payload: LearnerBootstrapPayload }> {
  const db = getSupabaseAdmin();
  const normalizedPhone = phone?.trim().replace(/\s|-/g, "").replace(/^\+86/, "") ?? "";

  const { data: byAuth } = await db
    .from("learner_profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  let canonicalId = byAuth?.id ?? null;

  if (!canonicalId && normalizedPhone) {
    const { data: byPhone } = await db
      .from("learner_profiles")
      .select("*")
      .eq("phone", normalizedPhone)
      .maybeSingle();
    canonicalId = byPhone?.id ?? null;
  }

  if (!canonicalId && cookieLearnerId) {
    const { data: byCookie } = await db
      .from("learner_profiles")
      .select("*")
      .eq("id", cookieLearnerId)
      .maybeSingle();
    canonicalId = byCookie?.id ?? null;
  }

  if (!canonicalId) {
    const { data: created, error } = await db
      .from("learner_profiles")
      .insert({
        auth_user_id: authUserId,
        phone: normalizedPhone,
      })
      .select("*")
      .single();
    if (error) throw error;
    canonicalId = created.id;
  } else {
    const patch: Partial<LearnerProfileRow> = { auth_user_id: authUserId };
    if (normalizedPhone) patch.phone = normalizedPhone;
    await db.from("learner_profiles").update(patch).eq("id", canonicalId);
  }

  if (cookieLearnerId && cookieLearnerId !== canonicalId) {
    await mergeLearnerProfiles(canonicalId, cookieLearnerId);
  }

  const { learnerId, payload } = await bootstrapLearner(canonicalId);
  return { learnerId, payload };
}

export async function resolveLearnerForSession(
  authUserId: string | null,
  cookieLearnerId: string | null
): Promise<{ learnerId: string; payload: LearnerBootstrapPayload }> {
  if (authUserId) {
    return linkAuthUserToLearner(authUserId, cookieLearnerId);
  }
  return bootstrapLearner(cookieLearnerId);
}
