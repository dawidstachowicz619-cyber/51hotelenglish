"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

import type { CefrLevel } from "@/lib/types/course";
import { CEFR_LABELS, CEFR_LEVELS } from "@/lib/types/course";
import { TRIAL_CEFR_LEVEL } from "@/lib/assessment/course-access";
import { cn } from "@/lib/utils";

type CourseLevelPickerProps = {
  value: CefrLevel;
  onChange: (level: CefrLevel) => void;
  maxAccessibleLevel: CefrLevel | null;
  canAccess: (level: CefrLevel) => boolean;
};

const LEVEL_COLORS: Record<CefrLevel, string> = {
  A1: "border-emerald-400 bg-emerald-50 text-emerald-700",
  A2: "border-primary bg-primary-light/50 text-primary",
  B1: "border-secondary bg-secondary/10 text-secondary-dark",
  B2: "border-accent bg-accent/10 text-accent",
  C1: "border-purple bg-purple/10 text-purple",
};

export function CourseLevelPicker({
  value,
  onChange,
  maxAccessibleLevel,
  canAccess,
}: CourseLevelPickerProps) {
  return (
    <div className="card-elevated p-5">
      <div>
        <p className="text-sm font-extrabold text-foreground">选择学习级别</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          {maxAccessibleLevel ? (
            <>
              测评最高通关{" "}
              <span className="font-extrabold text-primary">{maxAccessibleLevel}</span>
              ，可学习该级别及以下课程
            </>
          ) : (
            <>
              试学模式：当前可学{" "}
              <span className="font-extrabold text-primary">{TRIAL_CEFR_LEVEL}</span>
              ，完成{" "}
              <Link href="/assessment" className="font-extrabold text-secondary hover:underline">
                CEFR 测评
              </Link>{" "}
              后解锁更高级别
            </>
          )}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {CEFR_LEVELS.map((level) => {
          const unlocked = canAccess(level);
          const selected = value === level;

          return (
            <button
              key={level}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && onChange(level)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition-all",
                selected && unlocked && `${LEVEL_COLORS[level]} shadow-[0_3px_0_0_rgba(0,0,0,0.08)]`,
                !selected && unlocked &&
                  "border-border bg-white text-muted-foreground hover:border-primary/30",
                !unlocked &&
                  "cursor-not-allowed border-border bg-muted/50 text-muted-foreground/60 opacity-70"
              )}
            >
              {!unlocked && <Lock className="size-3.5" />}
              {level}
              <span className="hidden text-xs font-semibold opacity-80 sm:inline">
                {CEFR_LABELS[level]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
