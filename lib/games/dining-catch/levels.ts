import { HOTEL_RUSSIAN_DINING_ITEMS } from "@/lib/data/hotel-russian-dining-items";
import {
  DINING_ITEM_CATEGORY_LABELS,
  type DiningItemCategory,
  type HotelRussianDiningItem,
} from "@/lib/types/hotel-russian-dining-item";

export const DINING_CATCH_ROUNDS = 8;
export const DINING_CATCH_PASS_SCORE = 6;

const CATEGORY_EMOJI: Record<DiningItemCategory, string> = {
  food: "🍽️",
  beverages: "🥤",
  tableware: "🍽️",
  cutlery: "🍴",
  glassware: "🥂",
  condiments: "🧂",
  serving: "🛎️",
  linen: "🧻",
  service: "👨‍🍳",
  equipment: "🔥",
};

const LEVEL_CATEGORIES: DiningItemCategory[] = [
  "food",
  "beverages",
  "tableware",
  "cutlery",
  "glassware",
  "condiments",
  "serving",
  "linen",
  "service",
  "equipment",
];

export type DiningCatchLevel = {
  level: number;
  category: DiningItemCategory;
  title: string;
  subtitle: string;
  emoji: string;
  items: HotelRussianDiningItem[];
};

export const DINING_CATCH_LEVELS: DiningCatchLevel[] = LEVEL_CATEGORIES.map(
  (category, index) => ({
    level: index + 1,
    category,
    title: DINING_ITEM_CATEGORY_LABELS[category].zh,
    subtitle: DINING_ITEM_CATEGORY_LABELS[category].en,
    emoji: CATEGORY_EMOJI[category],
    items: HOTEL_RUSSIAN_DINING_ITEMS.filter((item) => item.category === category),
  })
);

export function getDiningCatchLevel(level: number): DiningCatchLevel | null {
  return DINING_CATCH_LEVELS.find((entry) => entry.level === level) ?? null;
}

export function pickRoundItems(
  pool: HotelRussianDiningItem[],
  count = 3
): { target: HotelRussianDiningItem; options: HotelRussianDiningItem[] } {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const distractors = shuffled.slice(1, count);
  const options = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, options };
}
