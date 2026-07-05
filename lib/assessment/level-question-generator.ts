import { cefrAssessmentQuestions } from "@/lib/data/cefr-assessment";
import { QUESTIONS_PER_LEVEL } from "@/lib/assessment/level-test-config";
import type {
  AssessmentQuestion,
  CEFRLevel,
  FillBlankQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
} from "@/lib/types/assessment";

type VocabEntry = {
  word: string;
  meaning: string;
  wrong: [string, string, string];
};

type FillEntry = {
  sentence: string;
  answer: string;
  wrong: [string, string, string];
  explanation: string;
};

type TfEntry = {
  statement: string;
  correct: boolean;
  explanation: string;
};

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function shuffleStable<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let s = hashSeed(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeMc(
  level: CEFRLevel,
  id: string,
  entry: VocabEntry
): MultipleChoiceQuestion {
  const options = shuffleStable(
    [entry.meaning, ...entry.wrong],
    `${id}-opts`
  );
  return {
    id,
    level,
    category: "vocabulary",
    type: "multiple_choice",
    prompt: `What does "${entry.word}" mean in a hotel context?`,
    options,
    correctIndex: options.indexOf(entry.meaning),
    explanation: `${entry.word} 的意思是「${entry.meaning}」。`,
  };
}

function makeMatch(
  level: CEFRLevel,
  id: string,
  entry: VocabEntry
): MatchingQuestion {
  const options = shuffleStable(
    [entry.meaning, ...entry.wrong],
    `${id}-match`
  );
  return {
    id,
    level,
    category: "hotel",
    type: "matching",
    prompt: `选择 "${entry.word}" 的正确中文含义：`,
    term: entry.word,
    options,
    correctIndex: options.indexOf(entry.meaning),
    explanation: `${entry.word} = ${entry.meaning}`,
  };
}

function makeFill(
  level: CEFRLevel,
  id: string,
  entry: FillEntry
): FillBlankQuestion {
  const options = shuffleStable(
    [entry.answer, ...entry.wrong],
    `${id}-fill`
  );
  return {
    id,
    level,
    category: "grammar",
    type: "fill_blank",
    prompt: "选择正确的词完成句子：",
    sentence: entry.sentence,
    options,
    correctIndex: options.indexOf(entry.answer),
    explanation: entry.explanation,
  };
}

function makeTf(
  level: CEFRLevel,
  id: string,
  entry: TfEntry
): TrueFalseQuestion {
  return {
    id,
    level,
    category: "hotel",
    type: "true_false",
    prompt: "判断下列说法是否正确：",
    statement: entry.statement,
    correct: entry.correct,
    explanation: entry.explanation,
  };
}

const LEVEL_VOCAB: Record<CEFRLevel, VocabEntry[]> = {
  A1: [
    { word: "room", meaning: "房间", wrong: ["餐厅", "大堂", "电梯"] },
    { word: "key", meaning: "钥匙", wrong: ["房卡套", "门铃", "密码"] },
    { word: "bed", meaning: "床", wrong: ["沙发", "桌子", "窗帘"] },
    { word: "bathroom", meaning: "浴室", wrong: ["厨房", "阳台", "走廊"] },
    { word: "towel", meaning: "毛巾", wrong: ["牙刷", "拖鞋", "枕头"] },
    { word: "breakfast", meaning: "早餐", wrong: ["午餐", "晚餐", "夜宵"] },
    { word: "elevator", meaning: "电梯", wrong: ["楼梯", "走廊", "大门"] },
    { word: "lobby", meaning: "大堂", wrong: ["厨房", "车库", "屋顶"] },
    { word: "guest", meaning: "客人", wrong: ["员工", "经理", "厨师"] },
    { word: "reservation", meaning: "预订", wrong: ["退房", "投诉", "发票"] },
    { word: "passport", meaning: "护照", wrong: ["房卡", "菜单", "账单"] },
    { word: "luggage", meaning: "行李", wrong: ["钥匙", "毛巾", "菜单"] },
    { word: "floor", meaning: "楼层", wrong: ["房间号", "价格", "时间"] },
    { word: "reception", meaning: "前台", wrong: ["仓库", "厨房", "泳池"] },
    { word: "bill", meaning: "账单", wrong: ["菜单", "房卡", "钥匙"] },
  ],
  A2: [
    { word: "check-in", meaning: "入住", wrong: ["退房", "预订", "升级"] },
    { word: "check-out", meaning: "退房", wrong: ["入住", "登记", "换房"] },
    { word: "concierge", meaning: "礼宾", wrong: ["保洁", "厨师", "保安"] },
    { word: "housekeeping", meaning: "客房清洁", wrong: ["前台", "礼宾", "维修"] },
    { word: "wake-up call", meaning: "叫醒服务", wrong: ["送餐", "洗衣", "接机"] },
    { word: "laundry", meaning: "洗衣", wrong: ["干洗", "熨烫", "打包"] },
    { word: "minibar", meaning: "迷你吧", wrong: ["餐厅", "大堂吧", "厨房"] },
    { word: "single room", meaning: "单人间", wrong: ["双人间", "套房", "家庭房"] },
    { word: "twin room", meaning: "双床房", wrong: ["大床房", "单人间", "总统套房"] },
    { word: "receipt", meaning: "收据", wrong: ["发票", "菜单", "合同"] },
    { word: "deposit", meaning: "押金", wrong: ["小费", "折扣", "积分"] },
    { word: "extension", meaning: "续住", wrong: ["取消", "换房", "退房"] },
    { word: "no-show", meaning: "未到店", wrong: ["早退", "迟到", "取消"] },
    { word: "bellboy", meaning: "行李员", wrong: ["前台", "经理", "厨师"] },
    { word: "room service", meaning: "客房送餐", wrong: ["自助早餐", "外卖", "大堂吧"] },
  ],
  B1: [
    { word: "complimentary", meaning: "免费的", wrong: ["昂贵的", "可选的", "投诉的"] },
    { word: "amenity", meaning: "设施", wrong: ["账单", "菜单", "合同"] },
    { word: "overdue", meaning: "逾期的", wrong: ["提前的", "免费的", "临时的"] },
    { word: "availability", meaning: "空房情况", wrong: ["价格", "折扣", "发票"] },
    { word: "confirmation", meaning: "确认", wrong: ["取消", "拒绝", "延迟"] },
    { word: "itinerary", meaning: "行程", wrong: ["账单", "菜单", "合同"] },
    { word: "late check-out", meaning: "延迟退房", wrong: ["提前入住", "取消预订", "换房"] },
    { word: "non-smoking", meaning: "禁烟", wrong: ["吸烟", "通风", "开窗"] },
    { word: "allergy", meaning: "过敏", wrong: ["偏好", "习惯", "要求"] },
    { word: "maintenance", meaning: "维修", wrong: ["清洁", "登记", "结账"] },
    { word: "complaint", meaning: "投诉", wrong: ["表扬", "预订", "确认"] },
    { word: "upgrade", meaning: "升级", wrong: ["降级", "取消", "延期"] },
    { word: "rate", meaning: "价格", wrong: ["楼层", "房号", "时间"] },
    { word: "folio", meaning: "账单明细", wrong: ["房卡", "菜单", "合同"] },
    { word: "incident", meaning: "事件", wrong: ["优惠", "积分", "早餐"] },
  ],
  B2: [
    { word: "upselling", meaning: "向上销售", wrong: ["降价", "退订", "清仓"] },
    { word: "overbooking", meaning: "超额预订", wrong: ["提前预订", "取消预订", "团体预订"] },
    { word: "walk-in", meaning: "无预订散客", wrong: ["团队客", "VIP", "长住客"] },
    { word: "no-show policy", meaning: "未到店政策", wrong: ["退房政策", "早餐政策", "宠物政策"] },
    { word: "compensation", meaning: "补偿", wrong: ["投诉", "预订", "升级"] },
    { word: "escalation", meaning: "升级处理", wrong: ["忽略", "延迟", "取消"] },
    { word: "occupancy", meaning: "入住率", wrong: ["房价", "房量", "房号"] },
    { word: "yield management", meaning: "收益管理", wrong: ["客房清洁", "礼宾服务", "工程维修"] },
    { word: "blackout date", meaning: "不可售日期", wrong: ["促销日", "免费日", "开放日"] },
    { word: "group block", meaning: "团队预留房", wrong: ["散客房", "员工房", "自用房"] },
    { word: "discrepancy", meaning: "差异", wrong: ["确认", "一致", "匹配"] },
    { word: "collateral", meaning: "抵押/担保", wrong: ["小费", "折扣", "积分"] },
    { word: "attribution", meaning: "归因", wrong: ["取消", "忽略", "延迟"] },
    { word: "recovery", meaning: "服务补救", wrong: ["投诉升级", "拒绝服务", "强制退房"] },
    { word: "brand standard", meaning: "品牌标准", wrong: ["个人习惯", "临时安排", "随意处理"] },
  ],
  C1: [
    { word: "RevPAR", meaning: "每可用房收入", wrong: ["每房成本", "每客单价", "每夜折扣"] },
    { word: "ADR", meaning: "平均房价", wrong: ["入住率", "退房率", "投诉率"] },
    { word: "PMS", meaning: "酒店管理系统", wrong: ["财务系统", "邮件系统", "监控系统"] },
    { word: "diplomatic", meaning: "外交式的/得体的", wrong: ["直接的", "粗鲁的", "强硬的"] },
    { word: "systemic", meaning: "系统性的", wrong: ["个人的", "偶然的", "暂时的"] },
    { word: "accountability", meaning: "问责/责任", wrong: ["借口", "推诿", "忽视"] },
    { word: "mitigation", meaning: "缓解", wrong: ["加剧", "忽略", "拒绝"] },
    { word: "precedent", meaning: "先例", wrong: ["例外", "错误", "偶然"] },
    { word: "stakeholder", meaning: "利益相关方", wrong: ["旁观者", "无关者", "外部游客"] },
    { word: "contingency", meaning: "应急方案", wrong: ["常规流程", "固定安排", "忽略"] },
    { word: "remediation", meaning: "补救措施", wrong: ["加剧问题", "推卸责任", "拒绝处理"] },
    { word: "jurisdiction", meaning: "管辖范围", wrong: ["个人意见", "随意决定", "临时规则"] },
    { word: "arbitration", meaning: "仲裁", wrong: ["争吵", "忽视", "拖延"] },
    { word: "fiduciary", meaning: "受托的", wrong: ["随意的", "无关的", "个人的"] },
    { word: "benchmark", meaning: "基准", wrong: ["例外", "错误", "猜测"] },
  ],
};

const LEVEL_FILLS: Record<CEFRLevel, FillEntry[]> = {
  A1: [
    {
      sentence: "I ___ a reservation.",
      answer: "have",
      wrong: ["am", "has", "is"],
      explanation: "I have a reservation. 第一人称用 have。",
    },
    {
      sentence: "This is your ___ card.",
      answer: "key",
      wrong: ["food", "bed", "menu"],
      explanation: "Key card 房卡，前台常用表达。",
    },
    {
      sentence: "Good ___, welcome to our hotel.",
      answer: "morning",
      wrong: ["night", "bye", "sorry"],
      explanation: "Good morning 是上午问候语。",
    },
    {
      sentence: "Your room is on the ___ floor.",
      answer: "third",
      wrong: ["three", "tree", "free"],
      explanation: "序数词 third floor 表示第三层。",
    },
  ],
  A2: [
    {
      sentence: "Could I ___ your passport, please?",
      answer: "see",
      wrong: ["seeing", "saw", "seen"],
      explanation: "Could I see...? 礼貌请求用动词原形。",
    },
    {
      sentence: "Check-out time is ___ noon.",
      answer: "at",
      wrong: ["in", "on", "by"],
      explanation: "At noon 表示在中午十二点。",
    },
    {
      sentence: "Would you like a ___ call tomorrow?",
      answer: "wake-up",
      wrong: ["waking", "woke", "awake"],
      explanation: "Wake-up call 叫醒服务。",
    },
    {
      sentence: "The breakfast buffet is on the ___ floor.",
      answer: "second",
      wrong: ["two", "too", "secondly"],
      explanation: "Second floor 第二层。",
    },
  ],
  B1: [
    {
      sentence: "Your room ___ ready in about 30 minutes.",
      answer: "will be",
      wrong: ["was", "has", "being"],
      explanation: "Will be ready 表示将来状态。",
    },
    {
      sentence: "We apologize ___ the inconvenience.",
      answer: "for",
      wrong: ["to", "at", "with"],
      explanation: "Apologize for 固定搭配。",
    },
    {
      sentence: "Could you please sign ___?",
      answer: "here",
      wrong: ["there", "now", "that"],
      explanation: "Sign here 请在这里签名。",
    },
    {
      sentence: "The rate ___ breakfast is included.",
      answer: "where",
      wrong: ["which", "who", "when"],
      explanation: "The rate where breakfast is included 定语从句。",
    },
  ],
  B2: [
    {
      sentence: "Had we been notified earlier, we ___ arranged a transfer.",
      answer: "would have",
      wrong: ["will have", "would", "had"],
      explanation: "第三条件句 would have + 过去分词。",
    },
    {
      sentence: "The guest insisted ___ speaking to the manager.",
      answer: "on",
      wrong: ["at", "for", "to"],
      explanation: "Insist on doing 固定搭配。",
    },
    {
      sentence: "We regret ___ inform you that the suite is unavailable.",
      answer: "to",
      wrong: ["for", "at", "with"],
      explanation: "Regret to inform 正式通知用语。",
    },
    {
      sentence: "The complaint was handled ___ a professional manner.",
      answer: "in",
      wrong: ["on", "at", "by"],
      explanation: "In a professional manner 以专业方式。",
    },
  ],
  C1: [
    {
      sentence: "Not only ___ the guest satisfied, but she also commended the staff.",
      answer: "was",
      wrong: ["were", "is", "has been"],
      explanation: "Not only was... 倒装结构。",
    },
    {
      sentence: "The issue was attributable ___ a PMS update failure.",
      answer: "to",
      wrong: ["for", "at", "with"],
      explanation: "Attributable to 归因于。",
    },
    {
      sentence: "We shall proceed ___ accordance with brand policy.",
      answer: "in",
      wrong: ["on", "at", "by"],
      explanation: "In accordance with 依照。",
    },
    {
      sentence: "Rarely ___ such a diplomatic response been required.",
      answer: "has",
      wrong: ["have", "had", "is"],
      explanation: "Rarely has... 否定副词前置倒装。",
    },
  ],
};

const LEVEL_TF: Record<CEFRLevel, TfEntry[]> = {
  A1: [
    {
      statement: '"Good morning" is used to greet guests in the morning.',
      correct: true,
      explanation: "Good morning 用于上午问候。",
    },
    {
      statement: '"Check out" means to enter the hotel.',
      correct: false,
      explanation: "Check out 是退房，check in 才是入住。",
    },
    {
      statement: "A hotel lobby is usually on the ground floor.",
      correct: true,
      explanation: "大堂通常在一楼/地面层。",
    },
    {
      statement: '"Room number" and "floor number" mean the same thing.',
      correct: false,
      explanation: "房号和楼层是不同的概念。",
    },
  ],
  A2: [
    {
      statement: "The concierge helps with restaurant bookings.",
      correct: true,
      explanation: "礼宾部负责餐厅预订等服务。",
    },
    {
      statement: "Housekeeping works at the front desk.",
      correct: false,
      explanation: "Housekeeping 负责客房清洁，不在前台。",
    },
    {
      statement: "A deposit may be required at check-in.",
      correct: true,
      explanation: "入住时可能需要押金。",
    },
    {
      statement: "Room service means cleaning the room only.",
      correct: false,
      explanation: "Room service 通常指客房送餐服务。",
    },
  ],
  B1: [
    {
      statement: "A wake-up call is requested by the guest at a specific time.",
      correct: true,
      explanation: "叫醒服务按客人指定时间进行。",
    },
    {
      statement: "Complimentary means the guest must pay extra.",
      correct: false,
      explanation: "Complimentary 表示免费赠送。",
    },
    {
      statement: "Late check-out means leaving after the standard time.",
      correct: true,
      explanation: "延迟退房即超过标准退房时间。",
    },
    {
      statement: "A folio is the same as a room key.",
      correct: false,
      explanation: "Folio 是账单明细，不是房卡。",
    },
  ],
  B2: [
    {
      statement: "Upselling encourages guests to buy higher-value services.",
      correct: true,
      explanation: "Upselling 指向客人推荐更高价值服务。",
    },
    {
      statement: "Overbooking never happens in hotels.",
      correct: false,
      explanation: "Overbooking 超额预订在酒店业确实存在。",
    },
    {
      statement: "Service recovery aims to restore guest satisfaction.",
      correct: true,
      explanation: "服务补救旨在恢复客人满意度。",
    },
    {
      statement: "Walk-in guests always have a prior reservation.",
      correct: false,
      explanation: "Walk-in 指无预订直接到店的散客。",
    },
  ],
  C1: [
    {
      statement: "RevPAR stands for Revenue Per Available Room.",
      correct: true,
      explanation: "RevPAR = Revenue Per Available Room。",
    },
    {
      statement: "A systemic failure means one staff member made a typo only.",
      correct: false,
      explanation: "Systemic 指系统性的，非个人偶然错误。",
    },
    {
      statement: "Diplomatic language helps de-escalate guest conflicts.",
      correct: true,
      explanation: "得体的外交式语言有助于缓和冲突。",
    },
    {
      statement: "PMS refers to a Property Management System.",
      correct: true,
      explanation: "PMS 是酒店物业管理系统。",
    },
  ],
};

function generateForLevel(level: CEFRLevel): AssessmentQuestion[] {
  const vocab = LEVEL_VOCAB[level];
  const fills = LEVEL_FILLS[level];
  const tfs = LEVEL_TF[level];
  const generated: AssessmentQuestion[] = [];

  vocab.forEach((entry, i) => {
    generated.push(makeMc(level, `${level.toLowerCase()}-gen-mc-${i}`, entry));
    if (i % 2 === 0) {
      generated.push(
        makeMatch(level, `${level.toLowerCase()}-gen-match-${i}`, entry)
      );
    }
  });

  fills.forEach((entry, i) => {
    generated.push(makeFill(level, `${level.toLowerCase()}-gen-fill-${i}`, entry));
  });

  tfs.forEach((entry, i) => {
    generated.push(makeTf(level, `${level.toLowerCase()}-gen-tf-${i}`, entry));
  });

  return generated;
}

export function getLevelQuestions(level: CEFRLevel): AssessmentQuestion[] {
  const existing = cefrAssessmentQuestions.filter((q) => q.level === level);
  const generated = generateForLevel(level);
  const seen = new Set<string>();
  const pool: AssessmentQuestion[] = [];

  for (const q of [...existing, ...generated]) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    pool.push(q);
  }

  const ordered = shuffleStable(pool, `level-test-${level}`);
  return ordered.slice(0, QUESTIONS_PER_LEVEL);
}

export function getLevelQuestionCount(level: CEFRLevel): number {
  return getLevelQuestions(level).length;
}
