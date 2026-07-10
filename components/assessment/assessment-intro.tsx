"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Layers,
  Lock,
  Target,
} from "lucide-react";

import {
  ASSESSMENT_LEVELS,
  PASS_THRESHOLD,
  QUESTIONS_PER_LEVEL,
} from "@/lib/assessment/level-test-config";
import {
  loadLevelTestProgress,
  type LevelTestProgress,
} from "@/lib/assessment/level-progress-storage";
import { getLevelColor, CEFR_LEVEL_INFO } from "@/lib/assessment/scoring";
import type { CEFRLevel } from "@/lib/types/assessment";
import { QUESTION_TYPE_LABELS } from "@/lib/types/assessment";
import { cn } from "@/lib/utils";

type AssessmentIntroProps = {
  onSelectLevel: (level: CEFRLevel) => void;
};

const questionTypes = Object.values(QUESTION_TYPE_LABELS);

export function AssessmentIntro({ onSelectLevel }: AssessmentIntroProps) {
  const [progress, setProgress] = useState<LevelTestProgress>({});

  useEffect(() => {
    setProgress(loadLevelTestProgress());
  }, []);

  const passedCount = useMemo(
    () => Object.values(progress).filter((r) => r?.passed).length,
    [progress]
  );

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-secondary text-white shadow-[0_4px_0_0_var(--secondary-dark)]">
        <ClipboardCheck className="size-10" strokeWidth={2} />
      </div>

      <h1 className="mt-8 font-display text-3xl text-foreground md:text-4xl">
        CEFR 英语水平测评
      </h1>
      <p className="mt-4 text-base font-semibold leading-relaxed text-muted-foreground">
        分为 A1–C1 五个独立级别测试，每级 {QUESTIONS_PER_LEVEL} 题，
        {PASS_THRESHOLD} 分及以上通关。通过后可解锁对应级别的学习推荐。
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="card-elevated flex flex-col items-center p-5">
          <Layers className="size-6 text-primary" />
          <p className="mt-2 font-display text-2xl text-foreground">5</p>
          <p className="text-xs font-bold text-muted-foreground">独立级别测试</p>
        </div>
        <div className="card-elevated flex flex-col items-center p-5">
          <Target className="size-6 text-accent" />
          <p className="mt-2 font-display text-2xl text-foreground">
            {QUESTIONS_PER_LEVEL}
          </p>
          <p className="text-xs font-bold text-muted-foreground">题 / 每级</p>
        </div>
        <div className="card-elevated flex flex-col items-center p-5">
          <Clock className="size-6 text-secondary" />
          <p className="mt-2 font-display text-2xl text-foreground">
            {PASS_THRESHOLD}
          </p>
          <p className="text-xs font-bold text-muted-foreground">分通关线</p>
        </div>
      </div>

      <div className="mt-8 card-elevated p-6 text-left">
        <p className="text-sm font-extrabold text-foreground">题型涵盖</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {questionTypes.map((label) => (
            <span
              key={label}
              className="rounded-full border-2 border-border bg-muted px-3 py-1 text-xs font-bold text-foreground"
            >
              {label}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          每个级别单独测试，涵盖该级别的词汇、语法、阅读、酒店场景及口语。
          已通关 {passedCount} / {ASSESSMENT_LEVELS.length} 个级别。
        </p>
      </div>

      <div className="mt-8 space-y-3 text-left">
        <p className="text-center text-sm font-extrabold text-foreground">
          选择要挑战的级别
        </p>
        {ASSESSMENT_LEVELS.map((level) => {
          const info = CEFR_LEVEL_INFO[level];
          const record = progress[level];
          const passed = record?.passed ?? false;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelectLevel(level)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 px-5 py-4 text-left transition-all hover:bg-muted/50 active:translate-y-0.5 active:border-b-2",
                passed ? "border-primary/40 bg-primary-light/20" : "border-border bg-white"
              )}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl font-display text-lg text-white",
                  getLevelColor(level)
                )}
              >
                {level}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-foreground">{info.title}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {QUESTIONS_PER_LEVEL} 题 · {PASS_THRESHOLD} 分通关
                  {record ? ` · 最高 ${record.score} 分` : ""}
                </p>
              </div>
              {passed ? (
                <CheckCircle2 className="size-6 shrink-0 text-primary" />
              ) : (
                <Lock className="size-6 shrink-0 text-muted-foreground/40" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs font-bold text-muted-foreground">
        开始测试前需拍照验证身份
      </p>
    </div>
  );
}
