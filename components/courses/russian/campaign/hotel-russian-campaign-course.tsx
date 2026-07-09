"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  BookOpen,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <Button variant="outline" size="sm" onClick={() => setDepartment(null)}>
          <ArrowLeft className="size-4" />
          选择部门
        </Button>
        <div className="mt-6 flex items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
              department === "room" ? "from-[#0039A6] to-[#0039A6]/70" : "from-[#D52B1E] to-[#B91C1C]"
            )}
          >
            {department === "room" ? (
              <BedDouble className="size-7" />
            ) : (
              <UtensilsCrossed className="size-7" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">900 句必修 · 30 关闯关</p>
            <h1 className="font-display text-3xl text-foreground">{campaign.titleZh}</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {campaign.description}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <RussianCampaignMap
            campaign={campaign}
            progress={progress}
            onSelectLevel={setActiveLevel}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/courses/russian">
          <ArrowLeft className="size-4" />
          返回酒店俄语
        </Link>
      </Button>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#0039A6]/25 bg-white px-4 py-1.5 text-sm font-bold text-[#0039A6]">
          <BookOpen className="size-4" />
          酒店俄语必修 · 1800 项
        </div>
        <h1 className="mt-4 font-display text-3xl text-foreground md:text-4xl">
          闯关学习 · 客房 & 餐饮
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold text-muted-foreground">
          客房部与餐饮部分开，每部门 30 关，每关 5 句话 + 5 个单词（共 150 句 + 150 词/部门）。
          逐关解锁，5 题测验过关。
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {DEPTS.map((dept) => {
          const Icon = dept.icon;
          const prog = dept.id === "room" ? roomProgress : diningProgress;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => setDepartment(dept.id)}
              className="card-elevated group overflow-hidden p-6 text-left transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
                  dept.color
                )}
              >
                <Icon className="size-7" />
              </div>
              <h2 className="mt-5 font-display text-2xl text-foreground">{dept.label}</h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                30 关 · 每关 5 句 + 5 词 ·{" "}
                {dept.id === "room" ? "床品、清洁、设施、退房…" : "点餐、上菜、饮品、结账…"}
              </p>
              <p className="mt-3 text-xs font-extrabold text-[#0039A6]">
                进度 {prog.percent}% · 已完成{" "}
                {prog.progress?.completedLevelIds.length ?? 0} 关
              </p>
              <span className="mt-4 inline-block text-sm font-bold text-primary group-hover:underline">
                进入闯关 →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
