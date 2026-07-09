export type RoomItemCategory =
  | "bedding"
  | "bathroom"
  | "toiletries"
  | "furniture"
  | "electronics"
  | "cleaning"
  | "minibar"
  | "desk"
  | "room"
  | "safety";

export type HotelRussianRoomItem = {
  id: string;
  category: RoomItemCategory;
  chinese: string;
  russian: string;
  transliteration: string;
  english: string;
  /** AI 配图提示词 */
  imagePrompt: string;
};

export const ROOM_ITEM_CATEGORY_LABELS: Record<
  RoomItemCategory,
  { zh: string; en: string }
> = {
  bedding: { zh: "床品", en: "Bedding" },
  bathroom: { zh: "浴室", en: "Bathroom" },
  toiletries: { zh: "洗漱用品", en: "Toiletries" },
  furniture: { zh: "家具", en: "Furniture" },
  electronics: { zh: "电器", en: "Electronics" },
  cleaning: { zh: "清洁", en: "Cleaning" },
  minibar: { zh: "迷你吧", en: "Minibar" },
  desk: { zh: "文具", en: "Desk" },
  room: { zh: "房间设施", en: "Room" },
  safety: { zh: "安全", en: "Safety" },
};

export function roomItemImagePath(id: string): string {
  return `/images/russian-room-items/${id}.png`;
}
