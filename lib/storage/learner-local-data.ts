import { FRONT_DESK_PROGRESS_KEY } from "@/lib/types/course-progress";
import { LEARNING_HISTORY_KEY } from "@/lib/types/learning-record";
import { RUSSIAN_CAMPAIGN_PROGRESS_KEY } from "@/lib/types/hotel-russian-campaign";
import { RUSSIAN_DAILY_CHECKIN_KEY } from "@/lib/types/russian-daily-checkin";
import { EMPLOYEE_TRAINING_PROGRESS_KEY } from "@/lib/types/hr-training";

const TRIAL_KEY = "51he-trial-lessons-used";
const META_KEY = "51he-employee-meta";
const CEFR_KEY = "cefr-level-tests";
const RUSSIAN_ITEMS_KEY = "51he-russian-items-progress";
const SEED_FLAG_KEY = "51he-main-account-learning-seeded";
const CATALOG_LINK_PROGRESS_KEY = "51he-catalog-link-progress";

const LEARNER_DATA_KEYS = [
  TRIAL_KEY,
  FRONT_DESK_PROGRESS_KEY,
  CEFR_KEY,
  RUSSIAN_DAILY_CHECKIN_KEY,
  RUSSIAN_CAMPAIGN_PROGRESS_KEY,
  RUSSIAN_ITEMS_KEY,
  EMPLOYEE_TRAINING_PROGRESS_KEY,
  META_KEY,
  LEARNING_HISTORY_KEY,
  SEED_FLAG_KEY,
  CATALOG_LINK_PROGRESS_KEY,
] as const;

export function clearLearnerLocalData(): void {
  if (typeof window === "undefined") return;
  for (const key of LEARNER_DATA_KEYS) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("course-progress-updated"));
  window.dispatchEvent(new Event("assessment-updated"));
  window.dispatchEvent(new Event("russian-daily-updated"));
  window.dispatchEvent(new Event("russian-campaign-updated"));
  window.dispatchEvent(new Event("russian-items-progress-updated"));
  window.dispatchEvent(new Event("employee-training-updated"));
  window.dispatchEvent(new Event("employee-meta-updated"));
  window.dispatchEvent(new Event("hr-registration-updated"));
}
