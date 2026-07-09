"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Volume2 } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { Button } from "@/components/ui/button";
import { buildRussianPracticeQuestions } from "@/lib/course/russian-practice-generator";
import type { RussianScenario } from "@/lib/types/hotel-russian";
import { cn } from "@/lib/utils";

type RussianPracticeTabProps = {
  scenario: RussianScenario;
};

export function RussianPracticeTab({ scenario }: RussianPracticeTabProps) {
  const questions = useMemo(
    () => buildRussianPracticeQuestions(scenario),
    [scenario]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isCorrect = selected === question?.correctAnswer;

  if (questions.length === 0) {
    return (
      <div className="card-elevated p-8 text-center text-sm font-semibold text-muted-foreground">
        暂无练习题，请先学习单词与句子
      </div>
    );
  }

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="card-elevated p-8 text-center">
        <CheckCircle2 className="mx-auto size-16 text-primary" />
        <h3 className="mt-4 font-display text-2xl text-foreground">练习完成！</h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {scenario.title} · 正确 {correctCount}/{questions.length} · 得分 {score}%
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setShowFeedback(false);
            setCorrectCount(0);
            setFinished(false);
          }}
        >
          再练一遍
        </Button>
      </div>
    );
  }

  const handleCheck = () => {
    if (!selected) return;
    if (selected === question.correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="border-b-2 border-border bg-[#0039A6]/5 px-6 py-4">
        <p className="text-xs font-extrabold text-[#0039A6]">场景练习 · 看中文选俄语</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          第 {index + 1} / {questions.length} 题
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-[#0039A6] transition-all"
            style={{ width: `${((index + (showFeedback ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-extrabold leading-relaxed text-foreground">
            {question.prompt}
          </p>
          {question.audioText && (
            <PronunciationButton text={question.audioText} lang="ru-RU" />
          )}
        </div>

        <div className="mt-6 space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={showFeedback}
              onClick={() => setSelected(opt)}
              className={cn(
                "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-bold transition-all",
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
              {opt}
            </button>
          ))}
        </div>

        {showFeedback && (
          <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm font-semibold text-foreground">
            {isCorrect ? "回答正确！" : "回答错误。"} {question.explanation}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          {!showFeedback ? (
            <Button className="flex-1" disabled={!selected} onClick={handleCheck}>
              <Volume2 className="size-4" />
              确认答案
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleNext}>
              {index < questions.length - 1 ? "下一题" : "查看结果"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
