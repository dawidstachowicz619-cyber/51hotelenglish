/** Cloud storage is enabled when Supabase is configured and flag is on. */
export function isCloudStorageEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_CLOUD_STORAGE === "true" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isCloudStorageEnabledClient(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_CLOUD_STORAGE === "true" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export const LEARNER_COOKIE = "51he_learner_id";
export const HR_SESSION_COOKIE = "51he_hr_session";

export const PROGRESS_KEYS = {
  frontDesk: "front_desk",
  cefrTests: "cefr_tests",
  russianDaily: "russian_daily",
  russianCampaign: "russian_campaign",
  russianItems: "russian_items",
  employeeTraining: "employee_training",
} as const;

export type ProgressKey = (typeof PROGRESS_KEYS)[keyof typeof PROGRESS_KEYS];
