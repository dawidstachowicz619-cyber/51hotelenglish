"use client";

import { useState } from "react";
import {
  BedDouble,
  BookOpen,
  ChevronLeft,
  UtensilsCrossed,
} from "lucide-react";
import { useRussianCampaignProgress } from "@/hooks/use-russian-campaign-progress";
import { getCampaignLevel, getRussianCampaign } from "@/lib/data/hotel-russian-campaign-data";
import type { RussianCampaignDepartment } from "@/lib/types/hotel-russian-campaign";
import { cn } from "@/lib/utils";

import { RussianCampaignLevelPlayer } from "./russian-campaign-level-player";
import { RussianCampaignMap } from "./russian-campaign-map";

const DEPTS: {
  id: RussianCampaignDepartment;
  label: string;
  icon: typeof BedDouble;
  color: string;
}[] = [
  {
    id: "room",
    label: "客房部",
    icon: BedDouble,
    color: "from-[#0039A6] to-[#0039A6]/80",
  },
  {
    id: "dining",
    label: "餐饮部",
    icon: UtensilsCrossed,
    color: "from-[#D52B1E] to-[#B91C1C]",
  },
];

export function HotelRussianCampaignCourse() {
  const [department, setDepartment] = useState<RussianCampaignDepartment | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  const roomProgress = useRussianCampaignProgress("room");
  const diningProgress = useRussianCampaignProgress("dining");

  const campaign = department ? getRussianCampaign(department) : null;
  const progress =
    department === "room"
      ? roomProgress.progress
      : department === "dining"
        ? diningProgress.progress
        : null;

  const levelData =
    department && activeLevel ? getCampaignLevel(department, activeLevel) : null;

  if (levelData && progress) {
    return (
      <RussianCampaignLevelPlayer
        level={levelData}
        onBack={() => setActiveLevel(null)}
        onComplete={() => {
          if (department === "room") roomProgress.refresh();
          else diningProgress.refresh();
          setActiveLevel(null);
        }}
      />
    );
  }

  if (department && campaign && progress) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setDepartment(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-extrabold text-[#0039A6] active:opacity-70"
        >
          <ChevronLeft className="size-5" />
          选择部门
        </button>
        <div className="mb-4">
          <p className="text-[10px] font-bold text-muted-foreground">900 句必修 · 30 关闯关</p>
          <h1 className="font-display text-xl text-foreground">{campaign.titleZh}</h1>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{campaign.description}</p>
        </div>
        <RussianCampaignMap
          campaign={campaign}
          progress={progress}
          onSelectLevel={setActiveLevel}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#0039A6]/25 bg-white px-3 py-1 text-xs font-bold text-[#0039A6]">
          <BookOpen className="size-3.5" />
          必修 · 1800 项
        </div>
        <h1 className="mt-3 font-display text-xl text-foreground">闯关学习</h1>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-muted-foreground">
          客房 & 餐饮各 30 关 · 每关 5 句 + 5 词 · 逐关解锁
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {DEPTS.map((dept) => {
          const Icon = dept.icon;
          const prog = dept.id === "room" ? roomProgress : diningProgress;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => setDepartment(dept.id)}
              className="card-elevated w-full overflow-hidden p-4 text-left transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
                    dept.color
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg text-foreground">{dept.label}</h2>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    30 关 · 每关 5 句 + 5 词
                  </p>
                  <p className="mt-2 text-[10px] font-extrabold text-[#0039A6]">
                    进度 {prog.percent}% · 已完成 {prog.progress?.completedLevelIds.length ?? 0} 关
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
