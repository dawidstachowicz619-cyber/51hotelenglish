"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#D52B1E]/25 bg-white px-4 py-1.5 text-sm font-bold text-[#B91C1C]">
          <Languages className="size-4" />
          通过中文学习俄语
        </div>
        <h1 className="mt-4 font-display text-3xl text-foreground md:text-4xl">
          酒店俄语 · 中俄英三语
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-semibold text-muted-foreground">
          每个场景包含单词、常用句子、情景对话与「看中文选俄语」练习。
          共 {stats.scenarios} 大场景、{stats.words} 个单词、{stats.sentences} 句常用表达。
        </p>
      </div>

      <article className="mt-10 card-elevated overflow-hidden border-2 border-[#0039A6]/30 bg-gradient-to-br from-[#0039A6]/15 via-white to-[#D52B1E]/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0039A6] to-[#D52B1E] text-white shadow-[0_4px_0_0_rgba(213,43,30,0.35)]">
              <Trophy className="size-7" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">必修 · 每关 5 句 + 5 词</p>
              <h2 className="mt-1 font-display text-2xl text-foreground">
                酒店俄语闯关学习
              </h2>
              <p className="mt-2 max-w-xl text-sm font-semibold text-muted-foreground">
                客房部 & 餐饮部分开 · 每部门 30 关 · 每关 5 句话 + 5 个单词
              </p>
              <p className="mt-2 text-xs font-extrabold text-[#0039A6]">
                客房 {roomCampaign.percent}% · 餐饮 {diningCampaign.percent}%
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-gradient-to-r from-[#0039A6] to-[#D52B1E] hover:opacity-90">
            <Link href="/courses/russian/campaign">开始闯关</Link>
          </Button>
        </div>
      </article>

      <article className="mt-6 card-elevated overflow-hidden border-[#0039A6]/25 bg-gradient-to-br from-[#0039A6]/10 via-white to-[#D52B1E]/10 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0039A6] to-[#D52B1E] text-white shadow-[0_4px_0_0_rgba(213,43,30,0.35)]">
              <CalendarCheck className="size-7" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">Daily · 每日打卡</p>
              <h2 className="mt-1 font-display text-2xl text-foreground">俄语每日打卡</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold text-muted-foreground">
                每天 5 个词汇 · 图卡 + 小测 · 约 5 分钟 · 连续打卡赢积分
              </p>
              {record && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#D52B1E]">
                  <Flame className="size-3.5" />
                  连续 {record.currentStreak} 天
                  {todayComplete ? " · 今日已完成 ✓" : " · 今日待打卡"}
                </p>
              )}
            </div>
          </div>
          <Button asChild className="shrink-0 bg-[#0039A6] hover:bg-[#002d85]">
            <Link href="/courses/russian/daily">
              {todayComplete ? "查看打卡" : "开始今日打卡"}
            </Link>
          </Button>
        </div>
      </article>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <article className="card-elevated overflow-hidden border-[#D52B1E]/20 bg-gradient-to-br from-[#FFF5F5] via-white to-[#0039A6]/5 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#D52B1E] text-white shadow-[0_4px_0_0_rgba(213,43,30,0.35)]">
                <Layers className="size-7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">100 Items · AI Images</p>
                <h2 className="mt-1 font-display text-2xl text-foreground">
                  酒店客房常用物品俄语 100
                </h2>
                <p className="mt-2 max-w-xl text-sm font-semibold text-muted-foreground">
                  床品、浴室、电器、迷你吧等 10 大类 · 图卡 + 发音 + 练习
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-[#D52B1E] hover:bg-[#B91C1C]">
              <Link href="/courses/russian/room-items">进入学习</Link>
            </Button>
          </div>
        </article>

        <article className="card-elevated overflow-hidden border-[#0039A6]/20 bg-gradient-to-br from-[#0039A6]/5 via-white to-[#FFF5F5] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0039A6] text-white shadow-[0_4px_0_0_rgba(0,57,166,0.35)]">
                <UtensilsCrossed className="size-7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">100 Items · AI Images</p>
                <h2 className="mt-1 font-display text-2xl text-foreground">
                  酒店餐饮常用物品俄语 100
                </h2>
                <p className="mt-2 max-w-xl text-sm font-semibold text-muted-foreground">
                  餐具、杯具、上菜用具、饮品等 10 大类 · 图卡 + 发音 + 练习
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-[#0039A6] hover:bg-[#002d85]">
              <Link href="/courses/russian/dining-items">进入学习</Link>
            </Button>
          </div>
        </article>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {HOTEL_RUSSIAN_SCENARIOS.map((scenario) => {
          const Icon = ICONS[scenario.icon];
          return (
            <article
              key={scenario.id}
              className="group card-elevated flex flex-col overflow-hidden border-[#0039A6]/10 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0039A6] text-white shadow-[0_4px_0_0_rgba(0,57,166,0.35)]">
                <Icon className="size-7" strokeWidth={2} />
              </div>
              <p className="mt-5 text-xs font-bold text-muted-foreground">{scenario.subtitle}</p>
              <h2 className="mt-1 font-display text-xl text-foreground">{scenario.title}</h2>
              <p className="mt-2 flex-1 text-sm font-semibold leading-relaxed text-muted-foreground">
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
                className="mt-6 w-full bg-[#0039A6] hover:bg-[#002d85]"
                onClick={() => setActiveScenario(scenario)}
              >
                开始学习
              </Button>
            </article>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  );
}
