"use client";

import { useMemo } from "react";
import { Check, Crown, Lock, Star } from "lucide-react";

import {
  DINING_CATCH_LEVELS,
  type DiningCatchLevel,
} from "@/lib/games/dining-catch/levels";
import {
  getDiningCatchLevelStatusFromProgress,
  type DiningCatchProgress,
} from "@/lib/games/dining-catch/progress-storage";
import { cn } from "@/lib/utils";

type DiningCatchMapProps = {
  onSelectLevel: (level: number) => void;
  completedCount: number;
  progress: DiningCatchProgress;
};

export function DiningCatchMap({
  onSelectLevel,
  completedCount,
  progress,
}: DiningCatchMapProps) {
  const percent = Math.round((completedCount / DINING_CATCH_LEVELS.length) * 100);

  const zones = useMemo(() => {
    const groups: { title: string; levels: DiningCatchLevel[] }[] = [
      { title: "🍳 前厅餐饮 · 上", levels: DINING_CATCH_LEVELS.slice(0, 5) },
      { title: "🍳 前厅餐饮 · 下", levels: DINING_CATCH_LEVELS.slice(5) },
    ];
    return groups;
  }, []);

  return (
    <div>
      <div className="mb-8 rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-orange-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-foreground">餐饮单词大闯关</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              单词从上往下掉，点击正确得分 · 共 {DINING_CATCH_LEVELS.length} 关
            </p>
          </div>
          <span className="font-display text-2xl text-accent">{percent}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-lg pb-8">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-border" />

        <div className="relative flex justify-center pb-6 pt-2">
          <div className="z-10 flex flex-col items-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_4px_0_0_#E08600]">
              <Star className="size-7" fill="currentColor" />
            </div>
            <p className="mt-2 text-xs font-extrabold text-accent">START</p>
          </div>
        </div>

        {zones.map((group) => (
          <div key={group.title} className="relative mb-4">
            <div className="relative z-10 my-6 flex justify-center">
              <div className="rounded-full border-2 border-accent/30 bg-white px-5 py-2">
                <p className="text-center text-sm font-extrabold">{group.title}</p>
              </div>
            </div>

            {group.levels.map((level, idx) => {
              const status = getDiningCatchLevelStatusFromProgress(level.level, progress);
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={level.level}
                  className={cn(
                    "relative flex items-center py-2",
                    isLeft ? "justify-start pr-[52%]" : "justify-end pl-[52%]"
                  )}
                >
                  <button
                    type="button"
                    disabled={status === "locked"}
                    onClick={() => status !== "locked" && onSelectLevel(level.level)}
                    className={cn(
                      "group z-10 flex max-w-[200px] flex-col items-center gap-2 transition-transform",
                      status !== "locked" && "hover:scale-105",
                      status === "locked" && "cursor-not-allowed opacity-55"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-16 items-center justify-center rounded-full border-2 text-2xl",
                        status === "completed" &&
                          "border-primary-dark bg-primary text-white shadow-[0_4px_0_0_var(--primary-dark)]",
                        status === "current" &&
                          "border-accent bg-accent text-white ring-4 ring-accent/25 shadow-[0_4px_0_0_#E08600]",
                        status === "locked" && "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="size-7 text-white" strokeWidth={3} />
                      ) : status === "locked" ? (
                        <Lock className="size-5" />
                      ) : (
                        level.emoji
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-center",
                        status === "current"
                          ? "border-accent/30 bg-accent/5"
                          : "border-border bg-white"
                      )}
                    >
                      <p className="text-[10px] font-bold text-muted-foreground">
                        第 {level.level} 关
                      </p>
                      <p className="text-xs font-extrabold text-foreground">{level.title}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                        {level.items.length} 个词汇
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        <div className="relative flex justify-center pt-6">
          <div
            className={cn(
              "z-10 flex size-14 items-center justify-center rounded-2xl border-2",
              completedCount === DINING_CATCH_LEVELS.length
                ? "border-accent bg-accent text-white"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            <Crown className="size-7" />
          </div>
        </div>
      </div>
    </div>
  );
}
