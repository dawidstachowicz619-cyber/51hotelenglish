"use client";

import { useEffect } from "react";
import { Trophy, TrendingUp, Star, History, Building2 } from "lucide-react";

import { PhoneLoginCard } from "@/components/auth/phone-login-card";
import { UserProfileForm } from "@/components/points/user-profile-form";
import { ProfileCourseStatsSection } from "@/components/profile/profile-course-stats-section";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { usePoints } from "@/hooks/use-points";
import { POINTS_RULES } from "@/lib/points/rules";

export function ProfilePageContent() {
  const auth = usePhoneAuth();
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

  useEffect(() => {
    const onAuthChange = () => refresh();
    window.addEventListener("auth-linked", onAuthChange);
    window.addEventListener("auth-signed-out", onAuthChange);
    return () => {
      window.removeEventListener("auth-linked", onAuthChange);
      window.removeEventListener("auth-signed-out", onAuthChange);
    };
  }, [refresh]);

  if (!profile) return null;

  const needsPhoneLogin = auth.cloudEnabled && !auth.signedIn;

  if (needsPhoneLogin) {
    return (
      <div className="mx-auto max-w-lg px-6 pb-24 pt-24 lg:px-8">
        <div className="text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-secondary text-3xl font-extrabold text-white shadow-[0_4px_0_0_var(--secondary-dark)]">
            51
          </span>
          <h1 className="mt-6 font-display text-3xl text-foreground">欢迎登录</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
            首次使用请先验证手机号登录，登录后再完善昵称与酒店信息。
          </p>
        </div>

        <div className="mt-10">
          <PhoneLoginCard variant="gate" onLoggedIn={refresh} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 lg:px-8">
      <div className="text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary text-3xl font-extrabold text-white shadow-[0_4px_0_0_var(--primary-dark)]">
          {(profile.nickname || "学").charAt(0).toUpperCase()}
        </span>
        <h1 className="mt-6 font-display text-3xl text-foreground">
          {isProfileComplete ? profile.nickname : "学员档案"}
        </h1>
        <p className="mt-2 font-semibold text-muted-foreground">
          {profile.hotel || "登录后请完善昵称与酒店信息"}
        </p>
      </div>

      {isProfileComplete && (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="card-elevated p-5">
              <Trophy className="size-5 text-accent" />
              <p className="mt-2 font-display text-2xl text-foreground">
                {profile.totalPoints}
              </p>
              <p className="text-xs font-bold text-muted-foreground">总积分</p>
            </div>
            <div className="card-elevated p-5">
              <TrendingUp className="size-5 text-primary" />
              <p className="mt-2 font-display text-2xl text-primary">
                #{alltimeRank}
              </p>
              <p className="text-xs font-bold text-muted-foreground">全国总排名</p>
            </div>
            <div className="card-elevated p-5">
              <Star className="size-5 text-secondary" />
              <p className="mt-2 font-display text-xl text-foreground">
                {profile.cefrLevel !== "—" ? profile.cefrLevel : "未测评"}
              </p>
              <p className="text-xs font-bold text-muted-foreground">CEFR 等级</p>
            </div>
            <div className="card-elevated p-5">
              <TrendingUp className="size-5 text-accent" />
              <p className="mt-2 font-display text-2xl text-accent">#{weeklyRank}</p>
              <p className="text-xs font-bold text-muted-foreground">全国本周排名</p>
            </div>
            {hasHotel && (
              <>
                <div className="card-elevated p-5">
                  <Building2 className="size-5 text-secondary" />
                  <p className="mt-2 font-display text-2xl text-secondary">
                    #{hotelAlltimeRank}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">本酒店总排名</p>
                </div>
                <div className="card-elevated p-5">
                  <Building2 className="size-5 text-primary" />
                  <p className="mt-2 font-display text-2xl text-primary">
                    #{hotelWeeklyRank}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">本酒店本周排名</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-primary-light/30 p-4 text-center">
            <p className="text-sm font-extrabold text-primary">{levelTitle}</p>
            {profile.assessmentScore > 0 && (
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                最近测评得分 {profile.assessmentScore}%
              </p>
            )}
          </div>
        </>
      )}

      {auth.cloudEnabled && auth.signedIn && (
        <div className="mt-10">
          <PhoneLoginCard onLoggedIn={refresh} />
        </div>
      )}

      <div className={auth.cloudEnabled && auth.signedIn ? "mt-6" : "mt-10"}>
        <UserProfileForm
          onComplete={refresh}
          verifiedPhone={auth.signedIn ? auth.phone : null}
        />
      </div>

      {isProfileComplete && <ProfileCourseStatsSection onSeeded={refresh} />}

      {profile.history.length > 0 && (
        <div className="mt-8 card-elevated p-6">
          <div className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <h2 className="font-display text-lg text-foreground">积分记录</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {profile.history.slice(0, 10).map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-muted-foreground">
                  {event.label}
                </span>
                <span className="font-extrabold text-primary">+{event.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 card-elevated p-6">
        <h2 className="font-display text-lg text-foreground">积分获取方式</h2>
        <ul className="mt-4 space-y-2">
          {Object.values(POINTS_RULES).map((rule) => (
            <li
              key={rule.label}
              className="flex justify-between text-sm font-semibold"
            >
              <span className="text-muted-foreground">{rule.label}</span>
              <span className="text-accent">+{rule.points}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
