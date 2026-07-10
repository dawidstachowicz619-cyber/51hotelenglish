export const HR_COURSE_LOCK_HINT = "联系企业 HR后台开通账号";

export const HR_REGISTRATION_MESSAGE =
  "您尚未在企业 HR 后台完成注册，暂无法学习课程。请联系所在酒店人力资源部，在 HR 后台录入您的姓名与手机号；注册成功后刷新页面即可学习。";

export type LearningCompletionBlock = "hr_registration_required";

export type LearningCompletionResult<T> =
  | { ok: true; data: T }
  | { ok: false; block: LearningCompletionBlock };

/** @deprecated 已不再提供体验课，保留常量避免旧数据报错 */
export const TRIAL_LESSON_LIMIT = 0;

export const HR_REGISTRATION_EVENT = "hr-registration-required";
