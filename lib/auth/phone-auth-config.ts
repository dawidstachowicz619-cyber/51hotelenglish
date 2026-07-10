/** Supabase 客户端已配置即可使用手机号 OTP 登录 */
export function isPhoneAuthAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
