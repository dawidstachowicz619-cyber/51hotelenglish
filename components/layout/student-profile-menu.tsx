"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ClipboardCheck,
  LogOut,
  Trophy,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { usePoints } from "@/hooks/use-points";
import { resetLearnerSession } from "@/lib/points/storage";
import { cn } from "@/lib/utils";

function getInitial(nickname: string): string {
  if (!nickname) return "学";
  return nickname.charAt(0).toUpperCase();
}

export function StudentProfileMenu() {
  const {
    profile,
    levelTitle,
    weeklyRank,
    hotelWeeklyRank,
    hasHotel,
    isProfileComplete,
  } = usePoints();
  const auth = usePhoneAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    setOpen(false);
    try {
      if (auth.cloudEnabled && auth.signedIn) {
        await auth.signOut();
      }
      resetLearnerSession();
      router.push("/profile");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!profile) return null;

  const displayName = isProfileComplete ? profile.nickname : "新学员";
  const displayHotel = profile.hotel || "点击完善档案";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border-2 border-border bg-white py-1.5 pl-1.5 pr-3 transition-all hover:border-primary/30 hover:bg-muted",
          open && "border-primary/40 bg-muted"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-white">
          {getInitial(profile.nickname)}
        </span>
        <div className="hidden text-left sm:block">
          <p className="max-w-[8rem] truncate text-sm font-bold leading-tight text-foreground">
            {displayName}
          </p>
          <p className="max-w-[8rem] truncate text-[10px] font-semibold text-muted-foreground">
            {isProfileComplete ? `${profile.totalPoints} 积分` : "完善档案"}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-2xl border-2 border-border bg-white shadow-lg">
          <div className="bg-gradient-to-br from-primary-light/60 to-secondary/10 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-white">
                {getInitial(profile.nickname)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs font-semibold text-muted-foreground">
                  {displayHotel}
                </p>
              </div>
            </div>

            <div className={cn("mt-4 grid gap-2", hasHotel ? "grid-cols-4" : "grid-cols-3")}>
              <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
                <p className="font-display text-lg text-accent">
                  {profile.totalPoints}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">积分</p>
              </div>
              <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
                <p className="font-display text-lg text-primary">
                  {profile.cefrLevel !== "—" ? profile.cefrLevel : "—"}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">CEFR</p>
              </div>
              <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
                <p className="font-display text-lg text-secondary">
                  #{weeklyRank || "—"}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">全国</p>
              </div>
              {hasHotel && (
                <div className="rounded-lg bg-white/80 px-2 py-2 text-center">
                  <p className="font-display text-lg text-secondary">
                    #{hotelWeeklyRank || "—"}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">酒店</p>
                </div>
              )}
            </div>

            {isProfileComplete && (
              <p className="mt-3 text-center text-xs font-extrabold text-primary">
                {levelTitle}
              </p>
            )}
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <User className="size-4 text-primary" />
              个人档案
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <Trophy className="size-4 text-accent" />
              学习成绩排名
            </Link>
            <Link
              href="/assessment"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <ClipboardCheck className="size-4 text-secondary" />
              水平测评
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted disabled:opacity-60"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              <LogOut className="size-4 text-muted-foreground" />
              {signingOut ? "退出中…" : "退出登录"}
            </button>
          </div>

          {!isProfileComplete && (
            <div className="border-t-2 border-border p-3">
              <Button size="sm" className="w-full" asChild>
                <Link href="/profile" onClick={() => setOpen(false)}>
                  完善个人信息
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StudentProfileMobileCard({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const {
    profile,
    levelTitle,
    weeklyRank,
    hotelWeeklyRank,
    hasHotel,
    isProfileComplete,
  } = usePoints();
  const auth = usePhoneAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    onNavigate?.();
    try {
      if (auth.cloudEnabled && auth.signedIn) {
        await auth.signOut();
      }
      resetLearnerSession();
      router.push("/profile");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mb-4 rounded-2xl border-2 border-primary/20 bg-primary-light/30 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-base font-extrabold text-white">
          {getInitial(profile.nickname)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-foreground">
            {isProfileComplete ? profile.nickname : "新学员"}
          </p>
          <p className="truncate text-xs font-semibold text-muted-foreground">
            {profile.hotel || "未设置酒店"} · {profile.totalPoints} 积分
            {hasHotel && ` · 酒店 #${hotelWeeklyRank}`}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href="/profile"
          className="flex-1 rounded-xl bg-white py-2 text-center text-xs font-extrabold text-primary"
          onClick={onNavigate}
        >
          个人档案
        </Link>
        <Link
          href="/leaderboard"
          className="flex-1 rounded-xl bg-white py-2 text-center text-xs font-extrabold text-accent"
          onClick={onNavigate}
        >
          排名 #{weeklyRank}
        </Link>
      </div>
      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-xs font-extrabold text-muted-foreground disabled:opacity-60"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
      >
        <LogOut className="size-3.5" />
        {signingOut ? "退出中…" : "退出登录"}
      </button>
      {isProfileComplete && (
        <p className="mt-2 text-center text-[10px] font-bold text-muted-foreground">
          {levelTitle} · CEFR {profile.cefrLevel}
        </p>
      )}
    </div>
  );
}
