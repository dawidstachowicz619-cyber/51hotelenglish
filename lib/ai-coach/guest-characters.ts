/** 5 位 AI 对话客人形象（上半身肖像） */
export type AiGuestCharacter = {
  id: string;
  name: string;
  persona: string;
  /** 肖像图路径 */
  avatar: string;
  /** 图片焦点，确保露出上半身 */
  avatarPosition: string;
};

export const AI_GUEST_CHARACTERS: AiGuestCharacter[] = [
  {
    id: "anderson",
    name: "Mr. Anderson",
    persona: "商务常客，需要安静房间以便清晨 7 点开电话会议",
    avatar: "/images/ai-coach-guests/anderson.jpg",
    avatarPosition: "center 12%",
  },
  {
    id: "elena",
    name: "Elena",
    persona: "首次来华的俄罗斯游客，对交通和周边不熟悉",
    avatar: "/images/ai-coach-guests/elena.jpg",
    avatarPosition: "center 10%",
  },
  {
    id: "higgins",
    name: "Mrs. Higgins",
    persona: "带家人入住，发现浴室清洁不到位，情绪不满",
    avatar: "/images/ai-coach-guests/higgins.jpg",
    avatarPosition: "center 8%",
  },
  {
    id: "david",
    name: "David",
    persona: "航班延误 4 小时，凌晨 2 点疲惫抵达",
    avatar: "/images/ai-coach-guests/david.jpg",
    avatarPosition: "center 15%",
  },
  {
    id: "sarah",
    name: "Sarah",
    persona: "婚礼活动统筹人，需确认宴会厅布置与餐饮",
    avatar: "/images/ai-coach-guests/sarah.jpg",
    avatarPosition: "center 10%",
  },
];

const CHARACTER_MAP = new Map(AI_GUEST_CHARACTERS.map((c) => [c.id, c]));

export function getGuestCharacter(id: string): AiGuestCharacter | undefined {
  return CHARACTER_MAP.get(id);
}

export function getGuestAvatarByCharacter(characterId: string): string {
  return getGuestCharacter(characterId)?.avatar ?? AI_GUEST_CHARACTERS[0].avatar;
}

export function getGuestAvatarPosition(characterId: string): string {
  return getGuestCharacter(characterId)?.avatarPosition ?? "center 12%";
}
