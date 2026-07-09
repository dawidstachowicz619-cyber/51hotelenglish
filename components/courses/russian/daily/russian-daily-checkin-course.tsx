"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";

import { RussianPronunciationPractice } from "@/components/training/russian-pronunciation-practice";
import { Button } from "@/components/ui/button";
import { buildDailyCheckinQuestions, getRecentDates } from "@/lib/course/russian-daily-pack";
import { completeRussianDailyCheckIn } from "@/lib/course/russian-daily-checkin-storage";
import { useRussianDailyCheckIn } from "@/hooks/use-russian-daily-checkin";
import { cn } from "@/lib/utils";

import { RussianDailyVocabCard } from "./russian-daily-vocab-card";

type Step = "intro" | "learn" | "quiz" | "done";

export function RussianDailyCheckInCourse() {
  const { record, today, todayPack, todayComplete, todaySession, refresh } =
    useRussianDailyCheckIn();
  const [step, setStep] = useState<Step>(todayComplete ? "done" : "intro");
  const [learnIndex, setLearnIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [streakBonus, setStreakBonus] = useState(0);

  const questions = useMemo(
    () => (todayPack ? buildDailyCheckinQuestions(todayPack.items) : []),
    [todayPack]
  );

  const recentDates = useMemo(() => getRecentDates(7, today), [today]);

  if (!todayPack || !record) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-muted-foreground">
        加载每日打卡…
      </div>
    );
  }

  const question = questions[quizIndex];
  const score =
    todaySession?.score ??
    (questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0);

  const finishQuiz = () => {
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const result = completeRussianDailyCheckIn(
      finalScore,
      todayPack.items.map((i) => i.id),
      todayPack.source,
      today
    );
    setEarnedPoints(result.earnedPoints);
    setStreakBonus(result.streakBonus);
    refresh();
    setStep("done");
  };

  return (
    <div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/courses/russian">
          <ArrowLeft className="size-4" />
          返回酒店俄语
        </Link>
      </Button>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0039A6] to-[#D52B1E] text-white shadow-[0_4px_0_0_rgba(213,43,30,0.35)]">
            <CalendarCheck className="size-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">Daily Check-in · 每日打卡</p>
            <h1 className="font-display text-3xl text-foreground md:text-4xl">俄语每日打卡</h1>
            <p className="mt-2 max-w-xl text-sm font-semibold text-muted-foreground">
              每天 5 个词汇 · 图卡学习 + 小测验 · 连续打卡赢积分
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#D52B1E]/25 bg-[#FFF5F5] px-4 py-3">
          <Flame className="size-8 text-[#D52B1E]" />
          <div>
            <p className="text-2xl font-display leading-none text-[#B91C1C]">
              {record.currentStreak}
            </p>
            <p className="text-xs font-bold text-muted-foreground">连续天数</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {recentDates.map((date) => {
          const done = record.completedDates.includes(date);
          const isToday = date === today;
          return (
            <div
              key={date}
              className={cn(
                "flex size-10 flex-col items-center justify-center rounded-xl border-2 text-[10px] font-extrabold",
                done && "border-primary bg-primary-light/40 text-primary",
                !done && isToday && "border-[#0039A6] bg-[#0039A6]/10 text-[#0039A6]",
                !done && !isToday && "border-border bg-white text-muted-foreground"
              )}
            >
              <span>{date.slice(8)}</span>
              {done && <CheckCircle2 className="mt-0.5 size-3" />}
            </div>
          );
        })}
      </div>

      {step === "intro" && (
        <div className="mt-8 card-elevated overflow-hidden">
          <div className="border-b-2 border-border bg-gradient-to-r from-[#0039A6]/10 to-[#D52B1E]/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#D52B1E]" />
              <p className="text-sm font-extrabold text-foreground">{todayPack.title}</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{todayPack.subtitle}</p>
          </div>
          <div className="p-6 md:p-8">
            {todayComplete ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto size-14 text-primary" />
                <p className="mt-4 text-lg font-bold text-foreground">今日已打卡完成！</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  得分 {todaySession?.score ?? score}% · 明天再来继续打卡
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setStep("learn")}>
                  复习今日词汇
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">今日词汇预览</p>
                <ul className="mt-4 space-y-2">
                  {todayPack.items.map((item, i) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border-2 border-border bg-muted/30 px-4 py-3"
                    >
                      <span className="font-bold text-foreground">
                        {i + 1}. {item.chinese}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {item.russian}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-[#0039A6] hover:bg-[#002d85]"
                    onClick={() => {
                      setLearnIndex(0);
                      setStep("learn");
                    }}
                  >
                    开始今日打卡
                  </Button>
                  <p className="self-center text-xs font-semibold text-muted-foreground">
                    最长连续 {record.longestStreak} 天
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {step === "learn" && (
        <div className="mt-8">
          <RussianDailyVocabCard
            item={todayPack.items[learnIndex]}
            index={learnIndex}
            total={todayPack.items.length}
          />
          <div className="mt-6 flex gap-3">
            {learnIndex > 0 && (
              <Button variant="outline" onClick={() => setLearnIndex((i) => i - 1)}>
                上一个
              </Button>
            )}
            <Button
              className="flex-1 bg-[#0039A6] hover:bg-[#002d85]"
              onClick={() => {
                if (learnIndex < todayPack.items.length - 1) {
                  setLearnIndex((i) => i + 1);
                } else {
                  setQuizIndex(0);
                  setSelected(null);
                  setShowFeedback(false);
                  setCorrectCount(0);
                  setStep("quiz");
                }
              }}
            >
              {learnIndex < todayPack.items.length - 1 ? "下一个" : "进入小测验"}
            </Button>
          </div>
        </div>
      )}

      {step === "quiz" && question && (
        <div className="mt-8 card-elevated overflow-hidden">
          <div className="border-b-2 border-border bg-[#0039A6]/5 px-6 py-4">
            <p className="text-xs font-extrabold text-[#0039A6]">每日小测验</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              第 {quizIndex + 1} / {questions.length} 题
            </p>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-base font-extrabold text-foreground">{question.prompt}</p>
            <div className="mt-4 space-y-2">
              {question.options.map((opt) => {
                const optItem = todayPack.items.find((i) => i.russian === opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={showFeedback}
                    onClick={() => setSelected(opt)}
                    className={cn(
                      "w-full rounded-xl border-2 px-4 py-3 text-left transition-all",
                      selected === opt && !showFeedback && "border-[#0039A6] bg-[#0039A6]/10",
                      showFeedback &&
                        opt === question.correctAnswer &&
                        "border-primary bg-primary-light/50",
                      showFeedback &&
                        selected === opt &&
                        opt !== question.correctAnswer &&
                        "border-red bg-red/10"
                    )}
                  >
                    <span className="text-sm font-bold">{opt}</span>
                    {optItem && (
                      <span className="mt-0.5 block text-xs italic text-muted-foreground">
                        {optItem.transliteration}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-muted px-4 py-3 text-sm font-semibold">
                  {selected === question.correctAnswer ? "回答正确！" : "回答错误。"}{" "}
                  {question.explanation}
                </div>
                {todayPack.items[quizIndex] && (
                  <RussianPronunciationPractice
                    variant="full"
                    target={{
                      russian: todayPack.items[quizIndex].russian,
                      transliteration: todayPack.items[quizIndex].transliteration,
                      chinese: todayPack.items[quizIndex].chinese,
                    }}
                  />
                )}
              </div>
            )}

            <div className="mt-6 flex gap-2">
              {!showFeedback ? (
                <Button
                  className="flex-1"
                  disabled={!selected}
                  onClick={() => {
                    if (selected === question.correctAnswer) setCorrectCount((c) => c + 1);
                    setShowFeedback(true);
                  }}
                >
                  确认答案
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (quizIndex < questions.length - 1) {
                      setQuizIndex((i) => i + 1);
                      setSelected(null);
                      setShowFeedback(false);
                    } else {
                      finishQuiz();
                    }
                  }}
                >
                  {quizIndex < questions.length - 1 ? "下一题" : "完成打卡"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="mt-8 card-elevated p-8 text-center">
          <Trophy className="mx-auto size-16 text-[#D52B1E]" />
          <h2 className="mt-4 font-display text-2xl text-foreground">
            {todayComplete && earnedPoints === 0 ? "今日打卡已完成" : "打卡成功！"}
          </h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            得分 {score}% · 连续 {record.currentStreak} 天
            {earnedPoints > 0 && ` · +${earnedPoints} 积分`}
            {streakBonus > 0 && `（含连续奖励 +${streakBonus}）`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setStep("learn")}>
              复习今日词汇
            </Button>
            <Button asChild className="bg-[#0039A6] hover:bg-[#002d85]">
              <Link href="/courses/russian">返回课程主页</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
