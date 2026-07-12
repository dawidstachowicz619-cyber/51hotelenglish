"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, History } from "lucide-react";

import {
  getLearningHistory,
  replaceLearningHistory,
} from "@/lib/hr/learning-history-storage";
import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type { LearningHistoryEntry } from "@/lib/types/learning-record";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
} from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

type Props = {
  employeeId: string;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmployeeLearningHistoryList({ employeeId }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [cloudHistory, setCloudHistory] = useState<LearningHistoryEntry[] | null>(null);

  useEffect(() => {
    if (!isCloudSyncActive()) return;
    void fetch(
      `/api/hr/learning-history?employeeId=${encodeURIComponent(employeeId)}`,
      { credentials: "include" }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { history?: LearningHistoryEntry[] } | null) => {
        if (data?.history) {
          setCloudHistory(data.history);
          replaceLearningHistory(employeeId, data.history);
        }
      });
  }, [employeeId, refreshKey]);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("course-progress-updated", refresh);
    window.addEventListener("assessment-updated", refresh);
    window.addEventListener("russian-daily-updated", refresh);
    window.addEventListener("russian-campaign-updated", refresh);
    window.addEventListener("russian-items-progress-updated", refresh);
    window.addEventListener("employee-training-updated", refresh);
    window.addEventListener("learning-history-updated", refresh);
    return () => {
      window.removeEventListener("course-progress-updated", refresh);
      window.removeEventListener("assessment-updated", refresh);
      window.removeEventListener("russian-daily-updated", refresh);
      window.removeEventListener("russian-campaign-updated", refresh);
      window.removeEventListener("russian-items-progress-updated", refresh);
      window.removeEventListener("employee-training-updated", refresh);
      window.removeEventListener("learning-history-updated", refresh);
    };
  }, []);

  const history = useMemo(() => {
    void refreshKey;
    const local = getLearningHistory(employeeId);
    const source = cloudHistory && cloudHistory.length > 0 ? cloudHistory : local;
    return [...source].sort((a, b) => b.at.localeCompare(a.at));
  }, [employeeId, refreshKey, cloudHistory]);

  return (
    <section className="card-elevated mt-6 overflow-hidden">
      <div className="border-b-2 border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
            <History className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-lg text-foreground">学习活动记录</h3>
            <p className="text-xs font-semibold text-muted-foreground">
              按时间倒序 · 共 {history.length} 条
              {isCloudSyncActive() && " · 云端同步"}
            </p>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm font-semibold text-muted-foreground">
          暂无学习活动记录。学员完成课程、测评或打卡后，记录将显示在此。
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{entry.title}</p>
                {entry.subtitle && (
                  <p className="mt-0.5 text-sm font-semibold text-muted-foreground">
                    {entry.subtitle}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground">
                    {LEARNING_PHASE_LABELS[entry.phase]}
                  </span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-extrabold text-accent">
                    {ASK_SHORT[entry.ask]}
                  </span>
                  {entry.score != null && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                        entry.score >= 80
                          ? "bg-primary-light/60 text-primary"
                          : "bg-secondary/10 text-secondary-dark"
                      )}
                    >
                      {entry.score} 分
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Clock className="size-3.5" />
                {formatWhen(entry.at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
