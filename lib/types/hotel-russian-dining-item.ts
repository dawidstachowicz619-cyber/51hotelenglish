export type DiningItemCategory =
  | "tableware"
  | "cutlery"
  | "glassware"
  | "linen"
  | "serving"
  | "condiments"
  | "beverages"
  | "food"
  | "service"
  | "equipment";

export type HotelRussianDiningItem = {
  id: string;
  category: DiningItemCategory;
  chinese: string;
  russian: string;
  transliteration: string;
  english: string;
  /** AI 配图提示词 */
  imagePrompt: string;
};

export const DINING_ITEM_CATEGORY_LABELS: Record<
  DiningItemCategory,
  { zh: string; en: string }
> = {
  tableware: { zh: "餐具", en: "Tableware" },
  cutlery: { zh: "刀叉", en: "Cutlery" },
  glassware: { zh: "杯具", en: "Glassware" },
  linen: { zh: "餐巾桌布", en: "Linen" },
  serving: { zh: "上菜用具", en: "Serving" },
  condiments: { zh: "调味品", en: "Condiments" },
  beverages: { zh: "饮品", en: "Beverages" },
  food: { zh: "常见食物", en: "Food" },
  service: { zh: "服务", en: "Service" },
  equipment: { zh: "餐饮设备", en: "Equipment" },
};

export function diningItemImagePath(id: string): string {
  return `/images/russian-dining-items/${id}.png`;
}
