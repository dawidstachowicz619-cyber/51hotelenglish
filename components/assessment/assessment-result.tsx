"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PASS_THRESHOLD } from "@/lib/assessment/level-test-config";
import {
  buildWrongAnswerRecords,
  formatUserAnswer,
  getCorrectAnswerText,
  getQuestionSummary,
  questionTypeLabel,
} from "@/lib/assessment/answer-review";
import { CEFR_LEVEL_INFO } from "@/lib/assessment/level-scoring";
import { getLevelColor } from "@/lib/assessment/scoring";
import type { LevelTestResult } from "@/lib/assessment/level-scoring";
import type { AssessmentQuestion } from "@/lib/types/assessment";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS = {
  vocabulary: "词汇",
  grammar: "语法",
  reading: "阅读",
  hotel: "酒店专业",
  speaking: "对话口语",
} as const;

type AssessmentResultProps = {
  result: LevelTestResult;
  questions: AssessmentQuestion[];
  userAnswers: Map<string, string | boolean>;
  answerResults: Map<string, boolean>;
  onRetry: () => void;
  onBackToLevels: () => void;
  identityVerified?: boolean;
  pointsEarned?: number;
};

export function AssessmentResultView({
  result,
  questions,
  userAnswers,
  answerResults,
  onRetry,
  onBackToLevels,
  identityVerified,
  pointsEarned = 0,
}: AssessmentResultProps) {
  const info = CEFR_LEVEL_INFO[result.level];
  const wrongRecords = buildWrongAnswerRecords(
    questions,
    answerResults,
    userAnswers
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div
          className={cn(
            "mx-auto flex size-24 items-center justify-center rounded-2xl text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]",
            result.passed ? getLevelColor(result.level) : "bg-red"
          )}
        >
          {result.passed ? (
            <Trophy className="size-12" strokeWidth={2} />
          ) : (
            <XCircle className="size-12" strokeWidth={2} />
          )}
        </div>

        <p className="mt-8 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          {result.level} 级别测评结果
        </p>
        <h1 className="mt-2 font-display text-5xl text-foreground">
          {result.score} 分
        </h1>
        <p
          className={cn(
            "mt-2 text-lg font-extrabold",
            result.passed ? "text-primary" : "text-red"
          )}
        >
          {result.passed
            ? `通关成功！（≥ ${PASS_THRESHOLD} 分）`
            : `未通关（需 ≥ ${PASS_THRESHOLD} 分）`}
        </p>
        <p className="mt-2 font-bold text-muted-foreground">{info.title}</p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          答对 {result.correct} / {result.total} 题
        </p>
        {identityVerified && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-light/60 px-4 py-1.5 text-xs font-extrabold text-primary">
            <ShieldCheck className="size-3.5" />
            身份已验证
          </p>
        )}
      </div>

      {pointsEarned > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-accent/30 bg-accent/10 p-5 text-center">
          <Zap className="mx-auto size-8 text-accent" />
          <p className="mt-2 font-display text-3xl text-accent">+{pointsEarned}</p>
          <p className="text-sm font-bold text-muted-foreground">本次测评获得积分</p>
          <Link
            href="/leaderboard"
            className="mt-3 inline-block text-sm font-extrabold text-primary hover:underline"
          >
            查看排名 →
          </Link>
        </div>
      )}

      <div className="mt-10 card-elevated p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-foreground">得分进度</span>
          <span className="font-display text-3xl text-primary">
            {result.score}%
          </span>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              result.passed ? "bg-primary" : "bg-red"
            )}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <div
          className="relative mt-1 h-0"
          style={{ marginLeft: `${PASS_THRESHOLD}%` }}
        >
          <span className="absolute -translate-x-1/2 text-[10px] font-bold text-muted-foreground">
            通关线 {PASS_THRESHOLD}
          </span>
        </div>
      </div>

      <div className="mt-6 card-elevated p-5">
        <p className="text-sm font-extrabold text-foreground">各维度表现</p>
        <div className="mt-4 space-y-3">
          {(
            Object.entries(result.byCategory) as [
              keyof typeof result.byCategory,
              { correct: number; total: number },
            ][]
          )
            .filter(([, { total }]) => total > 0)
            .map(([cat, { correct, total }]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">{CATEGORY_LABELS[cat]}</span>
                  <span className="text-muted-foreground">
                    {correct}/{total} ·{" "}
                    {total > 0 ? Math.round((correct / total) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{
                      width: total > 0 ? `${(correct / total) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-6 rounded-2xl border-2 p-6",
          result.passed
            ? "border-primary/30 bg-primary-light/30"
            : "border-red/20 bg-red/5"
        )}
      >
        <p
          className={cn(
            "text-sm font-extrabold",
            result.passed ? "text-primary" : "text-red"
          )}
        >
          {result.passed ? "通关建议" : "复习建议"}
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
          {result.recommendation}
        </p>
      </div>

      {wrongRecords.length > 0 && (
        <div className="mt-6 card-elevated p-5">
          <p className="text-sm font-extrabold text-foreground">
            错题解析（{wrongRecords.length} 题）
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            对照正确答案与解析，巩固薄弱知识点
          </p>
          <ul className="mt-4 space-y-4">
            {wrongRecords.map(({ question, userAnswer }, index) => (
              <li
                key={question.id}
                className="rounded-xl border-2 border-red/20 bg-red/5 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red/15 px-2 py-0.5 text-[10px] font-extrabold text-red">
                    第 {questions.findIndex((q) => q.id === question.id) + 1} 题
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {questionTypeLabel(question)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold leading-relaxed text-foreground">
                  {getQuestionSummary(question)}
                </p>
                {question.type === "reading" && (
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-muted-foreground">
                    {question.passage}
                  </p>
                )}
                {question.type === "dialogue_oral" && (
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {question.guestLineChinese}
                  </p>
                )}
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-lg bg-white/80 px-3 py-2">
                    <p className="font-extrabold text-red">你的答案</p>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {formatUserAnswer(question, userAnswer)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary-light/50 px-3 py-2">
                    <p className="font-extrabold text-primary">正确答案</p>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {getCorrectAnswerText(question)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-border bg-white/90 px-3 py-2.5">
                  <p className="text-[10px] font-extrabold uppercase text-secondary">
                    解析
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">
                    {question.explanation}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wrongRecords.length === 0 && result.total > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary-light/30 p-5 text-center">
          <p className="text-sm font-extrabold text-primary">全部答对，太棒了！</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {result.passed ? (
          <Button size="lg" className="flex-1" asChild>
            <Link href={result.coursePath}>
              开始推荐课程
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={onRetry}>
            <RotateCcw className="size-4" />
            重新挑战 {result.level}
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={onBackToLevels}>
          <ArrowLeft className="size-4" />
          返回级别列表
        </Button>
      </div>
    </div>
  );
}
