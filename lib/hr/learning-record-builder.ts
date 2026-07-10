import { loadLevelTestProgress } from "@/lib/assessment/level-progress-storage";
import { buildProgressionMap } from "@/lib/course/progression-map";
import { loadFrontDeskProgress } from "@/lib/course/progress-storage";
import { moduleToAsk } from "@/lib/hr/ask-mapping";
import {
  getCourseTrackForDepartment,
  getDepartmentLabel,
} from "@/lib/hr/hotel-department-storage";
import { getVisibleManagementModules } from "@/lib/hr/management-training-storage";
import { STATIC_CURRICULUM, type StaticCurriculumItem } from "@/lib/hr/onboarding-curriculum";
import { getLearningHistory } from "@/lib/hr/learning-history-storage";
import {
  getModuleScore,
  isModuleCompleted,
  loadTrainingProgress,
} from "@/lib/hr/training-progress-storage";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import type {
  AskDimension,
  AskSummary,
  LearningItemStatus,
  LearningPhase,
  LearningRecordItem,
  PhaseSummary,
  ProbationLearningReport,
} from "@/lib/types/learning-record";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
  LEARNING_PHASE_ORDER,
  PROBATION_DAYS_DEFAULT,
} from "@/lib/types/learning-record";
import type { ProgressionNode } from "@/lib/types/course-progress";

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function defaultHireDate(employee: EmployeeLearningRecord): string {
  if (employee.hireDate) return employee.hireDate.slice(0, 10);
  const d = new Date(employee.lastActiveAt);
  d.setDate(d.getDate() - 45);
  return d.toISOString().slice(0, 10);
}

function defaultProbationEnd(employee: EmployeeLearningRecord, hire: string): string {
  if (employee.probationEndDate) return employee.probationEndDate.slice(0, 10);
  return addDays(hire, PROBATION_DAYS_DEFAULT);
}

function getCompletedNodeIds(employee: EmployeeLearningRecord): Set<string> {
  if (employee.isLiveUser && typeof window !== "undefined") {
    const progress = loadFrontDeskProgress();
    return new Set(progress.completedNodeIds);
  }

  const track = getCourseTrackForDepartment(employee.hotel, employee.department);
  const nodes = buildProgressionMap(track);
  const n = Math.round((nodes.length * employee.courseProgressPercent) / 100);
  return new Set(nodes.slice(0, n).map((node) => node.id));
}

function nodeTitle(node: ProgressionNode): string {
  if (node.simulationTitle) {
    return `${node.workScenarioTitle} · 模拟 #${node.simulationNumber ?? ""}`;
  }
  return `${node.workScenarioTitle} · ${node.moduleLabel}`;
}

function buildRoleItems(
  employee: EmployeeLearningRecord,
  completedIds: Set<string>
): LearningRecordItem[] {
  if (employee.department === "other") return [];

  const track = getCourseTrackForDepartment(employee.hotel, employee.department);
  const deptLabel = getDepartmentLabel(employee.hotel, employee.department);
  const nodes = buildProgressionMap(track);
  const history = getLearningHistory(employee.id);
  const historyByNode = new Map(
    history.filter((h) => h.nodeId).map((h) => [h.nodeId!, h])
  );

  return nodes.map((node) => {
    const done = completedIds.has(node.id);
    const hist = historyByNode.get(node.id);
    return {
      id: `role-${node.id}`,
      phase: "role" as const,
      ask: moduleToAsk(node.module),
      title: nodeTitle(node),
      subtitle: `${node.zoneLabel} · ${deptLabel}`,
      completedAt: done ? (hist?.at ?? employee.lastActiveAt) : null,
      status: (done ? "completed" : "not_started") as LearningItemStatus,
      durationMinutes: node.module === "scenario" ? 8 : 12,
    };
  });
}

function staticItemStatus(
  item: StaticCurriculumItem,
  employee: EmployeeLearningRecord,
  history: ReturnType<typeof getLearningHistory>
): { status: LearningItemStatus; completedAt: string | null; score?: number } {
  const historyMatch = history.find(
    (entry) =>
      entry.title === item.title ||
      (entry.phase === item.phase && entry.title.includes(item.title.slice(0, 6)))
  );
  if (historyMatch) {
    return {
      status: "completed",
      completedAt: historyMatch.at,
      score: historyMatch.score,
    };
  }

  if (item.id === "ob-baseline") {
    if (employee.isLiveUser && typeof window !== "undefined") {
      const a1 = loadLevelTestProgress().A1;
      if (a1?.passed) {
        return {
          status: "completed",
          completedAt: a1.date ?? employee.lastActiveAt,
          score: a1.score,
        };
      }
    }
    if (employee.passedAssessmentLevels.includes("A1")) {
      return {
        status: "completed",
        completedAt: employee.lastActiveAt,
        score: employee.assessmentScore > 0 ? employee.assessmentScore : undefined,
      };
    }
  }

  if (item.id === "gen-cefr") {
    const passedCount = employee.passedAssessmentLevels.length;
    if (passedCount >= 2) {
      return { status: "completed", completedAt: employee.lastActiveAt, score: employee.assessmentScore };
    }
    if (passedCount === 1) {
      return { status: "in_progress", completedAt: null, score: employee.assessmentScore };
    }
  }

  if (item.id === "gen-english") {
    const completedLessons =
      employee.isLiveUser && typeof window !== "undefined"
        ? loadFrontDeskProgress().completedNodeIds.length
        : employee.completedLessons;
    if (completedLessons <= 0) {
      return { status: "not_started", completedAt: null };
    }
    const totalTarget = Math.max(1, Math.round(employee.totalLessons * 0.4));
    if (completedLessons >= totalTarget) {
      return { status: "completed", completedAt: employee.lastActiveAt };
    }
    return { status: "in_progress", completedAt: null };
  }

  return { status: "not_started", completedAt: null };
}

function buildManagementItems(employee: EmployeeLearningRecord): LearningRecordItem[] {
  const dept = employee.department === "other" ? "reception" : employee.department;
  const modules = getVisibleManagementModules(employee.hotel, dept);

  return modules.map((mod) => {
    const done = isModuleCompleted(mod.id, employee.id);
    const score = getModuleScore(mod.id, employee.id);
    return {
      id: mod.id,
      phase: "management" as const,
      ask: mod.ask,
      title: mod.title,
      subtitle: "Management Training · 管理培训",
      completedAt: done ? (loadTrainingCompletedAt(mod.id, employee.id) ?? employee.lastActiveAt) : null,
      status: (done ? "completed" : "not_started") as LearningItemStatus,
      score: score ?? undefined,
      durationMinutes: Math.max(1, Math.ceil(mod.slideCount * 8)),
    };
  });
}

function loadTrainingCompletedAt(moduleId: string, userId: string): string | null {
  if (typeof window === "undefined") return null;
  return loadTrainingProgress(userId).completedAt[moduleId] ?? null;
}

function buildStaticItems(employee: EmployeeLearningRecord): LearningRecordItem[] {
  const history = getLearningHistory(employee.id);
  return STATIC_CURRICULUM.map((item) => {
    const { status, completedAt, score } = staticItemStatus(item, employee, history);
    return {
      id: item.id,
      phase: item.phase,
      ask: item.ask,
      title: item.title,
      subtitle: item.subtitle,
      completedAt,
      status,
      score,
      durationMinutes: 30,
    };
  });
}

function summarizePhase(
  phase: LearningPhase,
  items: LearningRecordItem[]
): PhaseSummary {
  const phaseItems = items.filter((i) => i.phase === phase);
  const completed = phaseItems.filter((i) => i.status === "completed").length;
  const total = phaseItems.length;
  return {
    phase,
    label: LEARNING_PHASE_LABELS[phase],
    items: phaseItems,
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function summarizeAsk(items: LearningRecordItem[]): AskSummary[] {
  const dims: AskDimension[] = ["attitude", "skill", "knowledge"];
  return dims.map((dimension) => {
    const dimItems = items.filter((i) => i.ask === dimension);
    const completed = dimItems.filter((i) => i.status === "completed").length;
    const total = dimItems.length;
    return {
      dimension,
      label: ASK_SHORT[dimension],
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
}

function buildRecommendation(
  report: Omit<ProbationLearningReport, "recommendation">
): string {
  const { overallPercent, probationStatus, askSummary } = report;
  const weak = askSummary.filter((a) => a.percent < 60);

  if (probationStatus === "upcoming") {
    return "员工尚未到入职日期，请安排入职培训计划。";
  }
  if (overallPercent >= 80) {
    return "试用期学习表现优秀，ASK 三维度均达到岗位要求，建议按期转正。";
  }
  if (overallPercent >= 60) {
    const weakLabels = weak.map((w) => w.label).join("、");
    return weakLabels
      ? `整体进度达标，建议转正前加强 ${weakLabels} 维度学习并完成剩余岗位模拟场景。`
      : "整体进度达标，建议完成剩余岗位课程后按期转正。";
  }
  if (probationStatus === "completed") {
    return "试用期已结束但学习进度未达标，建议延长试用期或安排跟岗辅导。";
  }
  return "学习进度偏慢，建议主管跟进在岗学习安排，优先完成入职培训与岗位基础关。";
}

export function buildProbationLearningReport(
  employee: EmployeeLearningRecord
): ProbationLearningReport {
  const hireDate = defaultHireDate(employee);
  const probationEndDate = defaultProbationEnd(employee, hireDate);
  const today = new Date().toISOString().slice(0, 10);
  const completedIds = getCompletedNodeIds(employee);

  const staticItems = buildStaticItems(employee);
  const roleItems = buildRoleItems(employee, completedIds);
  const managementItems = buildManagementItems(employee);
  const allItems = [...staticItems, ...roleItems, ...managementItems];

  const phases = LEARNING_PHASE_ORDER.map((phase) => summarizePhase(phase, allItems));
  const askSummary = summarizeAsk(allItems);
  const totalCompleted = allItems.filter((i) => i.status === "completed").length;
  const overallPercent =
    allItems.length > 0 ? Math.round((totalCompleted / allItems.length) * 100) : 0;

  let probationStatus: ProbationLearningReport["probationStatus"] = "in_progress";
  if (today < hireDate) probationStatus = "upcoming";
  else if (today > probationEndDate) probationStatus = "completed";

  const base = {
    employee,
    hireDate,
    probationEndDate,
    generatedAt: new Date().toISOString(),
    phases,
    askSummary,
    overallPercent,
    probationStatus,
  };

  return {
    ...base,
    recommendation: buildRecommendation(base),
  };
}

export function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
