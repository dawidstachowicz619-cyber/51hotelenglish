const BUILD_AT = process.env.NEXT_PUBLIC_BUILD_AT ?? "";

export function getBuildUpdateTime(): string | null {
  if (!BUILD_AT) return null;
  const date = new Date(BUILD_AT);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
}
