import type {
  CefrLevel,
  DialogueItem,
  DialogueLine,
  ScenarioItem,
  SentenceItem,
  WordItem,
  WorkScenarioLevel,
} from "@/lib/types/course";
import { CEFR_LEVELS } from "@/lib/types/course";
import type { GeneratedCoursePackage, GeneratedLevelContent } from "@/lib/types/generated-course";
import { GENERATED_SIMULATIONS_COUNT } from "@/lib/types/generated-course";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";
import { DEPARTMENT_BY_ID } from "@/lib/types/front-desk-department";

export type GenerateCourseInput = {
  theme: string;
  departmentId: FrontDeskDepartmentId;
  level: CefrLevel;
  brief?: string;
};

type VocabEntry = {
  english: string;
  phonetic: string;
  chinese: string;
  example: string;
};

const DEPT_EN: Record<FrontDeskDepartmentId, string> = {
  reception: "Front Desk",
  concierge: "Concierge",
  reservations: "Reservations",
  "customer-service": "Guest Relations",
};

function slugify(text: string): string {
  return text
    .trim()
    .slice(0, 32)
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "");
}

function pickVocabPack(theme: string, departmentId: FrontDeskDepartmentId): VocabEntry[] {
  const t = theme.toLowerCase();

  if (/餐厅|餐饮|米其林|订餐|restaurant|dining/i.test(theme)) {
    return [
      { english: "Reservation", phonetic: "/ˌrezərˈveɪʃn/", chinese: "预订", example: "I'd be happy to make a restaurant reservation for you." },
      { english: "Michelin-starred", phonetic: "/mɪˈʃelɪn stɑːrd/", chinese: "米其林星级", example: "This is a Michelin-starred restaurant nearby." },
      { english: "Waiting list", phonetic: "/ˈweɪtɪŋ lɪst/", chinese: "等候名单", example: "The restaurant is full, but I can put you on the waiting list." },
      { english: "Private dining room", phonetic: "/ˈpraɪvət ˈdaɪnɪŋ ruːm/", chinese: "包间", example: "Would you prefer a private dining room?" },
      { english: "Dress code", phonetic: "/dres kəʊd/", chinese: "着装要求", example: "Smart casual dress code is required." },
      { english: "Sommelier", phonetic: "/ˈsʌməljeɪ/", chinese: "侍酒师", example: "Our sommelier can recommend wine pairings." },
      { english: "Special dietary needs", phonetic: "/ˈspeʃl ˈdaɪətəri niːdz/", chinese: "特殊饮食需求", example: "Please let us know any special dietary needs." },
      { english: "Confirmation number", phonetic: "/ˌkɒnfəˈmeɪʃn ˈnʌmbər/", chinese: "确认号", example: "Your confirmation number is RS-8842." },
    ];
  }

  if (/机场|接送|豪车|用车|chauffeur|airport|transfer/i.test(theme)) {
    return [
      { english: "Airport transfer", phonetic: "/ˈeəpɔːt ˈtrænsfɜːr/", chinese: "机场接送", example: "We can arrange a private airport transfer." },
      { english: "Chauffeur", phonetic: "/ˈʃoʊfər/", chinese: "司机/礼宾车司机", example: "Your chauffeur will meet you at arrivals." },
      { english: "Flight number", phonetic: "/flaɪt ˈnʌmbər/", chinese: "航班号", example: "May I have your flight number, please?" },
      { english: "Arrival hall", phonetic: "/əˈraɪvl hɔːl/", chinese: "到达大厅", example: "The driver will wait in the arrival hall with a name board." },
      { english: "Luxury sedan", phonetic: "/ˈlʌkʃəri ˈsedən/", chinese: "豪华轿车", example: "Would you prefer a luxury sedan or an MPV?" },
      { english: "Traffic delay", phonetic: "/ˈtræfɪk dɪˈleɪ/", chinese: "交通延误", example: "Due to traffic, please allow an extra 30 minutes." },
      { english: "Meet and greet", phonetic: "/miːt ənd ɡriːt/", chinese: "接机迎宾", example: "We offer meet-and-greet service at the airport." },
      { english: "Luggage assistance", phonetic: "/ˈlʌɡɪdʒ əˈsɪstəns/", chinese: "行李协助", example: "The chauffeur will assist with your luggage." },
    ];
  }

  if (/行李|寄存|bell|luggage|porter/i.test(theme)) {
    return [
      { english: "Bell cart", phonetic: "/bel kɑːrt/", chinese: "行李车", example: "I'll bring a bell cart for your luggage." },
      { english: "Luggage storage", phonetic: "/ˈlʌɡɪdʒ ˈstɔːrɪdʒ/", chinese: "行李寄存", example: "We offer complimentary luggage storage." },
      { english: "Porter service", phonetic: "/ˈpɔːrtər ˈsɜːrvɪs/", chinese: "行李员服务", example: "Porter service is available 24 hours." },
      { english: "Fragile items", phonetic: "/ˈfrædʒaɪl ˈaɪtəmz/", chinese: "易碎物品", example: "Please label any fragile items." },
      { english: "Delivery to room", phonetic: "/dɪˈlɪvəri tuː ruːm/", chinese: "送至房间", example: "Your bags will be delivered to your room shortly." },
      { english: "Claim ticket", phonetic: "/kleɪm ˈtɪkɪt/", chinese: "领取凭证", example: "Here is your luggage claim ticket." },
      { english: "Oversized baggage", phonetic: "/ˌoʊvərˈsaɪzd ˈbæɡɪdʒ/", chinese: "超大行李", example: "Oversized baggage can be stored in our back office." },
      { english: "Bell desk", phonetic: "/bel desk/", chinese: "礼宾行李台", example: "Please contact the bell desk for assistance." },
    ];
  }

  if (/景点|门票|旅游|tour|ticket|attraction/i.test(theme)) {
    return [
      { english: "Sightseeing", phonetic: "/ˈsaɪtˌsiːɪŋ/", chinese: "观光", example: "We can recommend sightseeing routes nearby." },
      { english: "Skip-the-line ticket", phonetic: "/skɪp ðə laɪn ˈtɪkɪt/", chinese: "免排队门票", example: "Skip-the-line tickets are available for major attractions." },
      { english: "Private guide", phonetic: "/ˈpraɪvət ɡaɪd/", chinese: "私人导游", example: "Would you like a private guide for half a day?" },
      { english: "Opening hours", phonetic: "/ˈoʊpənɪŋ aʊərz/", chinese: "开放时间", example: "Opening hours are 9 AM to 6 PM." },
      { english: "Itinerary", phonetic: "/aɪˈtɪnəreri/", chinese: "行程", example: "I can prepare a half-day itinerary for you." },
      { english: "Family-friendly", phonetic: "/ˈfæməli ˈfrendli/", chinese: "适合家庭", example: "This attraction is very family-friendly." },
      { english: "Audio guide", phonetic: "/ˈɔːdioʊ ɡaɪd/", chinese: "语音导览", example: "Audio guides are available in multiple languages." },
      { english: "Shuttle service", phonetic: "/ˈʃʌtl ˈsɜːrvɪs/", chinese: "班车服务", example: "Complimentary shuttle service runs every hour." },
    ];
  }

  const deptDefault: Record<FrontDeskDepartmentId, VocabEntry[]> = {
    reception: [
      { english: "Welcome desk", phonetic: "/ˈwelkəm desk/", chinese: "迎宾台", example: "Please proceed to the welcome desk." },
      { english: "Room key", phonetic: "/ruːm kiː/", chinese: "房卡", example: "Here is your room key." },
      { english: "Guest profile", phonetic: "/ɡest ˈproʊfaɪl/", chinese: "宾客档案", example: "I have your guest profile here." },
      { english: "Express check-in", phonetic: "/ɪkˈspres tʃek ɪn/", chinese: "快速入住", example: "Express check-in is available for members." },
      { english: "Wake-up call", phonetic: "/weɪk ʌp kɔːl/", chinese: "叫醒服务", example: "Would you like a wake-up call tomorrow?" },
      { english: "Housekeeping", phonetic: "/ˈhaʊskiːpɪŋ/", chinese: "客房部", example: "Housekeeping will service your room after 2 PM." },
      { english: "Upgrade", phonetic: "/ʌpˈɡreɪd/", chinese: "升级", example: "We are pleased to offer you a complimentary upgrade." },
      { english: "Late checkout", phonetic: "/leɪt tʃek aʊt/", chinese: "延迟退房", example: "Late checkout until 2 PM is confirmed." },
    ],
    concierge: [
      { english: "Concierge desk", phonetic: "/ˈkɒnsieəʒ desk/", chinese: "礼宾台", example: "The concierge desk is open 24 hours." },
      { english: "Local recommendation", phonetic: "/ˈloʊkl ˌrekəmenˈdeɪʃn/", chinese: "本地推荐", example: "May I offer a local recommendation?" },
      { english: "Personalized service", phonetic: "/ˈpɜːrsənəlaɪzd ˈsɜːrvɪs/", chinese: "个性化服务", example: "We provide personalized service for every guest." },
      { english: "Special arrangement", phonetic: "/ˈspeʃl əˈreɪndʒmənt/", chinese: "特别安排", example: "I'll make a special arrangement for you." },
      { english: "Guest preference", phonetic: "/ɡest ˈprefrəns/", chinese: "客人偏好", example: "Your guest preferences are noted in our system." },
      { english: "Follow-up", phonetic: "/ˈfɒloʊ ʌp/", chinese: "跟进", example: "I will follow up once the booking is confirmed." },
      { english: "VIP treatment", phonetic: "/viː aɪ piː ˈtriːtmənt/", chinese: "VIP 礼遇", example: "VIP treatment includes priority seating." },
      { english: "At your convenience", phonetic: "/æt jɔːr kənˈviːniəns/", chinese: "在您方便时", example: "We can arrange this at your convenience." },
    ],
    reservations: [
      { english: "Availability", phonetic: "/əˌveɪləˈbɪləti/", chinese: "空房情况", example: "Let me check availability for those dates." },
      { english: "Rate plan", phonetic: "/reɪt plæn/", chinese: "价格方案", example: "We have several rate plans available." },
      { english: "Non-refundable", phonetic: "/nɒn rɪˈfʌndəbl/", chinese: "不可退款", example: "This rate is non-refundable." },
      { english: "Corporate rate", phonetic: "/ˈkɔːrpərət reɪt/", chinese: "协议价", example: "Do you have a corporate rate code?" },
      { english: "Guarantee", phonetic: "/ˌɡærənˈtiː/", chinese: "担保", example: "A credit card guarantee is required." },
      { english: "Modification", phonetic: "/ˌmɒdɪfɪˈkeɪʃn/", chinese: "修改", example: "Modification is free up to 24 hours before arrival." },
      { english: "Allotment", phonetic: "/əˈlɒtmənt/", chinese: "配额", example: "Your group allotment is 15 rooms per night." },
      { english: "Confirmation email", phonetic: "/ˌkɒnfəˈmeɪʃn ˈiːmeɪl/", chinese: "确认邮件", example: "A confirmation email has been sent." },
    ],
    "customer-service": [
      { english: "Service recovery", phonetic: "/ˈsɜːrvɪs rɪˈkʌvəri/", chinese: "服务补救", example: "Our priority is service recovery." },
      { english: "Empathy", phonetic: "/ˈempəθi/", chinese: "共情", example: "I understand how frustrating this must be." },
      { english: "Escalation", phonetic: "/ˌeskəˈleɪʃn/", chinese: "升级处理", example: "I'll escalate this to our duty manager." },
      { english: "Compensation", phonetic: "/ˌkɒmpenˈseɪʃn/", chinese: "补偿", example: "We would like to offer compensation for the inconvenience." },
      { english: "Follow-up call", phonetic: "/ˈfɒloʊ ʌp kɔːl/", chinese: "回访电话", example: "We'll make a follow-up call within 24 hours." },
      { english: "Guest satisfaction", phonetic: "/ɡest ˌsætɪsˈfækʃn/", chinese: "宾客满意度", example: "Your satisfaction is very important to us." },
      { english: "Incident report", phonetic: "/ˈɪnsɪdənt rɪˈpɔːrt/", chinese: "事件报告", example: "I've filed an incident report." },
      { english: "Resolution timeline", phonetic: "/ˌrezəˈluːʃn ˈtaɪmlaɪn/", chinese: "解决时间表", example: "Here is the resolution timeline." },
    ],
  };

  return deptDefault[departmentId];
}

function buildWords(theme: string, departmentId: FrontDeskDepartmentId, level: CefrLevel): WordItem[] {
  const pack = pickVocabPack(theme, departmentId);
  return pack.map((v, i) => ({
    id: `gen-w-${slugify(theme)}-${level}-${i + 1}`,
    english: v.english,
    phonetic: v.phonetic,
    chinese: v.chinese,
    example: v.example.replace(/\.$/, "") + ` (${theme}).`,
  }));
}

function buildSentences(theme: string, level: CefrLevel): SentenceItem[] {
  const templates = [
    {
      context: "主动问候",
      english: `Good afternoon. How may I assist you with ${theme}?`,
      chinese: `下午好。关于「${theme}」，请问有什么可以帮您？`,
    },
    {
      context: "确认需求",
      english: "Could you please share more details so I can arrange this properly?",
      chinese: "能否请您提供更多细节，以便我为您妥善安排？",
    },
    {
      context: "专业回应",
      english: "Certainly. I'll handle this personally and update you shortly.",
      chinese: "当然。我将亲自跟进，并尽快向您反馈。",
    },
    {
      context: "时间说明",
      english: "It will take approximately 15 minutes to confirm the arrangement.",
      chinese: "确认安排大约需要 15 分钟。",
    },
    {
      context: "超出预期",
      english: "We also have a premium option that many guests prefer for this request.",
      chinese: "针对这类需求，我们还有一项更受客人欢迎的尊享方案。",
    },
    {
      context: "收尾确认",
      english: "Is there anything else I can arrange for you regarding this matter?",
      chinese: "关于此事，还有其他需要我为您安排的吗？",
    },
  ];

  return templates.map((t, i) => ({
    id: `gen-s-${slugify(theme)}-${level}-${i + 1}`,
    ...t,
  }));
}

function buildDialogues(theme: string, level: CefrLevel): DialogueItem[] {
  const lines1: DialogueLine[] = [
    { speaker: "guest", english: `I'd like help with ${theme}.`, chinese: `我需要关于「${theme}」的帮助。` },
    { speaker: "staff", english: "Of course. I'd be delighted to assist you.", chinese: "当然，非常乐意为您服务。" },
    { speaker: "guest", english: "What information do you need from me?", chinese: "您需要我提供哪些信息？" },
    { speaker: "staff", english: "Just your preferred time and any special requirements.", chinese: "请告知您期望的时间及任何特殊要求。" },
    { speaker: "staff", english: "I'll confirm everything and send you the details shortly.", chinese: "我会确认所有细节，并尽快将信息发送给您。" },
  ];

  const lines2: DialogueLine[] = [
    { speaker: "guest", english: "Is this service available tonight?", chinese: "这项服务今晚可以安排吗？" },
    { speaker: "staff", english: "Let me check availability for you right away.", chinese: "我马上为您查询是否可以安排。" },
    { speaker: "guest", english: "If not, what alternatives do you suggest?", chinese: "如果不行，您有什么替代方案？" },
    { speaker: "staff", english: "I can offer two excellent alternatives that match your request.", chinese: "我可以提供两个符合您需求的优质替代方案。" },
    { speaker: "guest", english: "The first option sounds perfect.", chinese: "第一个方案听起来很合适。" },
    { speaker: "staff", english: "Wonderful. I'll proceed with the booking now.", chinese: "太好了，我现在就为您预订。" },
  ];

  return [
    {
      id: `gen-d-${slugify(theme)}-${level}-1`,
      title: `${theme} · 基础咨询`,
      subtitle: "Initial Request",
      lines: lines1,
    },
    {
      id: `gen-d-${slugify(theme)}-${level}-2`,
      title: `${theme} · 方案确认`,
      subtitle: "Confirm Arrangement",
      lines: lines2,
    },
  ];
}

function buildSimulations(
  theme: string,
  departmentId: FrontDeskDepartmentId,
  level: CefrLevel,
  scenarioId: string
): ScenarioItem[] {
  const situations = [
    "客人首次咨询",
    "时间紧急",
    "预算有限",
    "VIP 客人",
    "带儿童家庭",
    "语言沟通障碍",
    "需要升级方案",
    "变更已确认订单",
    "投诉后补救",
    "团体协调",
    "特殊饮食/无障碍",
    "离店前最后一分钟请求",
  ];

  return situations.slice(0, GENERATED_SIMULATIONS_COUNT).map((situation, i) => {
    const num = i + 1;
    const id = `sim-${departmentId}-${level}-${scenarioId}-${num}`;
    return {
      id,
      title: `${theme} · ${situation} #${num}`,
      setting: `${DEPT_EN[departmentId]} — ${theme}`,
      description: `模拟场景：${situation}。主题「${theme}」，请用专业英语完成礼宾/岗位服务。`,
      objectives: [
        `准确理解客人关于「${theme}」的需求`,
        "提供清晰可行的解决方案",
        "保持专业、热情的服务态度",
      ],
      keyPhrases: [
        { english: "I'd be happy to assist you with that.", chinese: "我很乐意为您安排。" },
        { english: "Let me check the best option for you.", chinese: "让我为您查询最佳方案。" },
        { english: "I'll confirm the details and follow up shortly.", chinese: "我会确认细节并尽快回复您。" },
      ],
      sampleDialogue: [
        { speaker: "guest", english: `I need assistance with ${theme}.`, chinese: `我需要「${theme}」方面的帮助。` },
        { speaker: "staff", english: "Certainly. I'll take care of this for you right away.", chinese: "当然，我马上为您处理。" },
      ],
      categoryId: scenarioId,
      categoryTitle: theme,
      simulationNumber: num,
    };
  });
}

function buildLevelContent(
  theme: string,
  departmentId: FrontDeskDepartmentId,
  level: CefrLevel,
  scenarioId: string
): GeneratedLevelContent {
  return {
    words: buildWords(theme, departmentId, level),
    sentences: buildSentences(theme, level),
    dialogues: buildDialogues(theme, level),
    simulations: buildSimulations(theme, departmentId, level, scenarioId),
  };
}

export function generateCourseFromTheme(input: GenerateCourseInput): GeneratedCoursePackage {
  const theme = input.theme.trim();
  const id = `gc-${Date.now().toString(36)}`;
  const scenarioId = `gen-${id}`;
  const dept = DEPARTMENT_BY_ID[input.departmentId];
  const now = new Date().toISOString();

  const primaryContent = buildLevelContent(
    theme,
    input.departmentId,
    input.level,
    scenarioId
  );

  const levels: GeneratedCoursePackage["levels"] = {
    [input.level]: primaryContent,
  };

  const description =
    input.brief?.trim() ||
    `围绕「${theme}」主题自动生成的${dept.title}课程，含词汇、句型、对话与 ${GENERATED_SIMULATIONS_COUNT} 个模拟关卡。`;

  return {
    id,
    scenarioId,
    departmentId: input.departmentId,
    theme,
    title: theme,
    subtitle: `${DEPT_EN[input.departmentId]} · ${input.level}`,
    description,
    primaryLevel: input.level,
    levels,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function generatedCourseToWorkScenario(
  pkg: GeneratedCoursePackage
): import("@/lib/types/course").WorkScenario {
  return {
    id: pkg.scenarioId,
    title: pkg.title,
    subtitle: pkg.subtitle,
    description: pkg.description,
    levels: CEFR_LEVELS.map((level) => {
      const content = pkg.levels[level];
      return {
        level,
        words: content?.words ?? [],
        sentences: content?.sentences ?? [],
        dialogues: content?.dialogues ?? [],
        scenarios: content?.simulations ?? [],
      } satisfies WorkScenarioLevel;
    }),
  };
}
