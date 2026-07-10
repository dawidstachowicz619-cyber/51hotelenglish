"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import type { GuestMood } from "@/lib/types/ai-coach";

const MOOD_TINT: Record<GuestMood, string> = {
  calm: "bg-slate-900/10",
  impatient: "bg-amber-900/20",
  angry: "bg-red-900/30",
  satisfied: "bg-emerald-900/15",
};

type GuestVideoPanelProps = {
  avatarUrl: string;
  avatarPosition?: string;
  guestName: string;
  guestPersona: string;
  mood: GuestMood;
  speaking: boolean;
  subtitle?: string;
  subtitleCn?: string;
};

export function GuestVideoPanel({
  avatarUrl,
  avatarPosition = "center 12%",
  guestName,
  guestPersona,
  mood,
  speaking,
  subtitle,
  subtitleCn,
}: GuestVideoPanelProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#e8e8e8] px-4 py-3">
      <div
        className={cn(
          "relative h-full w-full max-w-[280px] overflow-hidden rounded-2xl bg-neutral-700 shadow-md",
          speaking && "ring-2 ring-secondary/60"
        )}
      >
        <Image
          src={avatarUrl}
          alt={guestName}
          fill
          priority
          sizes="280px"
          className={cn(
            "object-cover transition-transform duration-500",
            speaking && "scale-[1.03]"
          )}
          style={{ objectPosition: avatarPosition }}
        />

        <div className={cn("absolute inset-0 transition-colors duration-700", MOOD_TINT[mood])} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

        {speaking && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
            </span>
            <span className="text-[9px] font-bold text-white">说话中</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8">
          <p className="text-sm font-extrabold text-white drop-shadow">{guestName}</p>
          <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-snug text-white/85 drop-shadow">
            {guestPersona}
          </p>
        </div>

        {(subtitle || subtitleCn) && speaking && (
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-2 pb-6 pt-2">
            {subtitleCn && (
              <p className="text-center text-[11px] font-bold leading-snug text-white">
                {subtitleCn}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type GuestChatAvatarProps = {
  avatarUrl: string;
  avatarPosition?: string;
  guestName: string;
  size?: "sm" | "md";
};

export function GuestChatAvatar({
  avatarUrl,
  avatarPosition = "center 12%",
  guestName,
  size = "md",
}: GuestChatAvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-neutral-200",
        size === "sm" ? "size-9" : "size-10"
      )}
    >
      <Image
        src={avatarUrl}
        alt={guestName}
        fill
        sizes={size === "sm" ? "36px" : "40px"}
        className="object-cover"
        style={{ objectPosition: avatarPosition }}
      />
    </div>
  );
}
