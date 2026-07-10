"use client";

import Link from "next/link";
import { ArrowRight, Languages } from "lucide-react";

import {
  CourseAccessButton,
  HrCourseLockBanner,
} from "@/components/learning/hr-course-lock";
import { getRussianCourseStats } from "@/lib/data/hotel-russian-course";
import { useRussianDailyCheckIn } from "@/hooks/use-russian-daily-checkin";

export function RussianHeroSection() {
  const stats = getRussianCourseStats();
  const { record, todayComplete } = useRussianDailyCheckIn();

  return (
    <section className="relative overflow-hidden border-b-2 border-border bg-gradient-to-b from-[#FFF5F5] via-white to-white pt-16">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#D52B1E]/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-56 rounded-full bg-[#0039A6]/10" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 size-32 rounded-full bg-[#D52B1E]/8" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#D52B1E]/30 bg-white px-4 py-1.5 text-sm font-bold text-[#B91C1C]">
            <Languages className="size-4" />
            酒店俄语 · 手机 H5 开练
          </div>

          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            像玩游戏一样
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #0039A6 0%, #D52B1E 100%)",
              }}
            >
              学习酒店俄语
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground">
            通过中文学俄语 · 前厅、餐饮、客房场景课程 + 客房/餐饮物品 200 词图卡。
            手机打开即可学，微信、Safari 均可用，每天 15 分钟自信接待俄罗斯宾客。
          </p>

          <HrCourseLockBanner className="mx-auto mt-6 max-w-md" />

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CourseAccessButton size="lg" href="/courses/russian/campaign" className="bg-gradient-to-r from-[#0039A6] to-[#D52B1E] hover:opacity-90">
              闯关学习 · 5句+5词
              <ArrowRight className="size-5" />
            </CourseAccessButton>
            <CourseAccessButton size="lg" href="/courses/russian/daily" className="bg-[#D52B1E] hover:bg-[#B91C1C]">
              {todayComplete ? "查看今日打卡" : "每日打卡"}
              <ArrowRight className="size-5" />
            </CourseAccessButton>
            <CourseAccessButton size="lg" href="/courses/russian" className="bg-[#0039A6] hover:bg-[#002d85]">
              场景课程
              <ArrowRight className="size-5" />
            </CourseAccessButton>
            <CourseAccessButton size="lg" variant="outline" href="/courses/russian/room-items" className="border-[#D52B1E]/40 text-[#B91C1C]">
              客房 & 餐饮 200 词
            </CourseAccessButton>
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">
            {record ? (
              <>
                连续打卡 <span className="font-bold text-[#D52B1E]">{record.currentStreak}</span> 天
                {todayComplete ? " · 今日已完成" : " · 今日待打卡"}
              </>
            ) : (
              <>
                不确定从哪里开始？{" "}
                <Link href="/courses/russian/daily" className="font-bold text-[#0039A6] hover:underline">
                  从每日打卡开始
                </Link>
                ，每天 5 词 + 小测
              </>
            )}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
          {[
            { value: `${stats.scenarios}`, label: "大场景", color: "bg-[#0039A6]" },
            { value: "200+", label: "物品词汇", color: "bg-[#D52B1E]" },
            { value: "三语", label: "中俄英对照", color: "bg-[#0039A6]/80" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-elevated flex flex-col items-center px-4 py-6 text-center"
            >
              <p
                className={`font-display text-2xl text-white ${stat.color} rounded-xl px-3 py-1 md:text-3xl`}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
