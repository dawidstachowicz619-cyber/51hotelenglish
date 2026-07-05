"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function ExerciseOptionButton({
  label,
  selected,
  correct,
  showFeedback,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  correct: boolean;
  showFeedback: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border-2 px-5 py-4 text-left text-sm font-bold transition-all",
        !showFeedback &&
          selected &&
          "border-primary bg-primary-light/50 text-foreground",
        !showFeedback &&
          !selected &&
          "border-border bg-white text-foreground hover:border-primary/40 hover:bg-muted",
        showFeedback &&
          correct &&
          "border-primary bg-primary-light/60 text-foreground",
        showFeedback &&
          selected &&
          !correct &&
          "border-red bg-red/10 text-red",
        showFeedback &&
          !selected &&
          !correct &&
          "border-border bg-white opacity-50"
      )}
    >
      <span className="flex items-center gap-3">
        {showFeedback && correct && (
          <CheckCircle2 className="size-5 shrink-0 text-primary" />
        )}
        {showFeedback && selected && !correct && (
          <XCircle className="size-5 shrink-0 text-red" />
        )}
        {label}
      </span>
    </button>
  );
}

export function ExerciseAudioPrompt({
  label,
  onPlay,
  speaking,
}: {
  label: string;
  onPlay: () => void;
  speaking: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "mx-auto flex size-24 items-center justify-center rounded-full border-4 transition-all",
        speaking
          ? "border-secondary bg-secondary/15 text-secondary"
          : "border-secondary bg-secondary/10 text-secondary hover:scale-105 active:scale-95"
      )}
      aria-label="播放题目音频"
    >
      <span className="flex flex-col items-center gap-1">
        <svg
          viewBox="0 0 24 24"
          className="size-10"
          fill="currentColor"
          aria-hidden
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <span className="text-[10px] font-extrabold uppercase">
          {speaking ? "播放中" : "点击播放"}
        </span>
      </span>
    </button>
  );
}
