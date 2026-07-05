import { getFrontDeskWorkScenarios } from "@/lib/course/course-content-resolver";
import { getDepartmentLevelSimulations } from "@/lib/data/front-desk/simulation-generator";
import {
  CEFR_LABELS,
  CEFR_LEVELS,
  getScenarioLevelContent,
  type CefrLevel,
} from "@/lib/types/course";
import { TRIAL_CEFR_LEVEL } from "@/lib/assessment/course-access";
import type { ProgressionNode } from "@/lib/types/course-progress";
import { MODULE_LABELS, MODULE_ORDER } from "@/lib/types/course-progress";
import {
  DEPARTMENT_BY_ID,
  type FrontDeskDepartmentId,
} from "@/lib/types/front-desk-department";
import { getDepartmentScenarioIds } from "@/lib/course/department-scenarios";

export function buildProgressionMap(
  departmentId: FrontDeskDepartmentId
): ProgressionNode[] {
  const scenarioIds = new Set(getDepartmentScenarioIds(departmentId));
  const department = DEPARTMENT_BY_ID[departmentId];
  const nodes: ProgressionNode[] = [];
  let order = 0;

  for (const cefrLevel of CEFR_LEVELS) {
    const zoneLabel = `${cefrLevel} · ${CEFR_LABELS[cefrLevel]}`;
    const deptSimulations = getDepartmentLevelSimulations(
      departmentId,
      cefrLevel
    );

    for (const workScenario of getFrontDeskWorkScenarios()) {
      if (!scenarioIds.has(workScenario.id)) continue;

      const content = getScenarioLevelContent(workScenario, cefrLevel);

      for (const module of MODULE_ORDER) {
        if (module === "scenario") {
          const categorySimulations = deptSimulations.filter(
            (s) => s.categoryId === workScenario.id
          );
          if (categorySimulations.length === 0) continue;

          for (const simulation of categorySimulations) {
            nodes.push({
              id: `${departmentId}-${cefrLevel}-${workScenario.id}-scenario-${simulation.id}`,
              order,
              cefrLevel,
              departmentId,
              departmentTitle: department.title,
              workScenarioId: workScenario.id,
              workScenarioTitle: workScenario.title,
              workScenarioSubtitle: workScenario.subtitle,
              module,
              moduleLabel: MODULE_LABELS[module],
              zoneLabel,
              simulationId: simulation.id,
              simulationTitle: simulation.title,
              simulationNumber: simulation.simulationNumber,
            });
            order++;
          }
          continue;
        }

        if (!content) continue;

        const count =
          module === "words"
            ? content.words.length
            : module === "sentences"
              ? content.sentences.length
              : content.dialogues.length;

        if (count === 0) continue;

        nodes.push({
          id: `${departmentId}-${cefrLevel}-${workScenario.id}-${module}`,
          order,
          cefrLevel,
          departmentId,
          departmentTitle: department.title,
          workScenarioId: workScenario.id,
          workScenarioTitle: workScenario.title,
          workScenarioSubtitle: workScenario.subtitle,
          module,
          moduleLabel: MODULE_LABELS[module],
          zoneLabel,
        });
        order++;
      }
    }
  }

  return nodes;
}

export function getProgressionMapStats(nodes: ProgressionNode[]) {
  const zones = CEFR_LEVELS.map((level) => ({
    level,
    label: CEFR_LABELS[level],
    count: nodes.filter((n) => n.cefrLevel === level).length,
  }));
  const scenarioCount = new Set(nodes.map((n) => n.workScenarioId)).size;
  return { totalNodes: nodes.length, zones, scenarioCount };
}

export type NodeStatus = "locked" | "current" | "completed";

export function getNodeStatus(
  node: ProgressionNode,
  nodes: ProgressionNode[],
  completedIds: string[]
): NodeStatus {
  if (completedIds.includes(node.id)) return "completed";

  const index = nodes.findIndex((n) => n.id === node.id);
  if (index === 0) return "current";

  const prev = nodes[index - 1];
  if (prev && completedIds.includes(prev.id)) return "current";

  return "locked";
}

export function getCurrentNode(
  nodes: ProgressionNode[],
  completedIds: string[]
): ProgressionNode | null {
  return (
    nodes.find((n) => getNodeStatus(n, nodes, completedIds) === "current") ??
    null
  );
}

export function getProgressPercent(
  nodes: ProgressionNode[],
  completedIds: string[]
): number {
  if (nodes.length === 0) return 0;
  const inScope = completedIds.filter((id) =>
    nodes.some((n) => n.id === id)
  ).length;
  return Math.round((inScope / nodes.length) * 100);
}

export function isNodeUnlocked(
  node: ProgressionNode,
  nodes: ProgressionNode[],
  completedIds: string[]
): boolean {
  return getNodeStatus(node, nodes, completedIds) !== "locked";
}

/** 在可访问级别中，选择第一个有课程内容的级别 */
export function pickStudyLevelForMap(
  nodes: ProgressionNode[],
  maxLevel: CefrLevel | null,
  preferred: CefrLevel
): CefrLevel {
  const effectiveMax = maxLevel ?? TRIAL_CEFR_LEVEL;
  const maxIdx = CEFR_LEVELS.indexOf(effectiveMax);
  const preferredHasNodes = nodes.some((n) => n.cefrLevel === preferred);
  if (preferredHasNodes && CEFR_LEVELS.indexOf(preferred) <= maxIdx) {
    return preferred;
  }

  for (let i = maxIdx; i >= 0; i--) {
    const level = CEFR_LEVELS[i];
    if (nodes.some((n) => n.cefrLevel === level)) return level;
  }

  return preferred;
}
