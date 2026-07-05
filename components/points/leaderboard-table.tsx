"use client";

import { Medal, Trophy } from "lucide-react";

import type { LeaderboardEntry } from "@/lib/types/points";
import { cn } from "@/lib/utils";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  showHotel?: boolean;
};

const BADGE_STYLES = {
  gold: "bg-accent text-white",
  silver: "bg-secondary text-white",
  bronze: "bg-orange-600 text-white",
};

export function LeaderboardTable({
  entries,
  showHotel = true,
}: LeaderboardTableProps) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="grid grid-cols-[3rem_1fr_auto] gap-4 border-b-2 border-border bg-muted px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        <span>排名</span>
        <span>学员</span>
        <span className="text-right">积分</span>
      </div>

      <ul className="divide-y-2 divide-border">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={cn(
              "grid grid-cols-[3rem_1fr_auto] items-center gap-4 px-5 py-4 transition-colors",
              entry.isCurrentUser && "bg-primary-light/40"
            )}
          >
            <div className="flex items-center justify-center">
              {entry.rank <= 3 ? (
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-extrabold",
                    entry.badge && BADGE_STYLES[entry.badge]
                  )}
                >
                  {entry.rank === 1 ? (
                    <Trophy className="size-4" />
                  ) : (
                    <Medal className="size-4" />
                  )}
                </span>
              ) : (
                <span className="font-display text-lg text-muted-foreground">
                  {entry.rank}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">
                {entry.nickname}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs font-extrabold text-primary">
                    (我)
                  </span>
                )}
              </p>
              <p className="truncate text-xs font-semibold text-muted-foreground">
                {showHotel ? `${entry.hotel} · ` : ""}
                {entry.cefrLevel}
              </p>
            </div>

            <div className="text-right">
              <p className="font-display text-xl text-accent">{entry.points}</p>
              <p className="text-[10px] font-bold text-muted-foreground">积分</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
