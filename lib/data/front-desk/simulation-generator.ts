import type {
  CefrLevel,
  DialogueLine,
  ScenarioItem,
  ScenarioStep,
  WorkScenario,
} from "@/lib/types/course";
import { CEFR_LEVELS } from "@/lib/types/course";
import {
  DEPARTMENT_BY_ID,
  FRONT_DESK_DEPARTMENTS,
  type FrontDeskDepartmentId,
} from "@/lib/types/front-desk-department";

export const SIMULATIONS_PER_LEVEL = 50;

type CategoryId =
  | "check-in"
  | "check-out"
  | "guest-inquiry"
  | "reservation-walkin"
  | "special-requests"
  | "problem-solving"
  | "vip-group"
  | "crisis-management";

const CATEGORY_TITLES: Record<CategoryId, string> = {
  "check-in": "办理入住",
  "check-out": "办理退房",
  "guest-inquiry": "问询与指引",
  "reservation-walkin": "预订与散客",
  "special-requests": "特殊请求",
  "problem-solving": "问题处理",
  "vip-group": "VIP与团体",
  "crisis-management": "危机处理",
};

/** 每个 CEFR 级别 50 个模拟场景的工作场景分配 */
const LEVEL_DISTRIBUTION: Record<CefrLevel, Partial<Record<CategoryId, number>>> =
  {
    A1: { "guest-inquiry": 50 },
    A2: {
      "check-in": 14,
      "check-out": 10,
      "guest-inquiry": 10,
      "reservation-walkin": 10,
      "problem-solving": 6,
    },
    B1: {
      "check-in": 8,
      "check-out": 8,
      "guest-inquiry": 4,
      "reservation-walkin": 4,
      "special-requests": 12,
      "problem-solving": 10,
      "vip-group": 4,
    },
    B2: {
      "check-in": 6,
      "check-out": 6,
      "guest-inquiry": 2,
      "reservation-walkin": 2,
      "special-requests": 10,
      "problem-solving": 10,
      "vip-group": 10,
      "crisis-management": 4,
    },
    C1: {
      "check-in": 4,
      "check-out": 4,
      "special-requests": 6,
      "problem-solving": 10,
      "vip-group": 14,
      "crisis-management": 12,
    },
  };

const GUEST_NAMES = [
  "Mr. Chen",
  "Ms. Wang",
  "Mr. Liu",
  "Ms. Zhang",
  "Mr. Anderson",
  "Ms. Li",
  "Mr. Tanaka",
  "Ms. Kim",
  "Mr. Smith",
  "Ms. Garcia",
];

const TIMES = [
  "7:30 AM",
  "10:00 AM",
  "2:00 PM",
  "6:00 PM",
  "9:30 PM",
  "11:00 PM",
];

const FLOORS = ["3rd", "8th", "12th", "15th", "18th", "22nd"];

type ScenarioBlueprint = {
  title: string;
  setting: string;
  description: string;
  objectives: string[];
  keyPhrases: ScenarioStep[];
  sampleDialogue: DialogueLine[];
};

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function guestLine(level: CefrLevel, index: number, simple: string, complex: string): string {
  if (level === "A1" || level === "A2") return simple;
  if (level === "B1") return index % 2 === 0 ? simple : complex;
  return complex;
}

function staffLine(level: CefrLevel, index: number, simple: string, complex: string): string {
  if (level === "A1" || level === "A2") return simple;
  if (level === "B1") return index % 3 === 0 ? complex : simple;
  return complex;
}

function buildCheckIn(level: CefrLevel, index: number): ScenarioBlueprint {
  const guest = pick(GUEST_NAMES, index);
  const floor = pick(FLOORS, index);
  const variants = [
    {
      title: `有预订客人办理入住 #${index + 1}`,
      setting: `Front desk, ${pick(TIMES, index)} — guest with confirmed reservation`,
      description: `${guest} 到达前台办理入住。需核对预订、收取证件、说明房号与早餐信息。`,
      objectives: ["欢迎问候", "核对预订与证件", "发放房卡并介绍设施"],
      keyPhrases: [
        { english: "Welcome to Grand Horizon Hotel.", chinese: "欢迎光临 Grand Horizon 酒店。" },
        { english: "May I see your passport, please?", chinese: "请出示您的护照。" },
        { english: `Your room is on the ${floor} floor.`, chinese: `您的房间在 ${floor.replace(/\D/g, "")} 楼。` },
      ],
      sampleDialogue: [
        {
          speaker: "guest" as const,
          english: guestLine(level, index, "I have a reservation.", "Good evening. I have a reservation under the name " + guest.split(" ")[1] + "."),
          chinese: "我有预订。",
        },
        {
          speaker: "staff" as const,
          english: staffLine(level, index, "Welcome. May I have your name?", "Good evening. Welcome to Grand Horizon. May I have your reservation name and passport, please?"),
          chinese: "欢迎光临。请问您的预订姓名？",
        },
      ],
    },
    {
      title: `确认房型偏好 #${index + 1}`,
      setting: `Front desk — guest requests room preference`,
      description: `客人在入住时提出无烟房/高楼层/安静房间等偏好，需记录并在系统中确认。`,
      objectives: ["询问并记录偏好", "确认能否满足", "告知若无法满足时的替代方案"],
      keyPhrases: [
        { english: "Would you prefer a non-smoking room?", chinese: "您需要无烟房吗？" },
        { english: "I've noted your preference for a high floor.", chinese: "我已记录您的高楼层偏好。" },
        { english: "Let me check what we have available.", chinese: "让我查一下可用房态。" },
      ],
      sampleDialogue: [
        {
          speaker: "guest" as const,
          english: guestLine(level, index, "Non-smoking room, please.", "I'd prefer a quiet, non-smoking room on a higher floor if possible."),
          chinese: "请安排无烟房。",
        },
        {
          speaker: "staff" as const,
          english: staffLine(level, index, "OK. Non-smoking room.", "Certainly. I've noted a quiet, non-smoking room on the " + floor + " floor for you."),
          chinese: "好的，已为您安排无烟房。",
        },
      ],
    },
    {
      title: `信用卡预授权说明 #${index + 1}`,
      setting: `Front desk during check-in — payment authorization`,
      description: `入住时需要向客人说明信用卡预授权政策及杂费处理方式。`,
      objectives: ["清晰说明预授权金额", "解释杂费结算方式", "获得客人确认"],
      keyPhrases: [
        { english: "We need to pre-authorize your card for incidentals.", chinese: "我们需要对您的信用卡进行杂费预授权。" },
        { english: "Room charges are prepaid; incidentals are charged at checkout.", chinese: "房费已预付，杂费退房时结算。" },
        { english: "The hold will be released within 3–5 business days.", chinese: "预授权将在 3–5 个工作日内解除。" },
      ],
      sampleDialogue: [
        {
          speaker: "staff" as const,
          english: staffLine(level, index, "Please sign here for the deposit.", "Your card will be pre-authorized for incidentals. May I swipe your card, please?"),
          chinese: "请刷卡进行预授权。",
        },
        {
          speaker: "guest" as const,
          english: guestLine(level, index, "How much?", "Could you explain what incidentals might be charged?"),
          chinese: "预授权多少？",
        },
      ],
    },
  ];
  return pick(variants, index);
}

function buildCheckOut(level: CefrLevel, index: number): ScenarioBlueprint {
  const variants = [
    {
      title: `标准退房结账 #${index + 1}`,
      setting: `Front desk, ${pick(TIMES, index)} — guest checking out`,
      description: `客人到前台退房。需确认房号、打印账单、处理付款并礼貌送别。`,
      objectives: ["确认房号与账单", "说明消费明细", "完成送别"],
      keyPhrases: [
        { english: "May I have your room number, please?", chinese: "请问您的房号？" },
        { english: "Your total is 980 yuan.", chinese: "总计 980 元。" },
        { english: "Thank you for staying with us.", chinese: "感谢您的入住。" },
      ],
      sampleDialogue: [
        {
          speaker: "guest" as const,
          english: guestLine(level, index, "Check out, please. Room 1208.", "I'd like to check out. Room 1208 under Wang."),
          chinese: "我要退房，1208 房。",
        },
        {
          speaker: "staff" as const,
          english: staffLine(level, index, "Total is 980 yuan.", "Certainly, Mr. Wang. Your bill includes one minibar charge. The total is 980 yuan."),
          chinese: "总计 980 元，含一项迷你吧消费。",
        },
      ],
    },
    {
      title: `延迟退房请求 #${index + 1}`,
      setting: `Front desk — guest requests late check-out`,
      description: `客人因行程原因申请延迟退房，需查询房态并说明政策。`,
      objectives: ["了解延迟需求", "查询房态", "说明是否收费"],
      keyPhrases: [
        { english: "Our standard check-out is at noon.", chinese: "标准退房时间为中午 12 点。" },
        { english: "Let me check if we can extend your check-out.", chinese: "让我查一下能否为您延迟退房。" },
        { english: "We can extend until 4 PM at no charge.", chinese: "可免费延迟到下午 4 点。" },
      ],
      sampleDialogue: [
        {
          speaker: "guest" as const,
          english: guestLine(level, index, "Can I check out late?", "My flight is at 9 PM. Is late check-out possible until 4 PM?"),
          chinese: "可以延迟退房吗？",
        },
        {
          speaker: "staff" as const,
          english: staffLine(level, index, "Yes, until 4 PM.", "Let me check... Good news, we can extend to 4 PM at no extra charge today."),
          chinese: "可以，免费延迟到下午 4 点。",
        },
      ],
    },
  ];
  return pick(variants, index);
}

function buildGuestInquiry(level: CefrLevel, index: number): ScenarioBlueprint {
  const facilities = [
    { en: "breakfast", cn: "早餐", loc: "2nd floor", time: "7:00–10:30 AM" },
    { en: "gym", cn: "健身房", loc: "3rd floor", time: "6:00 AM–10:00 PM" },
    { en: "pool", cn: "游泳池", loc: "5th floor", time: "7:00 AM–9:00 PM" },
    { en: "restaurant", cn: "餐厅", loc: "1st floor", time: "11:30 AM–10:00 PM" },
    { en: "spa", cn: "水疗中心", loc: "4th floor", time: "10:00 AM–9:00 PM" },
  ];
  const f = pick(facilities, index);
  return {
    title: `询问${f.cn}信息 #${index + 1}`,
    setting: `Lobby / front desk — guest asks about ${f.en}`,
    description: `客人询问${f.cn}的位置与开放时间，需用${level === "A1" ? "简单" : "清晰"}英语回答。`,
    objectives: [`说明${f.cn}位置`, "告知开放时间", "确认客人是否还有其他问题"],
    keyPhrases: [
      { english: `The ${f.en} is on the ${f.loc}.`, chinese: `${f.cn}在${f.loc.replace("floor", "楼")}。` },
      { english: `It is open from ${f.time}.`, chinese: `开放时间为 ${f.time}。` },
      { english: "Is there anything else I can help with?", chinese: "还有什么可以帮您的吗？" },
    ],
    sampleDialogue: [
      {
        speaker: "guest" as const,
        english: level === "A1" ? `Where is the ${f.en}?` : `Excuse me, could you tell me where the ${f.en} is and what time it opens?`,
        chinese: `${f.cn}在哪里？`,
      },
      {
        speaker: "staff" as const,
        english: level === "A1" ? `The ${f.en} is on the ${f.loc}.` : `The ${f.en} is on the ${f.loc}, open ${f.time}. Towels are provided at the entrance.`,
        chinese: `${f.cn}在${f.loc.replace("floor", "楼")}，${f.time} 开放。`,
      },
    ],
  };
}

function buildReservation(level: CefrLevel, index: number): ScenarioBlueprint {
  return {
    title: `散客订房 #${index + 1}`,
    setting: `Front desk, ${pick(TIMES, index)} — walk-in guest`,
    description: `无预订散客希望当晚入住。需查询房态、报价并完成登记。`,
    objectives: ["查询当晚房态", "报价并说明含早政策", "完成 walk-in 登记"],
    keyPhrases: [
      { english: "Let me check availability for tonight.", chinese: "让我查询今晚的空房。" },
      { english: "We have a twin room at 680 yuan including breakfast.", chinese: "双床房 680 元，含早餐。" },
      { english: "May I see your ID, please?", chinese: "请出示证件。" },
    ],
    sampleDialogue: [
      {
        speaker: "guest" as const,
        english: guestLine(level, index, "Any rooms tonight?", "I don't have a reservation. Do you have any rooms available for tonight?"),
        chinese: "今晚还有房间吗？",
      },
      {
        speaker: "staff" as const,
        english: staffLine(level, index, "Yes, 680 yuan.", "Yes, we have one twin room at 680 yuan per night, breakfast included."),
        chinese: "有的，双床房 680 元含早。",
      },
    ],
  };
}

function buildSpecialRequests(level: CefrLevel, index: number): ScenarioBlueprint {
  const types = [
    {
      title: "提前入住",
      desc: "客人早于标准时间到达，需协调提前入住或提供等候方案。",
      guest: "I arrived early. Can I check in now?",
      staff: "Let me check early check-in availability. You're welcome to store luggage in the meantime.",
    },
    {
      title: "加床/婴儿床",
      desc: "客人需要额外加床或婴儿床，需确认房型和费用。",
      guest: "We need an extra bed for our child.",
      staff: "I'll arrange an extra bed. There is an additional charge of 200 yuan per night.",
    },
    {
      title: "房间升级",
      desc: "向合适客人推荐房型升级并说明权益。",
      guest: "What's the difference between deluxe and executive rooms?",
      staff: "The executive room includes lounge access, complimentary breakfast, and afternoon tea.",
    },
    {
      title: "过敏/特殊饮食",
      desc: "客人告知过敏或饮食限制，需记录并通知相关部门。",
      guest: "I have a severe nut allergy. Can the hotel accommodate this?",
      staff: "I've noted your allergy in your profile and will inform the restaurant and housekeeping.",
    },
  ];
  const t = pick(types, index);
  return {
    title: `${t.title} #${index + 1}`,
    setting: `Front desk — special request handling`,
    description: t.desc,
    objectives: ["倾听并确认需求", "说明可行方案与费用", "记录并在系统中备注"],
    keyPhrases: [
      { english: "Let me see what we can do for you.", chinese: "让我看看能为您做什么。" },
      { english: "I've noted this in your reservation.", chinese: "我已在预订中备注。" },
      { english: "I'll notify the relevant department immediately.", chinese: "我会立即通知相关部门。" },
    ],
    sampleDialogue: [
      { speaker: "guest", english: t.guest, chinese: "（客人特殊需求）" },
      { speaker: "staff", english: t.staff, chinese: "（前台回应）" },
    ],
  };
}

function buildProblemSolving(level: CefrLevel, index: number): ScenarioBlueprint {
  const types = [
    {
      title: "房卡遗失",
      desc: "客人遗失房卡，需核实身份、停用旧卡并补发。",
      guest: "I lost my key card.",
      staff: "I'll deactivate the old card and issue a new one. There is a 50 yuan replacement fee.",
    },
    {
      title: "房间未打扫",
      desc: "客人投诉房间清洁问题，需道歉并立即安排处理。",
      guest: "My room hasn't been cleaned yet.",
      staff: "I sincerely apologize. I'll send housekeeping immediately and offer a complimentary drink.",
    },
    {
      title: "空调/设备故障",
      desc: "客人反映房间设备故障，需安排维修或换房。",
      guest: "The air conditioning is not working.",
      staff: "I'm very sorry. Maintenance is on the way. If not fixed in 30 minutes, we'll move you to another room.",
    },
    {
      title: "噪音投诉",
      desc: "客人投诉邻居噪音，需协调安保或换房。",
      guest: "There's loud noise from the next room.",
      staff: "I'll contact security immediately and offer you a room change if the issue persists.",
    },
    {
      title: "账单争议",
      desc: "客人对账单有异议，需逐项核对并解释。",
      guest: "I don't recognize this minibar charge.",
      staff: "Let me pull up the details. If this is an error, I'll remove it immediately.",
    },
  ];
  const t = pick(types, index);
  return {
    title: `${t.title} #${index + 1}`,
    setting: `Front desk — service recovery`,
    description: t.desc,
    objectives: ["真诚道歉并倾听", "提出具体解决方案", "跟进确保满意"],
    keyPhrases: [
      { english: "I sincerely apologize for the inconvenience.", chinese: "对于不便，我深表歉意。" },
      { english: "Let me resolve this for you immediately.", chinese: "请允许我立即为您处理。" },
      { english: "I'll personally follow up to ensure it's resolved.", chinese: "我会亲自跟进确保解决。" },
    ],
    sampleDialogue: [
      { speaker: "guest", english: t.guest, chinese: "（客人投诉）" },
      { speaker: "staff", english: t.staff, chinese: "（前台处理）" },
    ],
  };
}

function buildVipGroup(level: CefrLevel, index: number): ScenarioBlueprint {
  const types = [
    {
      title: "VIP 回头客",
      desc: "Platinum 会员抵达，需个性化问候并安排升级礼遇。",
      guest: "Good evening. Anderson checking in.",
      staff: "Welcome back, Mr. Anderson. Your corner suite is ready with your preferred amenities.",
    },
    {
      title: "团体会议入住",
      desc: "20 间会议团同时抵达，需核对 rooming list 与 master account。",
      guest: "I'm the coordinator for the Tech Summit group, 20 rooms.",
      staff: "Welcome. Please proceed to the group counter. Room charges go to the master account.",
    },
    {
      title: "行政楼层接待",
      desc: "行政套房客人需说明酒廊权益与专属服务。",
      guest: "What benefits do executive floor guests receive?",
      staff: "You'll enjoy lounge access, complimentary breakfast, afternoon tea, and a dedicated concierge.",
    },
    {
      title: "欢迎礼遇安排",
      desc: "为 VIP 准备欢迎水果、卡片或定制礼品。",
      guest: "It's our anniversary. Any special touches available?",
      staff: "Congratulations! I've arranged a complimentary amenity and a handwritten card in your room.",
    },
  ];
  const t = pick(types, index);
  return {
    title: `${t.title} #${index + 1}`,
    setting: `Front desk / lobby — VIP or group service`,
    description: t.desc,
    objectives: ["识别 VIP/团体身份", "提供个性化或批量高效服务", "超越期望的细节安排"],
    keyPhrases: [
      { english: "Welcome back. It's a pleasure to see you again.", chinese: "欢迎回来，很高兴再次见到您。" },
      { english: "We've prepared your preferred room.", chinese: "我们已备好您的偏好房间。" },
      { english: "Please proceed to the VIP check-in counter.", chinese: "请前往 VIP 入住通道。" },
    ],
    sampleDialogue: [
      { speaker: "guest", english: t.guest, chinese: "（客人）" },
      { speaker: "staff", english: t.staff, chinese: "（前台）" },
    ],
  };
}

function buildCrisis(level: CefrLevel, index: number): ScenarioBlueprint {
  const types = [
    {
      title: "超订处理",
      desc: "已确认预订无法入住，需提供替代住宿与补偿。",
      guest: "I confirmed weeks ago. How can you not have a room?",
      staff: "You are right to be upset. We've secured a suite at our partner hotel, transportation covered, tonight complimentary.",
    },
    {
      title: "重大投诉升级",
      desc: "客人要求见经理，需冷静应对并升级处理。",
      guest: "This is unacceptable. I want to speak to your manager.",
      staff: "I completely understand. Our duty manager will be with you in five minutes.",
    },
    {
      title: "媒体/敏感客人",
      desc: "知名人士入住需确保隐私与安保协调。",
      guest: "I require complete privacy during my stay.",
      staff: "Understood. I've flagged your profile for discreet handling and limited staff access.",
    },
    {
      title: "自然灾害/停电",
      desc: "酒店突发状况，需安抚客人并说明应急方案。",
      guest: "The power went out. What's happening?",
      staff: "We apologize. Backup generators are active. Guest safety is our priority; updates every 15 minutes.",
    },
  ];
  const t = pick(types, index);
  return {
    title: `${t.title} #${index + 1}`,
    setting: `Front desk — high-pressure crisis scenario`,
    description: t.desc,
    objectives: ["保持专业冷静", "承担责任不推诿", "提供明确解决方案与补偿"],
    keyPhrases: [
      { english: "I take full responsibility for resolving this.", chinese: "我承担全部责任，一定为您解决。" },
      { english: "Here is our immediate action plan.", chinese: "以下是我们立即的行动方案。" },
      { english: "Our manager will follow up with a written response.", chinese: "经理将书面跟进处理结果。" },
    ],
    sampleDialogue: [
      { speaker: "guest", english: t.guest, chinese: "（客人）" },
      { speaker: "staff", english: t.staff, chinese: "（前台）" },
    ],
  };
}

const BUILDERS: Record<
  CategoryId,
  (level: CefrLevel, index: number) => ScenarioBlueprint
> = {
  "check-in": buildCheckIn,
  "check-out": buildCheckOut,
  "guest-inquiry": buildGuestInquiry,
  "reservation-walkin": buildReservation,
  "special-requests": buildSpecialRequests,
  "problem-solving": buildProblemSolving,
  "vip-group": buildVipGroup,
  "crisis-management": buildCrisis,
};

function buildScenarioItem(
  level: CefrLevel,
  categoryId: CategoryId,
  indexInCategory: number,
  simulationNumber: number,
  departmentId?: FrontDeskDepartmentId
): ScenarioItem {
  const blueprint = BUILDERS[categoryId](level, indexInCategory);
  const id = departmentId
    ? `sim-${departmentId}-${level}-${categoryId}-${indexInCategory + 1}`
    : `sim-${level}-${categoryId}-${indexInCategory + 1}`;
  return {
    id,
    title: blueprint.title,
    setting: blueprint.setting,
    description: blueprint.description,
    objectives: blueprint.objectives,
    keyPhrases: blueprint.keyPhrases,
    sampleDialogue: blueprint.sampleDialogue,
    categoryId,
    categoryTitle: CATEGORY_TITLES[categoryId],
    simulationNumber,
  };
}

/** 将 50 个模拟场景均分到岗位下的各工作场景类别 */
export function getDepartmentCategoryDistribution(
  departmentId: FrontDeskDepartmentId,
  level: CefrLevel
): Partial<Record<CategoryId, number>> {
  const categories = (DEPARTMENT_BY_ID[departmentId]?.scenarioIds ??
    []) as CategoryId[];
  if (categories.length === 0) return {};

  const base = Math.floor(SIMULATIONS_PER_LEVEL / categories.length);
  const remainder = SIMULATIONS_PER_LEVEL % categories.length;
  const distribution: Partial<Record<CategoryId, number>> = {};

  categories.forEach((categoryId, index) => {
    distribution[categoryId] = base + (index < remainder ? 1 : 0);
  });

  return distribution;
}

function generateDepartmentLevelSimulations(
  departmentId: FrontDeskDepartmentId,
  level: CefrLevel
): ScenarioItem[] {
  const distribution = getDepartmentCategoryDistribution(departmentId, level);
  const scenarios: ScenarioItem[] = [];
  let simulationNumber = 0;

  for (const [categoryId, count] of Object.entries(distribution) as [
    CategoryId,
    number,
  ][]) {
    for (let i = 0; i < count; i++) {
      simulationNumber++;
      scenarios.push(
        buildScenarioItem(
          level,
          categoryId,
          i,
          simulationNumber,
          departmentId
        )
      );
    }
  }

  return scenarios;
}

const deptSimulationCache: Partial<Record<string, ScenarioItem[]>> = {};

export function invalidateSimulationCache(): void {
  for (const key of Object.keys(deptSimulationCache)) {
    delete deptSimulationCache[key];
  }
}

export function getDepartmentLevelSimulations(
  departmentId: FrontDeskDepartmentId,
  level: CefrLevel
): ScenarioItem[] {
  const key = `${departmentId}:${level}`;
  if (!deptSimulationCache[key]) {
    deptSimulationCache[key] = generateDepartmentLevelSimulations(
      departmentId,
      level
    );
  }
  const base = deptSimulationCache[key]!;

  if (typeof window === "undefined") return base;

  const { getSimulationOverridesForScenario, applySimulationPatch } =
    require("@/lib/course/course-content-overrides") as typeof import("@/lib/course/course-content-overrides");

  const { getPublishedGeneratedCourses } =
    require("@/lib/course/generated-course-storage") as typeof import("@/lib/course/generated-course-storage");

  const withOverrides = base.map((sim) => {
    const cat = sim.categoryId;
    if (!cat) return sim;
    const overrides = getSimulationOverridesForScenario(cat);
    return applySimulationPatch(sim, overrides[sim.id]);
  });

  const generatedSims = getPublishedGeneratedCourses()
    .filter((c) => c.departmentId === departmentId)
    .flatMap((c) => c.levels[level]?.simulations ?? []);

  return [...withOverrides, ...generatedSims];
}

function getMaxCategoryCountForLevel(
  level: CefrLevel,
  categoryId: CategoryId
): number {
  let max = 0;
  for (const dept of FRONT_DESK_DEPARTMENTS) {
    if (!dept.scenarioIds.includes(categoryId)) continue;
    const count = getDepartmentCategoryDistribution(dept.id, level)[categoryId];
    max = Math.max(max, count ?? 0);
  }
  return max;
}

function generateCategorySimulations(
  level: CefrLevel,
  categoryId: CategoryId,
  count: number
): ScenarioItem[] {
  return Array.from({ length: count }, (_, i) =>
    buildScenarioItem(level, categoryId, i, i + 1)
  );
}

function generateLevelSimulations(level: CefrLevel): ScenarioItem[] {
  const distribution = LEVEL_DISTRIBUTION[level];
  const scenarios: ScenarioItem[] = [];
  let globalIndex = 0;

  for (const [categoryId, count] of Object.entries(distribution) as [
    CategoryId,
    number,
  ][]) {
    for (let i = 0; i < count; i++) {
      globalIndex++;
      scenarios.push(buildScenarioItem(level, categoryId, i, globalIndex));
    }
  }

  return scenarios;
}

const simulationCache: Partial<Record<CefrLevel, ScenarioItem[]>> = {};

export function getLevelSimulations(level: CefrLevel): ScenarioItem[] {
  if (!simulationCache[level]) {
    simulationCache[level] = generateLevelSimulations(level);
  }
  return simulationCache[level]!;
}

export function getAllLevelSimulations(): Record<CefrLevel, ScenarioItem[]> {
  return CEFR_LEVELS.reduce(
    (acc, level) => {
      acc[level] = getLevelSimulations(level);
      return acc;
    },
    {} as Record<CefrLevel, ScenarioItem[]>
  );
}

export function getCategorySimulations(
  level: CefrLevel,
  categoryId: string
): ScenarioItem[] {
  return getLevelSimulations(level).filter((s) => s.categoryId === categoryId);
}

export function getSimulationCountForLevel(level: CefrLevel): number {
  return getLevelSimulations(level).length;
}

/** 将各岗位所需的模拟场景挂载到各工作场景（按类别取各岗位最大分配数） */
export function attachSimulations(scenarios: WorkScenario[]): WorkScenario[] {
  return scenarios.map((ws) => {
    if (ws.id.startsWith("gen-")) {
      return ws;
    }
    return {
      ...ws,
      levels: ws.levels.map((levelContent) => {
        const count = getMaxCategoryCountForLevel(
          levelContent.level,
          ws.id as CategoryId
        );
        const simulations =
          count > 0
            ? generateCategorySimulations(
                levelContent.level,
                ws.id as CategoryId,
                count
              )
            : [];
        return {
          ...levelContent,
          scenarios: simulations,
        };
      }),
    };
  });
}

export function getLevelSimulationStats(level: CefrLevel) {
  const all = getLevelSimulations(level);
  const byCategory = all.reduce<Record<string, number>>((acc, s) => {
    const key = s.categoryId ?? "other";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return { total: all.length, byCategory };
}
