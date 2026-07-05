"use client";

import {
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import type { HotelLearningStats } from "@/lib/types/hr-admin";

type HotelStatsCardsProps = {
  stats: HotelLearningStats;
};

export function HotelStatsCards({ stats }: HotelStatsCardsProps) {
  const cards = [
    {
      label: "员工总数",
      value: stats.totalEmployees,
      sub: `${stats.activeThisWeek} 人本周活跃`,
      icon: Users,
      color: "text-secondary",
    },
    {
      label: "平均学习进度",
      value: `${stats.avgProgressPercent}%`,
      sub: `共完成 ${stats.totalCompletedLessons} 关`,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      label: "平均测评得分",
      value: stats.avgAssessmentScore || "—",
      sub: `测评通过率 ${stats.assessmentPassRate}%`,
      icon: ClipboardCheck,
      color: "text-accent",
    },
    {
      label: "本周活跃率",
      value:
        stats.totalEmployees > 0
          ? `${Math.round((stats.activeThisWeek / stats.totalEmployees) * 100)}%`
          : "0%",
      sub: "近 7 日有学习记录",
      icon: TrendingUp,
      color: "text-purple",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="card-elevated p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs font-extrabold text-muted-foreground">
              {card.label}
            </p>
            <card.icon className={`size-5 ${card.color}`} />
          </div>
          <p className="mt-3 font-display text-3xl text-foreground">
            {card.value}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
