"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  Check,
  Crown,
  Gamepad2,
  Lock,
  MessageCircle,
  MessagesSquare,
  Star,
} from "lucide-react";

import {
  getCurrentNode,
  getNodeStatus,
  getProgressPercent,
} from "@/lib/course/progression-map";
import type { ProgressionNode } from "@/lib/types/course-progress";
import { MODULE_EXERCISE_HINTS } from "@/lib/types/course-progress";
import type { CourseModuleTab } from "@/lib/types/course";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<CourseModuleTab, typeof BookOpen> = {
  words: BookOpen,
  sentences: MessageCircle,
  dialogues: MessagesSquare,
  scenario: Gamepad2,
};

const MODULE_COLORS: Record<CourseModuleTab, string> = {
  words: "bg-primary border-primary-dark shadow-[0_4px_0_0_var(--primary-dark)]",
  sentences:
    "bg-secondary border-secondary-dark shadow-[0_4px_0_0_var(--secondary-dark)]",
  dialogues: "bg-accent border-accent-dark shadow-[0_4px_0_0_var(--accent-dark)]",
  scenario: "bg-purple border-purple shadow-[0_4px_0_0_#a855f7]",
};

type ProgressionMapProps = {
  nodes: ProgressionNode[];
  completedNodeIds: string[];
  onSelectNode: (node: ProgressionNode) => void;
};

export function ProgressionMap({
  nodes,
  completedNodeIds,
  onSelectNode,
}: ProgressionMapProps) {
  const currentRef = useRef<HTMLDivElement>(null);
  const currentNode = getCurrentNode(nodes, completedNodeIds);
  const progressPercent = getProgressPercent(nodes, completedNodeIds);
  const completedInScope = completedNodeIds.filter((id) =>
    nodes.some((n) => n.id === id)
  ).length;

  const zones = useMemo(() => {
    const result: { label: string; level: string; nodes: ProgressionNode[] }[] =
      [];
    for (const node of nodes) {
      const last = result[result.length - 1];
      if (!last || last.label !== node.zoneLabel) {
        result.push({
          label: node.zoneLabel,
          level: node.cefrLevel,
          nodes: [node],
        });
      } else {
        last.nodes.push(node);
      }
    }
    return result;
  }, [nodes]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentNode?.id]);

  return (
    <div className="relative">
      <div className="mb-8 rounded-2xl border-2 border-primary/20 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-foreground">通关进度</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              已完成 {completedInScope} / {nodes.length} 关
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-accent" />
            <span className="font-display text-2xl text-primary">
              {progressPercent}%
            </span>
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-lg pb-8">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-border" />

        <div className="relative space-y-2">
          <div className="flex justify-center pb-6 pt-2">
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_4px_0_0_var(--accent-dark)]">
                <Star className="size-8" fill="currentColor" />
              </div>
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-accent">
                START
              </p>
              <p className="text-[10px] font-bold text-muted-foreground">
                从这里开始
              </p>
            </div>
          </div>

          {zones.map((zone) => (
            <div key={zone.label} className="relative">
              <div className="relative z-10 my-8 flex justify-center">
                <div className="rounded-full border-2 border-border bg-white px-5 py-2 shadow-sm">
                  <p className="text-center text-sm font-extrabold text-foreground">
                    {zone.label}
                  </p>
                  <p className="text-center text-[10px] font-bold text-muted-foreground">
                    {zone.nodes.length} 关
                  </p>
                </div>
              </div>

              {zone.nodes.map((node, idx) => {
                const status = getNodeStatus(node, nodes, completedNodeIds);
                const isLeft = idx % 2 === 0;
                const Icon = MODULE_ICONS[node.module];
                const isCurrent = currentNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    ref={isCurrent ? currentRef : undefined}
                    className={cn(
                      "relative flex items-center py-3",
                      isLeft ? "justify-start pr-[52%]" : "justify-end pl-[52%]"
                    )}
                  >
                    <button
                      type="button"
                      disabled={status === "locked"}
                      onClick={() => status !== "locked" && onSelectNode(node)}
                      className={cn(
                        "group relative z-10 flex max-w-[220px] flex-col items-center gap-2 transition-transform",
                        status !== "locked" && "hover:scale-105 active:scale-95",
                        status === "locked" && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex size-[4.5rem] items-center justify-center rounded-full border-2 text-white transition-all",
                          status === "completed" &&
                            "bg-primary border-primary-dark shadow-[0_4px_0_0_var(--primary-dark)]",
                          status === "current" &&
                            `${MODULE_COLORS[node.module]} ring-4 ring-primary/30 animate-pulse`,
                          status === "locked" &&
                            "border-border bg-muted text-muted-foreground shadow-none"
                        )}
                      >
                        {status === "completed" ? (
                          <Check className="size-8" strokeWidth={3} />
                        ) : status === "locked" ? (
                          <Lock className="size-6" />
                        ) : (
                          <Icon className="size-7" strokeWidth={2.5} />
                        )}
                        {status === "current" && (
                          <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-white">
                            GO
                          </span>
                        )}
                      </div>

                      <div
                        className={cn(
                          "rounded-xl border-2 px-3 py-2 text-center transition-colors",
                          status === "current"
                            ? "border-primary/30 bg-primary-light/40"
                            : "border-border bg-white",
                          status !== "locked" && "group-hover:border-primary/40"
                        )}
                      >
                        <p className="text-[10px] font-bold text-muted-foreground">
                          {node.workScenarioSubtitle}
                        </p>
                        <p className="text-xs font-extrabold text-foreground">
                          {node.simulationTitle ?? node.workScenarioTitle}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-[10px] font-extrabold uppercase",
                            status === "completed"
                              ? "text-primary"
                              : status === "current"
                                ? "text-accent"
                                : "text-muted-foreground"
                          )}
                        >
                          {node.simulationNumber
                            ? `模拟 #${node.simulationNumber}`
                            : `${node.moduleLabel} · ${MODULE_EXERCISE_HINTS[node.module]}`}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex justify-center pt-8">
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "flex size-16 items-center justify-center rounded-2xl border-2",
                  completedNodeIds.length === nodes.length
                    ? "border-accent bg-accent text-white shadow-[0_4px_0_0_var(--accent-dark)]"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                <Crown className="size-8" />
              </div>
              <p className="mt-2 text-xs font-extrabold text-foreground">
                前厅大师
              </p>
              <p className="text-[10px] font-bold text-muted-foreground">
                {completedNodeIds.length === nodes.length
                  ? "已全部通关！"
                  : "完成全部关卡解锁"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
