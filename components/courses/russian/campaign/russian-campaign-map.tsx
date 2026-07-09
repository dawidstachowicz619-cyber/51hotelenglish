"use client";

import { useMemo } from "react";
import { Check, Crown, Lock, Star } from "lucide-react";

import { getLevelStatus } from "@/lib/course/russian-campaign-progress-storage";
import type { RussianCampaign } from "@/lib/types/hotel-russian-campaign";
import type { RussianCampaignProgress } from "@/lib/types/hotel-russian-campaign";
import { cn } from "@/lib/utils";

type RussianCampaignMapProps = {
  campaign: RussianCampaign;
  progress: RussianCampaignProgress;
  onSelectLevel: (level: number) => void;
};

export function RussianCampaignMap({
  campaign,
  progress,
  onSelectLevel,
}: RussianCampaignMapProps) {
  const completedCount = progress.completedLevelIds.length;
  const percent = Math.round((completedCount / campaign.totalLevels) * 100);

  const zones = useMemo(() => {
    const result: { zone: string; levels: typeof campaign.levels }[] = [];
    for (const level of campaign.levels) {
      const last = result[result.length - 1];
      if (!last || last.zone !== level.zone) {
        result.push({ zone: level.zone, levels: [level] });
      } else {
        last.levels.push(level);
      }
    }
    return result;
  }, [campaign.levels]);

  return (
    <div>
      <div className="mb-8 rounded-2xl border-2 border-[#0039A6]/20 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-foreground">闯关进度</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              已完成 {completedCount} / {campaign.totalLevels} 关 · {campaign.totalSentences} 句 +{" "}
              {campaign.totalWords} 词
            </p>
          </div>
          <span className="font-display text-2xl text-[#0039A6]">{percent}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#0039A6] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-lg pb-8">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-border" />

        <div className="relative flex justify-center pb-6 pt-2">
          <div className="z-10 flex flex-col items-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-white">
              <Star className="size-7" fill="currentColor" />
            </div>
            <p className="mt-2 text-xs font-extrabold text-accent">START</p>
          </div>
        </div>

        {zones.map((group) => (
          <div key={group.zone} className="relative mb-4">
            <div className="relative z-10 my-6 flex justify-center">
              <div className="rounded-full border-2 border-border bg-white px-5 py-2">
                <p className="text-center text-sm font-extrabold">{group.zone}</p>
                <p className="text-center text-[10px] font-bold text-muted-foreground">
                  {group.levels.length} 关
                </p>
              </div>
            </div>

            {group.levels.map((level, idx) => {
              const status = getLevelStatus(campaign.department, level.level);
              const isLeft = idx % 2 === 0;

              return (
                <div
                  key={level.id}
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
                        "flex size-16 items-center justify-center rounded-full border-2 text-lg font-display text-white",
                        status === "completed" &&
                          "border-primary-dark bg-primary shadow-[0_4px_0_0_var(--primary-dark)]",
                        status === "current" &&
                          "border-[#0039A6] bg-[#0039A6] ring-4 ring-[#0039A6]/25",
                        status === "locked" && "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="size-7" strokeWidth={3} />
                      ) : status === "locked" ? (
                        <Lock className="size-5" />
                      ) : (
                        level.level
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-center",
                        status === "current"
                          ? "border-[#0039A6]/30 bg-[#0039A6]/5"
                          : "border-border bg-white"
                      )}
                    >
                      <p className="text-[10px] font-bold text-muted-foreground">
                        第 {level.level} 关
                      </p>
                      <p className="text-xs font-extrabold text-foreground">{level.title}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                        5 句 + 5 词
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
              completedCount === campaign.totalLevels
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
