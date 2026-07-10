export const TRIAL_LESSON_LIMIT = 1;

export const HR_REGISTRATION_EVENT = "hr-registration-required";

export const HR_REGISTRATION_MESSAGE =
  "您尚未完成企业 HR 后台注册，体验课额度（1 课）已用完。前厅英语、CEFR 测评等所有英语课程均需 HR 注册后方可继续学习。请联系所在酒店人力资源部，在 HR 后台录入您的姓名与手机号；注册成功后刷新页面即可继续学习。";

export type LearningCompletionBlock = "hr_registration_required";

export type LearningCompletionResult<T> =
  | { ok: true; data: T }
  | { ok: false; block: LearningCompletionBlock };
