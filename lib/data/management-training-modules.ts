import type { HrTrainingModule } from "@/lib/types/hr-training";

const NOW = "2026-01-01T00:00:00.000Z";

/** 平台内置 Management Training 课程（主管 / 储备干部） */
export const BUILTIN_MANAGEMENT_MODULES: HrTrainingModule[] = [
  {
    id: "mgmt-leadership",
    hotel: "*",
    title: "领导力与团队激励",
    fileName: "leadership-fundamentals.pptx",
    uploadedAt: NOW,
    department: "all",
    phase: "management",
    ask: "attitude",
    slideCount: 3,
    questionCount: 3,
    slides: [
      {
        id: "s1",
        order: 1,
        title: "管理者角色转变",
        narration:
          "从一线员工到管理者，核心转变是从「自己做好」到「带领团队做好」。管理者需建立信任、明确目标，并通过日常沟通传递酒店服务标准。",
        bullets: [
          "从执行者到引领者的思维转变",
          "建立信任是管理的第一步",
          "用沟通传递品牌服务标准",
        ],
        durationSec: 30,
      },
      {
        id: "s2",
        order: 2,
        title: "激励与认可",
        narration:
          "有效的激励包括及时认可、具体反馈与成长机会。公开表扬优秀案例，私下辅导改进空间；让团队成员看见自己的贡献与职业发展路径。",
        bullets: ["及时、具体的认可", "公开表扬 · 私下辅导", "连接个人成长与团队目标"],
        durationSec: 28,
      },
      {
        id: "s3",
        order: 3,
        title: "情景：班前会主持",
        narration:
          "班前会应控制在 10–15 分钟：回顾昨日亮点、明确今日重点、强调安全与宾客体验。用英语带读一句服务用语，提升团队专业形象。",
        bullets: ["10–15 分钟高效班前会", "亮点回顾 + 今日重点", "英语服务用语带读"],
        durationSec: 25,
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "管理者最核心的角色转变是什么？",
        options: [
          "从自己做好到带领团队做好",
          "减少与员工的沟通",
          "只关注个人绩效",
          "避免给予反馈",
        ],
        correctAnswer: "从自己做好到带领团队做好",
        explanation: "管理的关键是从执行者转变为团队引领者。",
      },
      {
        id: "q2",
        prompt: "关于员工激励，以下哪项最恰当？",
        options: [
          "及时、具体的认可与反馈",
          "只在年终统一表扬",
          "只批评不表扬",
          "避免讨论职业发展",
        ],
        correctAnswer: "及时、具体的认可与反馈",
        explanation: "及时认可能强化正向行为，具体反馈帮助员工改进。",
      },
      {
        id: "q3",
        prompt: "班前会的建议时长是？",
        options: ["10–15 分钟", "45–60 分钟", "2 小时", "不必固定"],
        correctAnswer: "10–15 分钟",
        explanation: "高效班前会应简短聚焦，明确当日重点。",
      },
    ],
  },
  {
    id: "mgmt-performance",
    hotel: "*",
    title: "绩效考核与员工辅导",
    fileName: "performance-coaching.docx",
    uploadedAt: NOW,
    department: "all",
    phase: "management",
    ask: "skill",
    slideCount: 3,
    questionCount: 3,
    slides: [
      {
        id: "s1",
        order: 1,
        title: "SMART 目标设定",
        narration:
          "与员工共同设定 SMART 目标：具体、可衡量、可实现、相关、有时限。例如「本季度宾客满意度调查好评率达 95%」而非模糊的「提高服务质量」。",
        bullets: ["Specific 具体", "Measurable 可衡量", "Achievable 可实现"],
        durationSec: 28,
      },
      {
        id: "s2",
        order: 2,
        title: "辅导式反馈",
        narration:
          "辅导反馈采用 SBI 模型：描述 Situation（情境）、Behavior（行为）、Impact（影响）。对事不对人，聚焦可改变的行为，并共同制定下一步行动计划。",
        bullets: ["SBI：情境 · 行为 · 影响", "对事不对人", "共同制定行动计划"],
        durationSec: 30,
      },
      {
        id: "s3",
        order: 3,
        title: "PIP 与改进计划",
        narration:
          "当绩效持续不达标时，启动绩效改进计划（PIP）：明确差距、支持资源、检查节点与后果。全程文档化，给予公平机会，同时保护团队整体服务水准。",
        bullets: ["明确差距与支持资源", "设定检查节点", "全程文档化、公平公正"],
        durationSec: 27,
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "SMART 目标中的 M 代表？",
        options: ["可衡量 (Measurable)", "管理 (Management)", "月度 (Monthly)", "动机 (Motivation)"],
        correctAnswer: "可衡量 (Measurable)",
        explanation: "SMART 中 M = Measurable，目标需可量化评估。",
      },
      {
        id: "q2",
        prompt: "SBI 反馈模型不包括以下哪项？",
        options: ["Salary 薪资", "Situation 情境", "Behavior 行为", "Impact 影响"],
        correctAnswer: "Salary 薪资",
        explanation: "SBI 指 Situation、Behavior、Impact，与薪资无关。",
      },
      {
        id: "q3",
        prompt: "启动 PIP 的主要目的是？",
        options: [
          "给予改进机会并明确标准",
          "立即解雇员工",
          "减少培训投入",
          "取消所有绩效评估",
        ],
        correctAnswer: "给予改进机会并明确标准",
        explanation: "PIP 在保护团队标准的同时，给予员工公平改进机会。",
      },
    ],
  },
  {
    id: "mgmt-operations",
    hotel: "*",
    title: "酒店运营与跨部门协作",
    fileName: "operations-coordination.pptx",
    uploadedAt: NOW,
    department: "all",
    phase: "management",
    ask: "knowledge",
    slideCount: 3,
    questionCount: 3,
    slides: [
      {
        id: "s1",
        order: 1,
        title: "RevPAR 与经营意识",
        narration:
          "管理者需理解 RevPAR（每间可售房收入）= 出租率 × 平均房价。日常决策如升级销售、控制成本、优化排班，都应与营收和宾客体验平衡。",
        bullets: ["RevPAR = 出租率 × 平均房价", "平衡营收与宾客体验", "排班与成本意识"],
        durationSec: 32,
      },
      {
        id: "s2",
        order: 2,
        title: "跨部门协作机制",
        narration:
          "宾客体验链条横跨前厅、客房、餐饮、工程等部门。建立标准 handover 流程、共享宾客偏好信息，重大投诉由值班经理牵头跨部门复盘。",
        bullets: ["标准交接流程", "共享宾客偏好", "重大投诉跨部门复盘"],
        durationSec: 28,
      },
      {
        id: "s3",
        order: 3,
        title: "危机与突发事件",
        narration:
          "突发事件遵循：保障宾客与员工安全 → 控制影响范围 → 及时上报 → 事后复盘。管理者应熟悉应急预案联系人，并在班前会中强调当日风险点。",
        bullets: ["安全优先", "及时上报与文档记录", "事后复盘改进"],
        durationSec: 26,
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "RevPAR 的正确计算方式是？",
        options: [
          "出租率 × 平均房价",
          "总营收 ÷ 员工人数",
          "房间数 × 入住天数",
          "餐饮收入 + 房费收入",
        ],
        correctAnswer: "出租率 × 平均房价",
        explanation: "RevPAR = Occupancy × ADR，是酒店核心经营指标。",
      },
      {
        id: "q2",
        prompt: "跨部门协作中，重大投诉应由谁牵头？",
        options: ["值班经理", "仅前台自行处理", "工程部", "无需复盘"],
        correctAnswer: "值班经理",
        explanation: "重大投诉需值班经理牵头跨部门协调与复盘。",
      },
      {
        id: "q3",
        prompt: "突发事件处理的第一优先级是？",
        options: [
          "保障宾客与员工安全",
          "尽快恢复营业",
          "隐瞒信息",
          "等待上级指示不行动",
        ],
        correctAnswer: "保障宾客与员工安全",
        explanation: "任何危机处理都应以人员安全为第一优先级。",
      },
    ],
  },
  {
    id: "mgmt-decision",
    hotel: "*",
    title: "管理情景模拟：决策与沟通",
    fileName: "management-scenarios.pptx",
    uploadedAt: NOW,
    department: "all",
    phase: "management",
    ask: "skill",
    slideCount: 2,
    questionCount: 2,
    slides: [
      {
        id: "s1",
        order: 1,
        title: "情景：满房与 VIP 抵达",
        narration:
          "酒店满房时 VIP 无预订抵达。管理者应：安抚宾客、协调升级或外协安排、提供补偿方案、跟进满意度。同时复盘预订与库存沟通流程。",
        bullets: ["优先安抚 VIP 宾客", "协调升级或外协方案", "复盘预订流程"],
        durationSec: 30,
      },
      {
        id: "s2",
        order: 2,
        title: "情景：团队冲突调解",
        narration:
          "当两名员工在宾客可见区域发生争执，管理者应立即分开双方、转移宾客注意力、私下分别倾听、聚焦事实与行为、明确服务红线并记录。",
        bullets: ["立即分开、降低影响", "私下倾听双方", "明确服务红线"],
        durationSec: 28,
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "满房 VIP 无预订抵达时，首要行动是？",
        options: [
          "安抚宾客并协调解决方案",
          "告知无法接待后结束",
          "让前台自行处理不管",
          "仅记录不跟进",
        ],
        correctAnswer: "安抚宾客并协调解决方案",
        explanation: "VIP 体验优先，需主动协调升级或外协等方案。",
      },
      {
        id: "q2",
        prompt: "员工在宾客可见区域冲突，管理者应？",
        options: [
          "立即分开双方并私下处理",
          "当众批评双方",
          "等待冲突自行结束",
          "仅处罚其中一人",
        ],
        correctAnswer: "立即分开双方并私下处理",
        explanation: "先控制现场影响，再私下调解并明确服务红线。",
      },
    ],
  },
];

export function getBuiltinManagementModules(): HrTrainingModule[] {
  return BUILTIN_MANAGEMENT_MODULES.map((m) => ({ ...m }));
}
