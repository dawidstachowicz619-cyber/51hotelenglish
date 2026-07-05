import type { FrontDeskProgress } from "@/lib/types/course-progress";
import { FRONT_DESK_PROGRESS_KEY } from "@/lib/types/course-progress";
import { buildProgressionMap } from "@/lib/course/progression-map";
import { moduleToAsk } from "@/lib/hr/ask-mapping";
import { logNodeCompletion } from "@/lib/hr/learning-history-storage";
import { loadProfile } from "@/lib/points/storage";
import { FRONT_DESK_DEPARTMENTS } from "@/lib/types/front-desk-department";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

const EMPTY: FrontDeskProgress = { completedNodeIds: [] };

function parseDepartmentFromNodeId(nodeId: string): FrontDeskDepartmentId | null {
  for (const dept of FRONT_DESK_DEPARTMENTS) {
    if (nodeId.startsWith(`${dept.id}-`)) return dept.id;
  }
  return null;
}

function logNodeCompleteEvent(nodeId: string): void {
  if (typeof window === "undefined") return;
  const profile = loadProfile();
  if (!profile?.userId) return;

  const departmentId = parseDepartmentFromNodeId(nodeId);
  if (!departmentId) return;

  const node = buildProgressionMap(departmentId).find((n) => n.id === nodeId);
  if (!node) return;

  const title = node.simulationTitle
    ? `${node.workScenarioTitle} · 模拟 #${node.simulationNumber ?? ""}`
    : `${node.workScenarioTitle} · ${node.moduleLabel}`;

  logNodeCompletion(profile.userId, {
    phase: "role",
    ask: moduleToAsk(node.module),
    title,
    subtitle: node.zoneLabel,
    nodeId,
  });
}

const LEGACY_NODE_ID =
  /^(A1|A2|B1|B2|C1)-[a-z0-9-]+-(words|sentences|dialogues|scenario)$/;

function migrateCompletedNodeIds(ids: string[]): string[] {
  const migrated = new Set(ids);
  for (const id of ids) {
    if (LEGACY_NODE_ID.test(id)) {
      migrated.add(`reception-${id}`);
    }
  }
  return [...migrated];
}

export function loadFrontDeskProgress(): FrontDeskProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(FRONT_DESK_PROGRESS_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as FrontDeskProgress;
    const rawIds = Array.isArray(parsed.completedNodeIds)
      ? parsed.completedNodeIds
      : [];
    const completedNodeIds = migrateCompletedNodeIds(rawIds);
    const progress = { completedNodeIds };

    if (completedNodeIds.length !== rawIds.length) {
      saveFrontDeskProgress(progress);
    }

    return progress;
  } catch {
    return EMPTY;
  }
}

export function saveFrontDeskProgress(progress: FrontDeskProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FRONT_DESK_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent("course-progress-updated"));
}

export function completeNode(nodeId: string): FrontDeskProgress {
  const current = loadFrontDeskProgress();
  if (current.completedNodeIds.includes(nodeId)) return current;
  const next = {
    completedNodeIds: [...current.completedNodeIds, nodeId],
  };
  saveFrontDeskProgress(next);
  logNodeCompleteEvent(nodeId);
  return next;
}

export function resetFrontDeskProgress(): void {
  saveFrontDeskProgress(EMPTY);
}
