"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, ConciergeBell, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAssessmentAccess } from "@/hooks/use-assessment-access";
import { TRIAL_CEFR_LEVEL } from "@/lib/assessment/course-access";
import { CEFR_LABELS } from "@/lib/types/course";
import { getFrontDeskStats } from "@/lib/data/front-desk";
import { getRussianCourseStats } from "@/lib/data/hotel-russian-course";

const frontDeskStats = getFrontDeskStats();
const russianStats = getRussianCourseStats();

export function CoursesPageContent() {
  const { ready, maxLevel, hasAssessment, accessibleLevels } =
    useAssessmentAccess();

  return (
    <>
      <div className="text-center">
        <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
          场景课程
        </p>
        <h1 className="mt-3 font-display text-4xl text-foreground">
          选择你的学习路径
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-semibold text-muted-foreground">
          根据 CEFR 测评通关级别选择课程。高级别可学习低级别内容，低级别无法进入高级别课程。
        </p>

        {ready && hasAssessment && maxLevel && (
          <p className="mx-auto mt-4 max-w-lg rounded-2xl border-2 border-primary/30 bg-primary-light/30 px-4 py-3 text-sm font-bold text-foreground">
            当前最高通关：{" "}
            <span className="text-primary">{maxLevel}</span>
            （{CEFR_LABELS[maxLevel]}）· 可学{" "}
            {accessibleLevels.join(" / ")}
          </p>
        )}

        {ready && !hasAssessment && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-secondary/30 bg-secondary/10 p-5">
            <ClipboardCheck className="mx-auto size-8 text-secondary" />
            <p className="mt-2 text-sm font-extrabold text-foreground">
              可先试学 {TRIAL_CEFR_LEVEL} 级别课程
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              完成 CEFR 测评并通关后，可解锁 A2 及以上级别
            </p>
            <Button className="mt-4" variant="secondary" asChild>
              <Link href="/assessment">去测评解锁更多 →</Link>
            </Button>
          </div>
        )}

        {ready && hasAssessment && (
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/assessment">挑战更高级别测评 →</Link>
          </Button>
        )}
      </div>

      <div className="mt-12 grid gap-5">
        <article className="card-elevated bg-primary-light/30 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]">
                <ConciergeBell className="size-7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  Front Desk
                </p>
                <h2 className="mt-1 font-display text-2xl text-foreground">
                  前厅英语
                </h2>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  四大岗位方向：接待、礼宾、预订、客服。按 CEFR 级别分轨，通关地图式闯关学习。
                </p>
                <p className="mt-2 text-xs font-extrabold text-primary">
                  {frontDeskStats.departments} 个岗位 · {frontDeskStats.scenarios}{" "}
                  工作场景 · {frontDeskStats.simulationsPerLevel} 模拟/级
                </p>
              </div>
            </div>

            <Button asChild variant={hasAssessment ? "default" : "secondary"}>
              <Link href="/courses/front-desk">
                {hasAssessment ? "进入学习" : `试学进入 (${TRIAL_CEFR_LEVEL})`}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </article>

        <article className="card-elevated border-[#0039A6]/15 bg-[#0039A6]/5 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0039A6] text-white shadow-[0_4px_0_0_rgba(0,57,166,0.35)]">
                <Languages className="size-7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  Hotel Russian · CN → RU
                </p>
                <h2 className="mt-1 font-display text-2xl text-foreground">
                  酒店俄语
                </h2>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  通过中文学习俄语：单词、常用句、情景对话与场景选择题练习，中俄英三语对照。
                </p>
                <p className="mt-2 text-xs font-extrabold text-[#0039A6]">
                  {russianStats.scenarios} 大场景 · {russianStats.words} 单词 ·{" "}
                  {russianStats.sentences} 句子
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button asChild className="bg-[#0039A6] hover:bg-[#002d85]">
                <Link href="/courses/russian">
                  场景课程
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#D52B1E]/40 text-[#B91C1C]">
                <Link href="/courses/russian/room-items">客房物品 100</Link>
              </Button>
              <Button asChild variant="outline" className="border-[#0039A6]/40 text-[#0039A6]">
                <Link href="/courses/russian/dining-items">餐饮物品 100</Link>
              </Button>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-10 text-center">
        <Button variant="ghost" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </>
  );
}
