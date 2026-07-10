"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, LogOut, RefreshCw, Users } from "lucide-react";

import { PlatformLoginGate } from "@/components/admin/platform/platform-login-gate";
import { Button } from "@/components/ui/button";
import { formatStudyTime } from "@/lib/hr/course-stats-builder";
import {
  buildPlatformCourseAnalytics,
  formatPlatformQuantity,
} from "@/lib/hr/platform-course-analytics";
import {
  clearPlatformAdminSession,
  loadPlatformAdminSession,
} from "@/lib/hr/platform-admin-session";
import {
  COURSE_STAT_CATEGORY_LABELS,
  type CourseStatCategory,
} from "@/lib/types/course-learning-stats";
import { cn } from "@/lib/utils";

export function PlatformCourseAnalyticsDashboard() {
  const [authed, setAuthed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CourseStatCategory | "all">(
    "all"
  );

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (loadPlatformAdminSession()) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const events = [
      "hr-roster-updated",
      "course-progress-updated",
      "assessment-updated",
      "russian-daily-updated",
      "russian-campaign-updated",
      "russian-items-progress-updated",
      "employee-training-updated",
      "points-updated",
    ] as const;
    for (const e of events) window.addEventListener(e, refresh);
    return () => {
      for (const e of events) window.removeEventListener(e, refresh);
    };
  }, [authed, refresh]);

  const analytics = useMemo(() => {
    void refreshKey;
    return buildPlatformCourseAnalytics();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return analytics.courses;
    return analytics.courses.filter((c) => c.category === categoryFilter);
  }, [analytics.courses, categoryFilter]);

  const handleLogout = () => {
    clearPlatformAdminSession();
    setAuthed(false);
  };

  if (!authed) {
    return <PlatformLoginGate onLogin={() => setAuthed(true)} />;
  }

  const categories = [...new Set(analytics.courses.map((c) => c.category))];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/platform"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回平台管理中心
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-white">
              <BookOpen className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-foreground md:text-3xl">
                全平台课程学习统计
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                各课程学员人数、学习数量与累计时长
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/platform/analytics/russian">酒店俄语统计</Link>
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

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="平台学员总数" value={String(analytics.totalLearners)} />
        <StatCard
          label="本周活跃学员"
          value={String(analytics.activeLearnersThisWeek)}
          highlight
        />
        <StatCard label="上线课程" value={String(analytics.courses.length)} />
        <StatCard
          label="全站累计学习"
          value={formatStudyTime(analytics.totalStudyMinutes)}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip
          active={categoryFilter === "all"}
          onClick={() => setCategoryFilter("all")}
          label="全部课程"
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            active={categoryFilter === cat}
            onClick={() => setCategoryFilter(cat)}
            label={COURSE_STAT_CATEGORY_LABELS[cat]}
          />
        ))}
      </div>

      <div className="card-elevated mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">课程</th>
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    学习学员
                  </span>
                </th>
                <th className="px-4 py-3">本周活跃</th>
                <th className="px-4 py-3">累计学习数量</th>
                <th className="px-4 py-3">累计时长</th>
                <th className="px-4 py-3">人均时长</th>
                <th className="px-4 py-3">平均得分</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr
                  key={course.courseId}
                  className={cn(
                    "border-b border-border transition-colors",
                    course.learnerCount === 0
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  <td className="px-5 py-3.5 font-bold">{course.courseName}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold">
                    {COURSE_STAT_CATEGORY_LABELS[course.category]}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-display text-lg text-primary">
                      {course.learnerCount}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      / {analytics.totalLearners}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {course.activeThisWeek}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {course.learnerCount > 0
                      ? formatPlatformQuantity(
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
      </div>

      <p className="mt-4 text-xs font-semibold text-muted-foreground">
        数据来自各酒店学员在本浏览器中的学习记录汇总。演示学员数据为模拟值，真实学员标记为「本机实时同步」后会计入统计。
      </p>
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
        highlight && "border-primary/30 bg-primary-light/20"
      )}
    >
      <p className="text-xs font-extrabold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors",
        active
          ? "bg-accent text-white"
          : "bg-muted text-muted-foreground hover:bg-border"
      )}
    >
      {label}
    </button>
  );
}
