"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, TrendingUp, Star, History, Building2 } from "lucide-react";

import { LearnerLoginCard } from "@/components/auth/learner-login-card";
import { UserProfileForm } from "@/components/points/user-profile-form";
import { ProfileCourseStatsSection } from "@/components/profile/profile-course-stats-section";
import { useLearnerSession } from "@/hooks/use-learner-session";
import { maskPhone } from "@/lib/auth/remembered-login";

export function ProfilePageContent() {
  const searchParams = useSearchParams();
  const isRegister = searchParams.get("register") === "1";
  const showProfileSetup = searchParams.get("setup") === "1";

  const {
    auth,
    points: {
      profile,
      levelTitle,
      weeklyRank,
      alltimeRank,
      hotelWeeklyRank,
      hotelAlltimeRank,
      hasHotel,
      isProfileComplete,
      refresh,
    },
    showLoginGate,
  } = useLearnerSession();

  useEffect(() => {
    const onAuthChange = () => refresh();
    window.addEventListener("auth-linked", onAuthChange);
    window.addEventListener("auth-signed-out", onAuthChange);
    return () => {
      window.removeEventListener("auth-linked", onAuthChange);
      window.removeEventListener("auth-signed-out", onAuthChange);
    };
  }, [refresh]);

  if (!profile || auth.loading) {
    return (
      <div className="mx-auto max-w-lg px-6 pb-24 pt-32 text-center text-sm font-semibold text-muted-foreground">
        加载中…
      </div>
    );
  }

  if (showLoginGate) {
    return (
      <div className="mx-auto max-w-lg px-6 pb-24 pt-24 lg:px-8">
        <div className="text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-secondary text-3xl font-extrabold text-white shadow-[0_4px_0_0_var(--secondary-dark)]">
            51
          </span>
          <h1 className="mt-6 font-display text-3xl text-foreground">
            {isRegister ? "注册账号" : "欢迎登录"}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
            {isRegister
              ? "使用手机号或用户名注册，设置密码后即可开始学习。"
              : "支持账号密码登录，也可切换验证码登录。"}
          </p>
        </div>

        <div className="mt-10">
          <LearnerLoginCard
            variant="gate"
            isRegister={isRegister}
            onLoggedIn={refresh}
          />
        </div>
      </div>
    );
  }

  const displayPhone = auth.phone || profile.phone || "";
  const displayName = isProfileComplete
    ? profile.nickname
    : displayPhone
      ? maskPhone(displayPhone)
      : "我的学习";
  const showStats = isProfileComplete || auth.signedIn;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 lg:px-8">
      <div className="text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary text-3xl font-extrabold text-white shadow-[0_4px_0_0_var(--primary-dark)]">
          {(profile.nickname || displayPhone || "学").charAt(0).toUpperCase()}
        </span>
        <h1 className="mt-6 font-display text-3xl text-foreground">{displayName}</h1>
        <p className="mt-2 font-semibold text-muted-foreground">
          {isProfileComplete
            ? profile.hotel
            : auth.signedIn
              ? "已登录 · 完善档案后可解锁全部课程"
              : "填写昵称与所在酒店，与 HR 登记信息一致方可解锁课程"}
        </p>
      </div>

      {showStats && (
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

          <ProfileCourseStatsSection onSeeded={refresh} />
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
                    <span className="font-extrabold text-primary">
                      +{event.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {auth.phoneAuthAvailable && auth.signedIn && isProfileComplete && (
        <div className="mt-10">
          <LearnerLoginCard onLoggedIn={refresh} />
        </div>
      )}

      {isProfileComplete && (
        <div className="mt-6">
          <UserProfileForm
            onComplete={refresh}
            verifiedPhone={auth.signedIn ? auth.phone : null}
          />
        </div>
      )}

      {!isProfileComplete && auth.signedIn && !showProfileSetup && (
        <div className="mt-8 card-elevated p-6 text-center">
          <h2 className="font-display text-lg text-foreground">完善档案解锁课程</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            登录已完成。如需学习课程，请补充昵称与所在酒店信息。
          </p>
          <Link
            href="/profile?setup=1"
            className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
          >
            去完善档案
          </Link>
        </div>
      )}

      {!isProfileComplete && (!auth.signedIn || showProfileSetup) && (
        <div className="mt-8">
          <UserProfileForm
            onComplete={refresh}
            verifiedPhone={auth.signedIn ? auth.phone : null}
          />
        </div>
      )}
    </div>
  );
}
