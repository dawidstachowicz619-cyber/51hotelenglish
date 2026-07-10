/** Supabase 客户端已配置即可使用手机号 OTP 登录 */
export function isPhoneAuthAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** 学员登录（账号密码 / 验证码）是否可用 */
export function isLearnerAuthAvailable(): boolean {
  return true;
}

export function isPhoneOtpAvailable(): boolean {
  return isPhoneAuthAvailable();
}
