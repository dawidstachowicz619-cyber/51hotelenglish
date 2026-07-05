"use client";

import type { CefrLevel } from "@/lib/types/course";
import { CEFR_LABELS, CEFR_LEVELS } from "@/lib/types/course";
import { cn } from "@/lib/utils";

type CefrLevelPickerProps = {
  value: CefrLevel;
  onChange: (level: CefrLevel) => void;
  recommended?: CefrLevel | null;
};

const LEVEL_COLORS: Record<CefrLevel, string> = {
  A1: "border-emerald-400 bg-emerald-50 text-emerald-700",
  A2: "border-primary bg-primary-light/50 text-primary",
  B1: "border-secondary bg-secondary/10 text-secondary-dark",
  B2: "border-accent bg-accent/10 text-accent",
  C1: "border-purple bg-purple/10 text-purple",
};

export function CefrLevelPicker({
  value,
  onChange,
  recommended,
}: CefrLevelPickerProps) {
  return (
    <div className="card-elevated p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-foreground">CEFR 学习级别</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            按你的英语水平选择内容难度
            {recommended && (
              <span className="ml-1 text-primary">
                · 测评推荐 {recommended}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {CEFR_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition-all",
              value === level
                ? `${LEVEL_COLORS[level]} shadow-[0_3px_0_0_rgba(0,0,0,0.08)]`
                : "border-border bg-white text-muted-foreground hover:border-primary/30"
            )}
          >
            {level}
            <span className="ml-1.5 hidden text-xs font-semibold opacity-80 sm:inline">
              {CEFR_LABELS[level]}
            </span>
            {recommended === level && value !== level && (
              <span className="ml-1 text-[10px]">★</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
