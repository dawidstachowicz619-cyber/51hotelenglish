"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarCheck,
  ConciergeBell,
  Flame,
  Languages,
  Layers,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";

import { RussianScenarioDetail } from "@/components/courses/russian/russian-scenario-detail";
import { Button } from "@/components/ui/button";
import {
  getRussianCourseStats,
  HOTEL_RUSSIAN_SCENARIOS,
} from "@/lib/data/hotel-russian-course";
import type { RussianScenario } from "@/lib/types/hotel-russian";
import { cn } from "@/lib/utils";
import { useRussianDailyCheckIn } from "@/hooks/use-russian-daily-checkin";
import { useRussianCampaignProgress } from "@/hooks/use-russian-campaign-progress";

const ICONS = {
  reception: ConciergeBell,
  fnb: UtensilsCrossed,
  housekeeping: BedDouble,
} as const;

export function HotelRussianCourse() {
  const [activeScenario, setActiveScenario] = useState<RussianScenario | null>(null);
  const stats = getRussianCourseStats();
  const { record, todayComplete } = useRussianDailyCheckIn();
  const roomCampaign = useRussianCampaignProgress("room");
  const diningCampaign = useRussianCampaignProgress("dining");

  if (activeScenario) {
    return (
      <RussianScenarioDetail
        scenario={activeScenario}
        onBack={() => setActiveScenario(null)}
      />
    );
  }

  return (
    <div>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#D52B1E]/25 bg-white px-3 py-1 text-xs font-bold text-[#B91C1C]">
          <Languages className="size-3.5" />
          手机 H5 · 中俄英三语
        </div>
        <h1 className="mt-3 font-display text-2xl text-foreground">酒店俄语</h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
          微信、Safari 均可学习 · 听发音 + 图卡 + 练习
        </p>
      </div>

      <div className="mt-6 space-y-4">
      <article className="card-elevated overflow-hidden border-2 border-[#0039A6]/30 bg-gradient-to-br from-[#0039A6]/15 via-white to-[#D52B1E]/10">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0039A6] to-[#D52B1E] text-white">
              <Trophy className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground">必修 · 每关 5 句 + 5 词</p>
              <h2 className="mt-0.5 font-display text-lg text-foreground">闯关学习</h2>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                客房 & 餐饮 · 各 30 关
              </p>
              <p className="mt-1 text-[10px] font-extrabold text-[#0039A6]">
                客房 {roomCampaign.percent}% · 餐饮 {diningCampaign.percent}%
              </p>
            </div>
          </div>
          <Button asChild className="h-11 w-full bg-gradient-to-r from-[#0039A6] to-[#D52B1E]">
            <Link href="/courses/russian/campaign">开始闯关</Link>
          </Button>
        </div>
      </article>

      <article className="card-elevated overflow-hidden border-[#0039A6]/25 bg-gradient-to-br from-[#0039A6]/10 via-white to-[#D52B1E]/10">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0039A6] to-[#D52B1E] text-white">
              <CalendarCheck className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground">Daily · 每日打卡</p>
              <h2 className="mt-0.5 font-display text-lg text-foreground">每日打卡</h2>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">每天 5 词 · 约 5 分钟</p>
              {record && (
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#D52B1E]">
                  <Flame className="size-3" />
                  连续 {record.currentStreak} 天
                  {todayComplete ? " · 今日已完成 ✓" : " · 今日待打卡"}
                </p>
              )}
            </div>
          </div>
          <Button asChild className="h-11 w-full bg-[#0039A6]">
            <Link href="/courses/russian/daily">
              {todayComplete ? "查看打卡" : "开始今日打卡"}
            </Link>
          </Button>
        </div>
      </article>

      <article className="card-elevated overflow-hidden border-[#D52B1E]/20 bg-gradient-to-br from-[#FFF5F5] via-white to-[#0039A6]/5">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#D52B1E] text-white">
              <Layers className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground">100 Items</p>
              <h2 className="mt-0.5 font-display text-lg text-foreground">客房物品俄语</h2>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">10 大类图卡 + 练习</p>
            </div>
          </div>
          <Button asChild className="h-11 w-full bg-[#D52B1E]">
            <Link href="/courses/russian/room-items">进入学习</Link>
          </Button>
        </div>
      </article>

      <article className="card-elevated overflow-hidden border-[#0039A6]/20 bg-gradient-to-br from-[#0039A6]/5 via-white to-[#FFF5F5]">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0039A6] text-white">
              <UtensilsCrossed className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground">100 Items</p>
              <h2 className="mt-0.5 font-display text-lg text-foreground">餐饮物品俄语</h2>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">餐具杯具 · 图卡 + 练习</p>
            </div>
          </div>
          <Button asChild className="h-11 w-full bg-[#0039A6]">
            <Link href="/courses/russian/dining-items">进入学习</Link>
          </Button>
        </div>
      </article>
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-muted-foreground">
        场景课 · {stats.scenarios} 场景 · {stats.words} 词 · {stats.sentences} 句
      </p>

      <div className="mt-4 grid gap-4">
        {HOTEL_RUSSIAN_SCENARIOS.map((scenario) => {
          const Icon = ICONS[scenario.icon];
          return (
            <article
              key={scenario.id}
              className="card-elevated flex flex-col overflow-hidden border-[#0039A6]/10 bg-white p-4"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0039A6] text-white">
                <Icon className="size-6" strokeWidth={2} />
              </div>
              <p className="mt-4 text-[10px] font-bold text-muted-foreground">{scenario.subtitle}</p>
              <h2 className="mt-0.5 font-display text-lg text-foreground">{scenario.title}</h2>
              <p className="mt-2 flex-1 text-xs font-semibold leading-relaxed text-muted-foreground">
                {scenario.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  `${scenario.words.length} 单词`,
                  `${scenario.sentences.length} 句子`,
                  `${scenario.dialogues.length} 对话`,
                ].map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full border-2 border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-extrabold text-foreground"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button
                className="mt-4 h-11 w-full bg-[#0039A6]"
                onClick={() => setActiveScenario(scenario)}
              >
                开始学习
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
