import type { CatalogCourse } from "@/lib/types/course-catalog";

/** 平台通用课程资源中心 — HR 可从中选课分配给员工 */
export const GENERAL_COURSE_CATALOG: CatalogCourse[] = [
  {
    id: "catalog-front-desk",
    title: "前厅英语 · 四大岗位",
    description:
      "接待、礼宾、预订、客服四大方向，按 CEFR 级别闯关，含词汇、句型、对话与 50 个模拟场景/级。",
    category: "front-desk",
    phase: "role",
    ask: "skill",
    durationMinutes: 120,
    lessonCount: 200,
    tags: ["岗位必修", "模拟场景"],
    delivery: {
      type: "link",
      href: "/courses/front-desk",
      linkLabel: "进入前厅课程",
    },
  },
  {
    id: "catalog-cefr-assessment",
    title: "CEFR 英语水平测评",
    description: "A1–C1 分级测评，确定学习起点并解锁对应级别课程内容。",
    category: "english",
    phase: "onboarding",
    ask: "knowledge",
    durationMinutes: 30,
    lessonCount: 5,
    tags: ["入职推荐"],
    delivery: {
      type: "link",
      href: "/assessment",
      linkLabel: "开始测评",
    },
  },
  {
    id: "catalog-culture",
    title: "酒店文化与品牌服务理念",
    description:
      "了解酒店品牌价值观、服务标准与宾客体验设计，建立统一的服务意识。",
    category: "onboarding",
    phase: "onboarding",
    ask: "attitude",
    durationMinutes: 25,
    lessonCount: 4,
    tags: ["入职必修"],
    delivery: {
      type: "training",
      slides: [
        {
          id: "c1",
          order: 1,
          title: "品牌使命与价值观",
          narration:
            "每位员工都是品牌大使。我们的使命是为宾客创造难忘的体验，价值观包括：尊重、专业、创新、协作。",
          bullets: ["品牌大使意识", "使命：创造难忘体验", "尊重 · 专业 · 创新 · 协作"],
          durationSec: 28,
        },
        {
          id: "c2",
          order: 2,
          title: "宾客体验设计",
          narration:
            "从预订到离店，每个触点都应传递一致的品牌温度。关注细节：称呼、眼神、个性化关怀。",
          bullets: ["全旅程触点", "一致的品牌温度", "个性化关怀"],
          durationSec: 24,
        },
        {
          id: "c3",
          order: 3,
          title: "服务承诺",
          narration:
            "我们承诺：及时响应宾客需求、主动预判问题、超出预期的服务细节。",
          bullets: ["及时响应", "主动预判", "超出预期"],
          durationSec: 22,
        },
      ],
      questions: [
        {
          id: "cq1",
          prompt: "员工在酒店品牌传播中的角色是？",
          options: ["品牌大使", "旁观者", "仅执行指令", "无需关注品牌"],
          correctAnswer: "品牌大使",
          explanation: "每位员工都是品牌大使，代表酒店形象。",
        },
        {
          id: "cq2",
          prompt: "服务承诺不包括以下哪项？",
          options: ["及时响应", "主动预判", "仅完成本职不延伸", "超出预期"],
          correctAnswer: "仅完成本职不延伸",
          explanation: "服务承诺强调主动与超出预期。",
        },
      ],
    },
  },
  {
    id: "catalog-safety",
    title: "安全卫生与合规须知",
    description: "消防、食品安全、个人防护与酒店合规操作规范，全员必修。",
    category: "compliance",
    phase: "onboarding",
    ask: "knowledge",
    durationMinutes: 30,
    lessonCount: 5,
    tags: ["合规", "全员"],
    delivery: {
      type: "training",
      slides: [
        {
          id: "s1",
          order: 1,
          title: "消防安全",
          narration:
            "熟悉最近疏散路线与集合点，不得遮挡消防通道。发现火情立即按 RACE 原则：Rescue 救援、Alarm 报警、Contain  containment、Evacuate 疏散。",
          bullets: ["熟悉疏散路线", "不遮挡消防通道", "RACE 原则"],
          durationSec: 30,
        },
        {
          id: "s2",
          order: 2,
          title: "食品安全与卫生",
          narration:
            "接触食品或宾客用品前须洗手，生熟分开，过期物品及时下架。发现异物或异味立即上报。",
          bullets: ["洗手规范", "生熟分开", "异常上报"],
          durationSec: 26,
        },
        {
          id: "s3",
          order: 3,
          title: "数据与隐私",
          narration:
            "宾客信息严格保密，不得外泄。系统账号不得共用，离岗锁屏。",
          bullets: ["信息保密", "账号不共用", "离岗锁屏"],
          durationSec: 20,
        },
      ],
      questions: [
        {
          id: "sq1",
          prompt: "RACE 原则中 A 代表？",
          options: ["Alarm 报警", "Assist 协助", "Avoid 避免", "Answer 应答"],
          correctAnswer: "Alarm 报警",
          explanation: "RACE：Rescue、Alarm、Contain、Evacuate。",
        },
        {
          id: "sq2",
          prompt: "宾客个人信息应如何处理？",
          options: ["严格保密", "同事间可分享", "可发社交媒体", "无需特别处理"],
          correctAnswer: "严格保密",
          explanation: "宾客信息属于隐私，必须严格保密。",
        },
      ],
    },
  },
  {
    id: "catalog-grooming",
    title: "仪容仪表与职业形象",
    description: "制服标准、妆容发型、工牌佩戴与职业行为准则。",
    category: "onboarding",
    phase: "onboarding",
    ask: "attitude",
    durationMinutes: 20,
    lessonCount: 3,
    delivery: {
      type: "training",
      slides: [
        {
          id: "g1",
          order: 1,
          title: "制服与仪容",
          narration:
            "制服应熨烫平整、无污渍，鞋子擦亮。发型整洁，淡妆上岗，禁止夸张饰品。",
          bullets: ["制服平整", "发型整洁", "淡妆上岗"],
          durationSec: 22,
        },
        {
          id: "g2",
          order: 2,
          title: "工牌与标识",
          narration: "工牌佩戴于左胸显眼位置，姓名朝外。遗失立即上报补办。",
          bullets: ["左胸佩戴", "姓名朝外", "遗失上报"],
          durationSec: 18,
        },
      ],
      questions: [
        {
          id: "gq1",
          prompt: "工牌标准佩戴位置？",
          options: ["左胸", "右胸", "腰带", "口袋"],
          correctAnswer: "左胸",
          explanation: "工牌应佩戴于左胸显眼位置。",
        },
      ],
    },
  },
  {
    id: "catalog-communication",
    title: "跨部门沟通与服务协作",
    description: "前厅、客房、餐饮、工程等部门协作流程与信息传递规范。",
    category: "general",
    phase: "general",
    ask: "attitude",
    durationMinutes: 25,
    lessonCount: 4,
    tags: ["通用技能"],
    delivery: {
      type: "training",
      slides: [
        {
          id: "m1",
          order: 1,
          title: "协作意识",
          narration:
            "宾客需求往往跨部门。接到需求后应确认责任部门，主动跟进直至闭环，避免宾客重复说明。",
          bullets: ["确认责任部门", "主动跟进", "闭环服务"],
          durationSec: 24,
        },
        {
          id: "m2",
          order: 2,
          title: "信息传递标准",
          narration:
            "使用统一工单或系统记录，包含：房号、需求、时效、联系人。口头交接需复述确认。",
          bullets: ["统一工单", "关键信息完整", "复述确认"],
          durationSec: 22,
        },
      ],
      questions: [
        {
          id: "mq1",
          prompt: "跨部门协作的核心原则是？",
          options: ["主动跟进直至闭环", "转交即可不管", "让宾客自行联系", "仅口头告知"],
          correctAnswer: "主动跟进直至闭环",
          explanation: "避免宾客重复说明，需主动跟进闭环。",
        },
      ],
    },
  },
  {
    id: "catalog-recovery",
    title: "客诉处理与服务补救",
    description: "LEARN 模型、情绪安抚话术、升级流程与补偿授权边界。",
    category: "general",
    phase: "general",
    ask: "skill",
    durationMinutes: 35,
    lessonCount: 5,
    tags: ["通用技能", "情景模拟"],
    delivery: {
      type: "training",
      slides: [
        {
          id: "r1",
          order: 1,
          title: "LEARN 模型",
          narration:
            "Listen 倾听、Empathize 共情、Apologize 致歉、Respond 回应、Notify 跟进。先处理情绪，再处理事情。",
          bullets: ["倾听与共情", "真诚致歉", "及时回应与跟进"],
          durationSec: 28,
        },
        {
          id: "r2",
          order: 2,
          title: "升级与授权",
          narration:
            "超出授权范围的补偿须上报值班经理。记录客诉详情，24 小时内回访。",
          bullets: ["授权边界", "上报流程", "24 小时回访"],
          durationSec: 24,
        },
      ],
      questions: [
        {
          id: "rq1",
          prompt: "LEARN 模型中第一步是？",
          options: ["Listen 倾听", "Apologize 致歉", "Notify 跟进", "Respond 回应"],
          correctAnswer: "Listen 倾听",
          explanation: "先倾听，再共情与致歉。",
        },
      ],
    },
  },
  {
    id: "catalog-english-general",
    title: "酒店英语通用场景",
    description: "入住、问询、投诉、结账等跨岗位高频英语表达与发音练习。",
    category: "english",
    phase: "general",
    ask: "skill",
    durationMinutes: 45,
    lessonCount: 12,
    tags: ["英语", "跨岗位"],
    delivery: {
      type: "link",
      href: "/courses",
      linkLabel: "进入场景课程",
    },
  },
  {
    id: "catalog-allergy",
    title: "过敏原与特殊饮食告知",
    description: "识别常见过敏原、宾客询问时的标准应答与厨房传递规范。",
    category: "compliance",
    phase: "general",
    ask: "knowledge",
    durationMinutes: 20,
    lessonCount: 3,
    tags: ["合规", "餐饮协作"],
    delivery: {
      type: "training",
      slides: [
        {
          id: "a1",
          order: 1,
          title: "八大过敏原",
          narration:
            "熟知八大类：麸质、甲壳类、鸡蛋、鱼、花生、大豆、奶、坚果。宾客询问时不得猜测，须核实厨房。",
          bullets: ["八大过敏原", "不猜测", "核实厨房"],
          durationSec: 26,
        },
      ],
      questions: [
        {
          id: "aq1",
          prompt: "宾客询问某道菜是否含坚果时，正确做法是？",
          options: ["核实厨房后准确答复", "凭经验回答", "说应该没有", "建议宾客不吃"],
          correctAnswer: "核实厨房后准确答复",
          explanation: "过敏信息必须准确，须核实厨房。",
        },
      ],
    },
  },
];

export function getCatalogCourseById(id: string) {
  return GENERAL_COURSE_CATALOG.find((c) => c.id === id);
}

export function getCatalogCoursesByCategory(category: CatalogCourse["category"]) {
  return GENERAL_COURSE_CATALOG.filter((c) => c.category === category);
}
