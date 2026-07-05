"use client";

import { useState } from "react";
import { Building2, Star, TrendingUp, Trophy, Zap } from "lucide-react";

import { LeaderboardTable } from "@/components/points/leaderboard-table";
import { UserProfileForm } from "@/components/points/user-profile-form";
import { usePoints } from "@/hooks/use-points";
import {
  buildHotelLeaderboard,
  buildLeaderboard,
  getHotelMemberCount,
} from "@/lib/points/leaderboard";
import { POINTS_RULES } from "@/lib/points/rules";
import type { LeaderboardPeriod, LeaderboardScope } from "@/lib/types/points";
import { cn } from "@/lib/utils";

export function LeaderboardPageContent() {
  const {
    profile,
    levelTitle,
    weeklyRank,
    alltimeRank,
    hotelWeeklyRank,
    hotelAlltimeRank,
    hasHotel,
    isProfileComplete,
    refresh,
  } = usePoints();
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [scope, setScope] = useState<LeaderboardScope>("global");

  if (!profile) return null;

  const isHotelScope = scope === "hotel";
  const entries = isHotelScope
    ? buildHotelLeaderboard(profile, period)
    : buildLeaderboard(profile, period);

  const globalRank = period === "weekly" ? weeklyRank : alltimeRank;
  const hotelRank = period === "weekly" ? hotelWeeklyRank : hotelAlltimeRank;
  const currentRank = isHotelScope ? hotelRank : globalRank;
  const secondaryRank = isHotelScope ? globalRank : hotelRank;
  const hotelMemberCount = hasHotel ? getHotelMemberCount(profile) : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_4px_0_0_#e68600]">
          <Trophy className="size-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-foreground md:text-4xl">
          学习成绩排名
        </h1>
        <p className="mt-3 font-semibold text-muted-foreground">
          {isHotelScope && hasHotel
            ? `${profile.hotel} 内部排行 · 共 ${hotelMemberCount} 人`
            : "通过测评、课程学习赚取积分，与全国酒店同仁一较高下"}
        </p>
      </div>

      {!isProfileComplete && (
        <div className="mt-10">
          <UserProfileForm onComplete={refresh} />
        </div>
      )}

      {isProfileComplete && (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-elevated p-5 text-center">
              <Zap className="mx-auto size-6 text-accent" />
              <p className="mt-2 font-display text-3xl text-foreground">
                {profile.totalPoints}
              </p>
              <p className="text-xs font-bold text-muted-foreground">总积分</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <TrendingUp className="mx-auto size-6 text-primary" />
              <p className="mt-2 font-display text-3xl text-primary">
                #{currentRank || "—"}
              </p>
              <p className="text-xs font-bold text-muted-foreground">
                {isHotelScope
                  ? period === "weekly"
                    ? "本酒店本周"
                    : "本酒店总排"
                  : period === "weekly"
                    ? "全国本周"
                    : "全国总排"}
              </p>
            </div>
            {hasHotel && (
              <div className="card-elevated p-5 text-center">
                <Building2 className="mx-auto size-6 text-secondary" />
                <p className="mt-2 font-display text-3xl text-secondary">
                  #{secondaryRank || "—"}
                </p>
                <p className="text-xs font-bold text-muted-foreground">
                  {isHotelScope
                    ? period === "weekly"
                      ? "全国本周"
                      : "全国总排"
                    : period === "weekly"
                      ? "本酒店本周"
                      : "本酒店总排"}
                </p>
              </div>
            )}
            <div className="card-elevated p-5 text-center">
              <Star className="mx-auto size-6 text-secondary" />
              <p className="mt-2 font-display text-lg text-foreground">
                {levelTitle}
              </p>
              <p className="text-xs font-bold text-muted-foreground">
                {profile.cefrLevel !== "—"
                  ? `CEFR ${profile.cefrLevel}`
                  : "完成测评解锁"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            {(
              [
                { id: "global", label: "全国排行" },
                { id: "hotel", label: "本酒店排行" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScope(item.id)}
                className={cn(
                  "flex-1 rounded-xl border-2 py-2.5 text-sm font-extrabold transition-all",
                  scope === item.id
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border text-muted-foreground hover:border-secondary/30"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            {(["weekly", "alltime"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "flex-1 rounded-xl border-2 py-2.5 text-sm font-extrabold transition-all",
                  period === p
                    ? "border-primary bg-primary-light/50 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {p === "weekly" ? "本周排行" : "总排行"}
              </button>
            ))}
          </div>

          {isHotelScope && !hasHotel && (
            <div className="mt-6 rounded-2xl border-2 border-secondary/30 bg-secondary/5 p-6 text-center">
              <Building2 className="mx-auto size-8 text-secondary" />
              <p className="mt-3 font-bold text-foreground">
                请先填写所在酒店
              </p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                完善酒店信息后即可查看本酒店内部排名
              </p>
            </div>
          )}

          {(!isHotelScope || hasHotel) && (
            <div className="mt-6">
              <LeaderboardTable entries={entries} showHotel={!isHotelScope} />
            </div>
          )}

          {isHotelScope && hasHotel && entries.length <= 1 && (
            <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">
              你是本酒店首位学员，邀请同事一起学习吧！
            </p>
          )}
        </>
      )}

      <div className="mt-10 card-elevated p-6">
        <h2 className="font-display text-lg text-foreground">积分规则</h2>
        <ul className="mt-4 space-y-2">
          {Object.values(POINTS_RULES).map((rule) => (
            <li
              key={rule.label}
              className="flex items-center justify-between text-sm font-semibold"
            >
              <span className="text-muted-foreground">{rule.label}</span>
              <span className="font-extrabold text-accent">+{rule.points}</span>
            </li>
          ))}
          <li className="flex items-center justify-between border-t-2 border-border pt-2 text-sm font-semibold">
            <span className="text-muted-foreground">测评每答对一题</span>
            <span className="font-extrabold text-accent">
              +{POINTS_RULES.assessment_correct.points}
            </span>
          </li>
        </ul>
      </div>

      {profile.history.length > 0 && (
        <div className="mt-6 card-elevated p-6">
          <h2 className="font-display text-lg text-foreground">最近积分记录</h2>
          <ul className="mt-4 space-y-3">
            {profile.history.slice(0, 8).map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-muted-foreground">
                  {event.label}
                </span>
                <span className="font-extrabold text-primary">
                  +{event.points}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
