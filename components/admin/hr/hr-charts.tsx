"use client";

import { Medal, Trophy } from "lucide-react";

import type { HotelLearningStats } from "@/lib/types/hr-admin";
import { cn } from "@/lib/utils";

type DepartmentChartProps = {
  stats: HotelLearningStats;
};

const RANK_STYLES = [
  { badge: "bg-amber-400 text-amber-950", icon: Trophy },
  { badge: "bg-slate-300 text-slate-800", icon: Medal },
  { badge: "bg-amber-700/80 text-white", icon: Medal },
] as const;

export function DepartmentRanking({ stats }: DepartmentChartProps) {
  if (stats.departmentRanking.length === 0) {
    return (
      <div className="card-elevated p-5">
        <h3 className="font-display text-lg text-foreground">部门学习排名</h3>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          暂无部门数据
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="border-b-2 border-border p-5">
        <h3 className="font-display text-lg text-foreground">部门学习排名</h3>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          综合得分 = 进度 45% · 测评 30% · 积分 15% · 活跃率 10%
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/50 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 w-16">排名</th>
              <th className="px-4 py-3">部门</th>
              <th className="px-4 py-3">综合得分</th>
              <th className="px-4 py-3">平均进度</th>
              <th className="px-4 py-3">平均测评</th>
              <th className="px-4 py-3">人均积分</th>
              <th className="px-4 py-3">活跃率</th>
              <th className="px-4 py-3">人数</th>
            </tr>
          </thead>
          <tbody>
            {stats.departmentRanking.map((dept) => {
              const rankStyle = RANK_STYLES[dept.rank - 1];
              const RankIcon = rankStyle?.icon;

              return (
                <tr
                  key={dept.department}
                  className={cn(
                    "border-b border-border",
                    dept.rank <= 3 && "bg-secondary/5"
                  )}
                >
                  <td className="px-4 py-3">
                    {rankStyle && RankIcon ? (
                      <span
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-full",
                          rankStyle.badge
                        )}
                      >
                        <RankIcon className="size-4" />
                      </span>
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-xs font-extrabold text-muted-foreground">
                        {dept.rank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-extrabold text-foreground">
                      {dept.label}
                    </span>
                    {dept.rank === 1 && (
                      <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                        领先
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display text-lg font-extrabold text-primary">
                      {dept.compositeScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{dept.avgProgress}%</td>
                  <td className="px-4 py-3 font-bold">
                    {dept.avgAssessmentScore > 0
                      ? `${dept.avgAssessmentScore} 分`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-bold">{dept.avgPoints}</td>
                  <td className="px-4 py-3 font-bold">{dept.activeRate}%</td>
                  <td className="px-4 py-3 font-bold text-muted-foreground">
                    {dept.count} 人
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DepartmentBreakdown({ stats }: DepartmentChartProps) {
  const maxCount = Math.max(...stats.departmentBreakdown.map((d) => d.count), 1);

  return (
    <div className="card-elevated p-5">
      <h3 className="font-display text-lg text-foreground">部门学习概况</h3>
      <div className="mt-4 space-y-4">
        {stats.departmentBreakdown.map((dept) => (
          <div key={dept.department}>
            <div className="flex justify-between text-xs font-bold">
              <span>{dept.label}</span>
              <span className="text-muted-foreground">
                {dept.count} 人 · 均 {dept.avgProgress}%
              </span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${(dept.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LevelBreakdown({ stats }: DepartmentChartProps) {
  const max = Math.max(...stats.levelBreakdown.map((l) => l.count), 1);

  return (
    <div className="card-elevated p-5">
      <h3 className="font-display text-lg text-foreground">CEFR 等级分布</h3>
      <div className="mt-4 space-y-3">
        {stats.levelBreakdown.map((item) => (
          <div key={item.level} className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-sm font-extrabold">
              {item.level}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs font-bold text-muted-foreground">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
