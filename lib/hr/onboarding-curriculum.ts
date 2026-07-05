import type { AskDimension, LearningPhase } from "@/lib/types/learning-record";

export type StaticCurriculumItem = {
  id: string;
  phase: LearningPhase;
  ask: AskDimension;
  title: string;
  subtitle: string;
  order: number;
};

/** 入职培训 + 通用技能（全岗位共用） */
export const STATIC_CURRICULUM: StaticCurriculumItem[] = [
  {
    id: "ob-culture",
    phase: "onboarding",
    ask: "attitude",
    title: "酒店文化与品牌服务理念",
    subtitle: "在线学习 · 入职必修",
    order: 1,
  },
  {
    id: "ob-safety",
    phase: "onboarding",
    ask: "knowledge",
    title: "安全卫生与合规须知",
    subtitle: "在线学习 · 入职必修",
    order: 2,
  },
  {
    id: "ob-grooming",
    phase: "onboarding",
    ask: "attitude",
    title: "仪容仪表与职业形象",
    subtitle: "在线学习 · 入职必修",
    order: 3,
  },
  {
    id: "ob-platform",
    phase: "onboarding",
    ask: "knowledge",
    title: "学习平台注册与使用指引",
    subtitle: "在线学习 · 入职必修",
    order: 4,
  },
  {
    id: "ob-baseline",
    phase: "onboarding",
    ask: "skill",
    title: "英语基线水平测评 (A1)",
    subtitle: "CEFR 测评 · 确定起点",
    order: 5,
  },
  {
    id: "gen-communication",
    phase: "general",
    ask: "attitude",
    title: "跨部门沟通与服务协作",
    subtitle: "通用技能 · 全员",
    order: 1,
  },
  {
    id: "gen-recovery",
    phase: "general",
    ask: "skill",
    title: "客诉处理与服务补救",
    subtitle: "通用技能 · 全员",
    order: 2,
  },
  {
    id: "gen-english",
    phase: "general",
    ask: "skill",
    title: "酒店英语通用场景训练",
    subtitle: "模拟场景 · 跨岗位",
    order: 3,
  },
  {
    id: "gen-cefr",
    phase: "general",
    ask: "knowledge",
    title: "CEFR 持续测评与晋级",
    subtitle: "英语能力认证",
    order: 4,
  },
];
