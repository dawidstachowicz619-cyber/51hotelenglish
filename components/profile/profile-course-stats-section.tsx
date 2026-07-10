"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

import { EmployeeCourseStatsTable } from "@/components/admin/hr/employee-course-stats-table";
import { EmployeeLearningHistoryList } from "@/components/admin/hr/employee-learning-history-list";
import { buildCurrentEmployeeRecord } from "@/lib/hr/current-employee-record";
import {
  buildEmployeeCourseStats,
  summarizeCourseStats,
  formatStudyTime,
} from "@/lib/hr/course-stats-builder";

type Props = {
  onSeeded?: () => void;
};

export function ProfileCourseStatsSection({ onSeeded }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    onSeeded?.();
  }, [onSeeded]);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("course-progress-updated", refresh);
    window.addEventListener("assessment-updated", refresh);
    window.addEventListener("russian-daily-updated", refresh);
    window.addEventListener("russian-campaign-updated", refresh);
    window.addEventListener("russian-items-progress-updated", refresh);
    window.addEventListener("points-updated", refresh);
    return () => {
      window.removeEventListener("course-progress-updated", refresh);
      window.removeEventListener("assessment-updated", refresh);
      window.removeEventListener("russian-daily-updated", refresh);
      window.removeEventListener("russian-campaign-updated", refresh);
      window.removeEventListener("russian-items-progress-updated", refresh);
      window.removeEventListener("points-updated", refresh);
    };
  }, []);

  const employee = useMemo(() => {
    void refreshKey;
    return buildCurrentEmployeeRecord();
  }, [refreshKey]);

  const summary = useMemo(
    () => (employee ? summarizeCourseStats(buildEmployeeCourseStats(employee)) : null),
    [employee]
  );

  if (!employee) return null;

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <BookOpen className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-xl text-foreground">我的课程学习统计</h2>
            <p className="text-xs font-semibold text-muted-foreground">
              按课程汇总学习数量、时长与得分
            </p>
          </div>
        </div>
        <Link
          href="/profile/learning"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          完整学习记录
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card-elevated p-4 text-center">
            <p className="text-xs font-extrabold text-muted-foreground">已学课程</p>
            <p className="mt-1 font-display text-2xl text-foreground">
              {summary.courseCount} 门
            </p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-xs font-extrabold text-muted-foreground">累计学习</p>
            <p className="mt-1 font-display text-2xl text-foreground">
              {formatStudyTime(summary.totalTimeMinutes)}
            </p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-xs font-extrabold text-muted-foreground">平均得分</p>
            <p className="mt-1 font-display text-2xl text-primary">
              {summary.avgScore != null ? `${summary.avgScore} 分` : "—"}
            </p>
          </div>
        </div>
      )}

      <EmployeeCourseStatsTable employee={employee} />
      <EmployeeLearningHistoryList employeeId={employee.id} />
    </div>
  );
}
