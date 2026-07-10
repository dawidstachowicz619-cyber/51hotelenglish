"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { RussianPronunciationPractice } from "@/components/training/russian-pronunciation-practice";
import { Button } from "@/components/ui/button";
import {
  buildDiningItemPracticeQuestions,
  pickRandomDiningItemSubset,
} from "@/lib/course/dining-item-practice";
import { logRussianItemsPracticeSession } from "@/lib/course/russian-items-progress-storage";
import {
  HOTEL_RUSSIAN_DINING_ITEMS,
  getDiningItemById,
} from "@/lib/data/hotel-russian-dining-items";
import { DINING_ITEM_CATEGORY_LABELS } from "@/lib/types/hotel-russian-dining-item";
import { cn } from "@/lib/utils";

import { DiningItemImage } from "./dining-item-image";

type PracticeMode = "text" | "image";

const BATCH_SIZE = 20;

export function DiningItemsPracticeTab() {
  const [mode, setMode] = useState<PracticeMode>("image");
  const [seed, setSeed] = useState(1);

  const subset = useMemo(
    () => pickRandomDiningItemSubset(HOTEL_RUSSIAN_DINING_ITEMS, BATCH_SIZE, seed),
    [seed]
  );

  const questions = useMemo(
    () => buildDiningItemPracticeQuestions(subset, mode),
    [subset, mode]
  );

  const itemByRussian = useMemo(() => {
    const map = new Map<string, (typeof subset)[number]>();
    for (const item of HOTEL_RUSSIAN_DINING_ITEMS) {
      map.set(item.russian, item);
    }
    return map;
  }, []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const currentItemId = question?.id.match(/^di-q-(di-\d+)-/)?.[1];
  const currentItem = currentItemId ? getDiningItemById(currentItemId) : undefined;

  const restart = (nextMode?: PracticeMode) => {
    if (nextMode) setMode(nextMode);
    setSeed((s) => s + 1);
    setIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setFinished(false);
  };

  const finishSession = () => {
    const score = Math.round((correctCount / questions.length) * 100);
    const result = logRussianItemsPracticeSession("dining", {
      score,
      correctCount,
      totalCount: questions.length,
      mode: mode === "image" ? "看图选词" : "看中文选词",
      itemIds: subset.map((item) => item.id),
    });
    if (!result.ok) return;
    setFinished(true);
  };

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="card-elevated p-8 text-center">
        <CheckCircle2 className="mx-auto size-16 text-primary" />
        <h3 className="mt-4 font-display text-2xl text-foreground">练习完成！</h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {mode === "image" ? "看图 + 文字选词" : "看中文选词"} · 正确 {correctCount}/
          {questions.length} · 得分 {score}%
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => restart()}>再练一组</Button>
          <Button variant="outline" onClick={() => restart(mode === "image" ? "text" : "image")}>
            切换{mode === "image" ? "看中文选词" : "看图 + 文字选词"}
          </Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = selected === question.correctAnswer;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["image", "看图 + 文字选俄语"],
            ["text", "看中文选俄语"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => restart(key)}
            className={cn(
              "rounded-full border-2 px-4 py-2 text-xs font-extrabold transition-all",
              mode === key
                ? "border-[#D52B1E] bg-[#D52B1E] text-white"
                : "border-border bg-white text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
        <span className="self-center text-xs font-semibold text-muted-foreground">
          每轮 {BATCH_SIZE} 题 · 从 100 词中随机
        </span>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="border-b-2 border-border bg-[#D52B1E]/5 px-6 py-4">
          <p className="text-xs font-extrabold text-[#D52B1E]">
            {mode === "image" ? "看图 + 文字选词" : "看中文选词练习"}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            第 {index + 1} / {questions.length} 题
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-[#D52B1E] transition-all"
              style={{
                width: `${((index + (showFeedback ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-6 md:p-8">
          {currentItem && mode === "image" && (
            <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl border-2 border-border bg-white">
              <DiningItemImage item={currentItem} className="aspect-square max-h-56" />
              <div className="border-t-2 border-border bg-[#D52B1E]/5 px-4 py-4 text-center">
                <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#D52B1E]">
                  {DINING_ITEM_CATEGORY_LABELS[currentItem.category].zh}
                </span>
                <p className="mt-2 text-xl font-bold text-foreground">{currentItem.chinese}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {currentItem.english}
                </p>
              </div>
            </div>
          )}

          {currentItem && mode === "text" && (
            <div className="mb-6 rounded-2xl border-2 border-[#D52B1E]/15 bg-[#D52B1E]/5 px-5 py-4 text-center">
              <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#D52B1E]">
                {DINING_ITEM_CATEGORY_LABELS[currentItem.category].zh}
              </span>
              <p className="mt-2 text-2xl font-bold text-foreground">{currentItem.chinese}</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {currentItem.english}
              </p>
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-extrabold leading-relaxed text-foreground">
              {question.prompt}
            </p>
            {!showFeedback && question.audioText && (
              <PronunciationButton text={question.audioText} lang="ru-RU" />
            )}
          </div>

          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            选择正确的俄语；选项下方为转写，便于跟读
          </p>

          <div className="mt-4 space-y-2">
            {question.options.map((opt) => {
              const optItem = itemByRussian.get(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={showFeedback}
                  onClick={() => setSelected(opt)}
                  className={cn(
                    "w-full rounded-xl border-2 px-4 py-3 text-left transition-all",
                    selected === opt && !showFeedback && "border-[#D52B1E] bg-[#D52B1E]/10",
                    showFeedback &&
                      opt === question.correctAnswer &&
                      "border-primary bg-primary-light/50",
                    showFeedback &&
                      selected === opt &&
                      opt !== question.correctAnswer &&
                      "border-red bg-red/10"
                  )}
                >
                  <span className="text-sm font-bold text-foreground">{opt}</span>
                  {optItem && (
                    <span className="mt-0.5 block text-xs font-semibold italic text-muted-foreground">
                      {optItem.transliteration}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showFeedback && currentItem && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                <p>
                  {isCorrect ? "回答正确！" : "回答错误。"}{" "}
                  {question.explanation}
                </p>
                <p className="mt-2 border-t border-border/60 pt-2 text-xs leading-relaxed text-muted-foreground">
                  中文：{currentItem.chinese} · English：{currentItem.english} · 俄语：{" "}
                  {currentItem.russian}（{currentItem.transliteration}）
                </p>
              </div>
              <RussianPronunciationPractice
                variant="full"
                target={{
                  russian: currentItem.russian,
                  transliteration: currentItem.transliteration,
                  chinese: currentItem.chinese,
                }}
              />
            </div>
          )}

          <div className="mt-6 flex gap-2">
            {!showFeedback ? (
              <Button className="flex-1" disabled={!selected} onClick={() => {
                if (selected === question.correctAnswer) setCorrectCount((c) => c + 1);
                setShowFeedback(true);
              }}>
                确认答案
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => {
                  if (index < questions.length - 1) {
                    setIndex((i) => i + 1);
                    setSelected(null);
                    setShowFeedback(false);
                  } else {
                    finishSession();
                  }
                }}
              >
                {index < questions.length - 1 ? "下一题" : "查看结果"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
