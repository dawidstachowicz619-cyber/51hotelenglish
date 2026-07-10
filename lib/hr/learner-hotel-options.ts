export const TRIAL_HOTEL_OPTION = "试用酒店";

const RESERVED_HOTEL_NAMES = new Set([
  TRIAL_HOTEL_OPTION.toLowerCase(),
  "51hotelenglish",
]);

export function isReservedHotelName(name: string): boolean {
  return RESERVED_HOTEL_NAMES.has(name.trim().toLowerCase());
}

export function isTrialHotel(name: string | null | undefined): boolean {
  return name?.trim() === TRIAL_HOTEL_OPTION;
}

/** 学员可选酒店：试用酒店置顶，其余为平台管理员录入的酒店 */
export function buildLearnerHotelOptions(adminHotels: string[]): string[] {
  const merged = new Set<string>([TRIAL_HOTEL_OPTION]);

  for (const hotel of adminHotels) {
    const trimmed = hotel.trim();
    if (!trimmed || isReservedHotelName(trimmed)) continue;
    merged.add(trimmed);
  }

  const rest = [...merged].filter((h) => h !== TRIAL_HOTEL_OPTION);
  rest.sort((a, b) => a.localeCompare(b, "zh-CN"));

  return [TRIAL_HOTEL_OPTION, ...rest];
}
