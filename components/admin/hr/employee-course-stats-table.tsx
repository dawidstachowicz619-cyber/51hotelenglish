"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";

import {
  buildEmployeeCourseStats,
  campaignItemsLearned,
  formatStudyDate,
  formatStudyTime,
  summarizeCourseStats,
} from "@/lib/hr/course-stats-builder";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import {
  COURSE_STAT_CATEGORY_LABELS,
  type CourseLearningStat,
} from "@/lib/types/course-learning-stats";
import { cn } from "@/lib/utils";

type Props = {
  employee: EmployeeLearningRecord;
};

const STATUS_LABELS: Record<
  CourseLearningStat["status"],
  { text: string; className: string }
> = {
  completed: { text: "已完成", className: "bg-primary-light/60 text-primary" },
  in_progress: { text: "学习中", className: "bg-secondary/10 text-secondary-dark" },
  not_started: { text: "未开始", className: "bg-muted text-muted-foreground" },
};

function formatQuantity(stat: CourseLearningStat): string {
  if (stat.courseId.startsWith("russian-campaign-")) {
    const items = campaignItemsLearned(stat.completedCount);
    return `${stat.completedCount} 关 · ${items} 句/词`;
  }
  if (stat.totalCount != null) {
    return `${stat.completedCount} / ${stat.totalCount}`;
  }
  return `${stat.completedCount} 次`;
}

export function EmployeeCourseStatsTable({ employee }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("course-progress-updated", refresh);
    window.addEventListener("assessment-updated", refresh);
    window.addEventListener("russian-daily-updated", refresh);
    window.addEventListener("russian-campaign-updated", refresh);
    window.addEventListener("russian-items-progress-updated", refresh);
    window.addEventListener("employee-training-updated", refresh);
    window.addEventListener("hr-roster-updated", refresh);
    return () => {
      window.removeEventListener("course-progress-updated", refresh);
      window.removeEventListener("assessment-updated", refresh);
      window.removeEventListener("russian-daily-updated", refresh);
      window.removeEventListener("russian-campaign-updated", refresh);
      window.removeEventListener("russian-items-progress-updated", refresh);
      window.removeEventListener("employee-training-updated", refresh);
      window.removeEventListener("hr-roster-updated", refresh);
    };
  }, []);

  const stats = useMemo(
    () => buildEmployeeCourseStats(employee),
    [employee, refreshKey]
  );
  const summary = useMemo(() => summarizeCourseStats(stats), [stats]);
  const started = stats.filter((s) => s.status !== "not_started");

  return (
    <section className="card-elevated mt-6 overflow-hidden">
      <div className="border-b-2 border-border px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <BookOpen className="size-4" />
            </span>
            <div>
              <h3 className="font-display text-lg text-foreground">课程学习明细</h3>
              <p className="text-xs font-semibold text-muted-foreground">
                各课程学习数量、累计时长与得分
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-right">
            <SummaryPill label="已学课程" value={`${summary.courseCount} 门`} />
            <SummaryPill
              label="累计时长"
              value={formatStudyTime(summary.totalTimeMinutes)}
            />
            <SummaryPill
              label="平均得分"
              value={
                summary.avgScore != null ? `${summary.avgScore} 分` : "—"
              }
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-extrabold text-muted-foreground">
              <th className="px-5 py-3">课程</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">学习数量</th>
              <th className="px-4 py-3">累计时长</th>
              <th className="px-4 py-3">得分</th>
              <th className="px-4 py-3">最近学习</th>
              <th className="px-4 py-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => {
              const status = STATUS_LABELS[stat.status];
              return (
                <tr
                  key={stat.courseId}
                  className={cn(
                    "border-b border-border/60 transition-colors",
                    stat.status === "not_started"
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  <td className="px-5 py-3.5 font-bold">{stat.courseName}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold">
                    {COURSE_STAT_CATEGORY_LABELS[stat.category]}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {formatQuantity(stat)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {formatStudyTime(stat.timeMinutes)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {stat.score != null ? `${stat.score} 分` : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold">
                    {formatStudyDate(stat.lastStudiedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                        status.className
                      )}
                    >
                      {status.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {started.length === 0 && (
        <p className="px-5 py-4 text-xs font-semibold text-muted-foreground">
          该学员暂无课程学习记录。学员在本平台学习后，数据将自动汇总到此表。
        </p>
      )}
    </section>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold text-muted-foreground">{label}</p>
      <p className="font-display text-lg text-foreground">{value}</p>
    </div>
  );
}
