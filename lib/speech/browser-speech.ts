/** Web Speech 在 iOS / 微信 / 华为内置浏览器上常不可用 */
export function isWeChatBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MicroMessenger/i.test(navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|Mobile|HUAWEI|HONOR/i.test(ua);
}

export function isUnreliableWebSpeech(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent;
  if (/MicroMessenger/i.test(ua)) return true;
  if (/HuaweiBrowser|HUAWEI|HONOR|OpenHarmony/i.test(ua)) return true;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && !/Chrome\//i.test(ua)) return true;
  return false;
}
