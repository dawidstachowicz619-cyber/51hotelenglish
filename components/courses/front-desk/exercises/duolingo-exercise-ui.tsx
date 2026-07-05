"use client";

import { Heart, Volume2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LetterTile } from "@/lib/course/spell-letter-bank";

export function DuolingoExerciseHeader({
  progress,
  hearts,
  onClose,
}: {
  progress: number;
  hearts: number;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="退出练习"
      >
        <X className="size-5" />
      </button>

      <div className="h-4 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Heart
            key={i}
            className={cn(
              "size-5 transition-colors",
              i < hearts
                ? "fill-red text-red"
                : "fill-border text-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function DuolingoInstruction({ text }: { text: string }) {
  return (
    <h2 className="font-display text-xl leading-snug text-foreground md:text-2xl">
      {text}
    </h2>
  );
}

export function DuolingoAudioButton({
  speaking,
  onPlay,
  size = "lg",
}: {
  speaking: boolean;
  onPlay: () => void;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "size-28 md:size-32" : "size-20";

  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-b-4 transition-all active:translate-y-0.5 active:border-b-2",
        dim,
        speaking
          ? "border-secondary-dark bg-secondary/15 text-secondary"
          : "border-secondary-dark bg-white text-secondary hover:bg-secondary/5"
      )}
      aria-label="Play audio"
    >
      <Volume2 className={size === "lg" ? "size-12" : "size-8"} />
    </button>
  );
}

export function DuolingoOptionGrid({
  options,
  selected,
  correctAnswer,
  showFeedback,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  correctAnswer: string;
  showFeedback: boolean;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected === option;
        const isCorrect = option === correctAnswer;

        return (
          <button
            key={option}
            type="button"
            disabled={showFeedback}
            onClick={() => onSelect(option)}
            className={cn(
              "min-h-[4.5rem] rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-sm font-bold transition-all active:translate-y-0.5 active:border-b-2",
              !showFeedback &&
                !isSelected &&
                "border-border bg-white text-foreground hover:bg-muted",
              !showFeedback &&
                isSelected &&
                "border-secondary bg-secondary/10 text-foreground",
              showFeedback &&
                isCorrect &&
                "border-primary bg-primary-light text-foreground",
              showFeedback &&
                isSelected &&
                !isCorrect &&
                "border-red bg-red/10 text-red",
              showFeedback &&
                !isSelected &&
                !isCorrect &&
                "border-border bg-white opacity-40"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function DuolingoAnswerSlots({
  length,
  filled,
  showFeedback,
  isCorrect,
}: {
  length: number;
  filled: string[];
  showFeedback: boolean;
  isCorrect: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex h-12 min-w-10 items-center justify-center rounded-xl border-2 border-b-4 px-2 text-lg font-extrabold uppercase",
            showFeedback && isCorrect && "border-primary bg-primary-light/50",
            showFeedback && !isCorrect && "border-red bg-red/5",
            !showFeedback && "border-border bg-white"
          )}
        >
          {filled[i] ?? ""}
        </div>
      ))}
    </div>
  );
}

export function DuolingoLetterBank({
  tiles,
  usedIds,
  showFeedback,
  onPick,
  onRemove,
}: {
  tiles: LetterTile[];
  usedIds: Set<string>;
  showFeedback: boolean;
  onPick: (tile: LetterTile) => void;
  onRemove: (tile: LetterTile) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {tiles.map((tile) => {
        const used = usedIds.has(tile.id);
        return (
          <button
            key={tile.id}
            type="button"
            disabled={showFeedback || used}
            onClick={() => (used ? onRemove(tile) : onPick(tile))}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl border-2 border-b-4 text-lg font-extrabold uppercase transition-all active:translate-y-0.5 active:border-b-2",
              used
                ? "border-border bg-muted text-muted-foreground opacity-40"
                : "border-border bg-white text-foreground hover:bg-muted"
            )}
          >
            {tile.char}
          </button>
        );
      })}
    </div>
  );
}

type DuolingoActionBarProps = {
  phase: "check" | "feedback";
  canCheck: boolean;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  onCheck: () => void;
  onContinue: () => void;
  isLast: boolean;
};

export function DuolingoActionBar({
  phase,
  canCheck,
  isCorrect,
  correctAnswer,
  explanation,
  onCheck,
  onContinue,
  isLast,
}: DuolingoActionBarProps) {
  if (phase === "check") {
    return (
      <div className="sticky bottom-0 border-t-2 border-border bg-white px-4 py-4">
        <button
          type="button"
          disabled={!canCheck}
          onClick={onCheck}
          className={cn(
            "w-full rounded-2xl border-2 border-b-4 py-4 text-sm font-extrabold uppercase tracking-wide transition-all active:translate-y-0.5 active:border-b-2",
            canCheck
              ? "border-primary-dark bg-primary text-white"
              : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-70"
          )}
        >
          Check
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sticky bottom-0 border-t-2 px-4 py-4",
        isCorrect
          ? "border-primary/30 bg-primary-light"
          : "border-red/30 bg-[#ffdfe0]"
      )}
    >
      <div className="mb-4">
        <p
          className={cn(
            "font-display text-xl",
            isCorrect ? "text-primary-dark" : "text-red"
          )}
        >
          {isCorrect ? "Nice!" : "Correct answer:"}
        </p>
        {!isCorrect && correctAnswer && (
          <p className="mt-1 font-bold text-foreground">{correctAnswer}</p>
        )}
        {explanation && (
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {explanation}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "w-full rounded-2xl border-2 border-b-4 py-4 text-sm font-extrabold uppercase tracking-wide text-white transition-all active:translate-y-0.5 active:border-b-2",
          isCorrect
            ? "border-primary-dark bg-primary"
            : "border-[#ea2b2b] bg-red"
        )}
      >
        {isLast ? "Finish" : "Continue"}
      </button>
    </div>
  );
}

export function DuolingoLessonComplete({
  correctCount,
  total,
  heartsLeft,
  onClaim,
  onBack,
  isCompleted,
  title,
  subtitle,
}: {
  correctCount: number;
  total: number;
  heartsLeft: number;
  onClaim: () => void;
  onBack: () => void;
  isCompleted: boolean;
  title: string;
  subtitle: string;
}) {
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const xp = correctCount * 10 + heartsLeft * 5;

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_0_0_var(--primary-dark)]">
        <span className="font-display text-4xl">★</span>
      </div>
      <h2 className="mt-6 font-display text-3xl text-primary">Lesson complete!</h2>
      <p className="mt-2 text-sm font-bold text-muted-foreground">
        {title} · {subtitle}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border-2 border-border bg-white p-4">
          <p className="font-display text-2xl text-accent">{xp}</p>
          <p className="text-xs font-bold text-muted-foreground">XP</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-white p-4">
          <p className="font-display text-2xl text-primary">{accuracy}%</p>
          <p className="text-xs font-bold text-muted-foreground">Accuracy</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-white p-4">
          <p className="font-display text-2xl text-red">{heartsLeft}</p>
          <p className="text-xs font-bold text-muted-foreground">Hearts left</p>
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-muted-foreground">
        {correctCount} / {total} correct
      </p>

      {!isCompleted ? (
        <button
          type="button"
          onClick={onClaim}
          className="btn-primary-3d mt-8 w-full max-w-xs py-4 text-sm"
        >
          Claim XP · Next level
        </button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 w-full max-w-xs rounded-2xl border-2 border-border bg-white py-4 text-sm font-extrabold uppercase tracking-wide text-foreground shadow-[0_4px_0_0_#e5e5e5]"
        >
          Back to map
        </button>
      )}
    </div>
  );
}

export function DuolingoOutOfHearts({
  onRestart,
  onBack,
}: {
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red/10">
        <Heart className="size-10 fill-red text-red" />
      </div>
      <h2 className="mt-6 font-display text-2xl text-foreground">
        You ran out of hearts!
      </h2>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        Review the material and try this level again.
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="btn-primary-3d mt-8 w-full py-4 text-sm"
      >
        Try again
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full py-3 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        Back to map
      </button>
    </div>
  );
}
