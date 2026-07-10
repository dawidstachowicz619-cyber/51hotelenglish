"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Languages,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";

import { PlatformLoginGate } from "@/components/admin/platform/platform-login-gate";
import { Button } from "@/components/ui/button";
import { formatStudyTime } from "@/lib/hr/course-stats-builder";
import { hotelLearningPath } from "@/lib/hr/hotel-slug";
import {
  buildPlatformRussianAnalytics,
  formatRussianCourseProgress,
} from "@/lib/hr/platform-russian-analytics";
import {
  clearPlatformAdminSession,
  loadPlatformAdminSession,
} from "@/lib/hr/platform-admin-session";
import { cn } from "@/lib/utils";

export function PlatformRussianAnalyticsDashboard() {
  const [authed, setAuthed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (loadPlatformAdminSession()) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const events = [
      "hr-roster-updated",
      "russian-daily-updated",
      "russian-campaign-updated",
      "russian-items-progress-updated",
      "points-updated",
    ] as const;
    for (const e of events) window.addEventListener(e, refresh);
    return () => {
      for (const e of events) window.removeEventListener(e, refresh);
    };
  }, [authed, refresh]);

  const data = useMemo(() => {
    void refreshKey;
    return buildPlatformRussianAnalytics();
  }, [refreshKey]);

  const handleLogout = () => {
    clearPlatformAdminSession();
    setAuthed(false);
  };

  if (!authed) {
    return <PlatformLoginGate onLogin={() => setAuthed(true)} />;
  }

  const { summary, courses, hotels } = data;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/platform/analytics"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回全平台统计
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-white">
              <Languages className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-foreground md:text-3xl">
                酒店俄语 · 学习统计
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                每日打卡、闯关、客房/餐饮词汇课程专项数据
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/courses/russian">学员端俄语课程</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="size-4" />
            刷新
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            退出
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="俄语学习学员"
          value={`${summary.russianLearners} / ${summary.platformLearners}`}
          highlight
        />
        <StatCard label="本周活跃" value={String(summary.activeThisWeek)} />
        <StatCard
          label="累计学习时长"
          value={formatStudyTime(summary.totalStudyMinutes)}
        />
        <StatCard
          label="平均得分"
          value={summary.avgScore != null ? `${summary.avgScore} 分` : "—"}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <MiniStat label="每日打卡总次数" value={`${summary.totalDailyCheckIns} 次`} />
        <MiniStat
          label="闯关完成总关数"
          value={`${summary.totalCampaignLevels} 关`}
        />
        <MiniStat
          label="词汇学习总量"
          value={`${summary.totalVocabStudied} 词`}
        />
      </div>

      <section className="card-elevated mt-8 overflow-hidden">
        <div className="border-b-2 border-border px-5 py-4">
          <h2 className="font-display text-lg text-foreground">俄语课程明细</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            5 门俄语课程的学习人数、数量与时长
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-extrabold text-muted-foreground">
                <th className="px-5 py-3">课程</th>
                <th className="px-4 py-3">学习学员</th>
                <th className="px-4 py-3">本周活跃</th>
                <th className="px-4 py-3">累计学习数量</th>
                <th className="px-4 py-3">累计时长</th>
                <th className="px-4 py-3">人均时长</th>
                <th className="px-4 py-3">平均得分</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId} className="border-b border-border/60">
                  <td className="px-5 py-3.5 font-bold">{course.courseName}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-display text-lg text-secondary-dark">
                      {course.learnerCount}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {course.activeThisWeek}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {course.learnerCount > 0
                      ? formatRussianCourseProgress(
                          course.courseId,
                          course.totalCompletedCount
                        )
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {formatStudyTime(course.totalTimeMinutes)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {course.learnerCount > 0
                      ? formatStudyTime(course.avgTimePerLearner)
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {course.avgScore != null ? `${course.avgScore} 分` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-elevated mt-6 overflow-hidden">
        <div className="border-b-2 border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            <div>
              <h2 className="font-display text-lg text-foreground">各酒店俄语学习</h2>
              <p className="text-xs font-semibold text-muted-foreground">
                按合作酒店汇总俄语打卡、闯关与词汇数据
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-extrabold text-muted-foreground">
                <th className="px-5 py-3">酒店</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    俄语学员
                  </span>
                </th>
                <th className="px-4 py-3">本周活跃</th>
                <th className="px-4 py-3">打卡次数</th>
                <th className="px-4 py-3">闯关关数</th>
                <th className="px-4 py-3">已学词汇</th>
                <th className="px-4 py-3">累计时长</th>
                <th className="px-4 py-3">平均得分</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((row) => (
                <tr
                  key={row.hotel}
                  className={cn(
                    "border-b border-border/60",
                    row.learnerCount === 0 && "text-muted-foreground"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={hotelLearningPath(row.hotel)}
                      className="font-bold text-primary hover:underline"
                    >
                      {row.hotel}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 font-display text-lg text-secondary-dark">
                    {row.learnerCount}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">{row.activeThisWeek}</td>
                  <td className="px-4 py-3.5 font-semibold">{row.dailyCheckIns}</td>
                  <td className="px-4 py-3.5 font-semibold">{row.campaignLevels}</td>
                  <td className="px-4 py-3.5 font-semibold">{row.vocabStudied}</td>
                  <td className="px-4 py-3.5 font-semibold">
                    {formatStudyTime(row.totalTimeMinutes)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {row.avgScore != null ? `${row.avgScore} 分` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-elevated p-5 text-center",
        highlight && "border-secondary/30 bg-secondary/5"
      )}
    >
      <p className="text-xs font-extrabold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-border bg-white px-4 py-3 text-center">
      <p className="text-[10px] font-extrabold text-muted-foreground">{label}</p>
      <p className="mt-1 font-extrabold text-foreground">{value}</p>
    </div>
  );
}
