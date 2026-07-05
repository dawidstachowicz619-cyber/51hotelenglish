"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  completeTrainingModule,
  getModuleScore,
  isModuleCompleted,
} from "@/lib/hr/training-progress-storage";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";

type HrTrainingLessonProps = {
  module: HrTrainingModule;
  onBack: () => void;
  onComplete: () => void;
};

type Step = "video" | "quiz" | "done";

export function HrTrainingLesson({ module, onBack, onComplete }: HrTrainingLessonProps) {
  const [step, setStep] = useState<Step>("video");
  const [slideIndex, setSlideIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { speak, stop, speaking, supported } = useSpeech();

  const slide = module.slides[slideIndex];
  const question = module.questions[qIndex];
  const alreadyDone = isModuleCompleted(module.id);

  useEffect(() => {
    if (step !== "video" || !slide || !autoPlay) return;
    speak(slide.narration, /[\u4e00-\u9fff]/.test(slide.narration) ? "zh-CN" : "en-US");
    return () => stop();
  }, [step, slideIndex, slide, autoPlay, speak, stop, step]);

  const goNextSlide = () => {
    stop();
    if (slideIndex < module.slides.length - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      setStep("quiz");
      setQIndex(0);
    }
  };

  const goPrevSlide = () => {
    stop();
    setSlideIndex((i) => Math.max(0, i - 1));
  };

  const handleAnswer = () => {
    if (!question || !selected) return;
    const ok = selected === question.correctAnswer;
    if (ok) setCorrectCount((c) => c + 1);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (qIndex < module.questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      const score = Math.round((correctCount / module.questions.length) * 100);
      completeTrainingModule(module.id, score, {
        title: module.title,
        phase: module.phase,
        ask: module.ask,
      });
      setStep("done");
    }
  };

  const scorePercent =
    module.questions.length > 0
      ? Math.round((correctCount / module.questions.length) * 100)
      : 100;

  if (step === "done") {
    return (
      <div className="card-elevated p-8 text-center">
        <CheckCircle2 className="mx-auto size-16 text-primary" />
        <h2 className="mt-4 font-display text-2xl text-foreground">课程完成！</h2>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {module.title} · 测验得分 {scorePercent}%
        </p>
        <Button className="mt-6" onClick={onComplete}>
          返回 Grow in Hotel
        </Button>
      </div>
    );
  }

  if (step === "quiz" && question) {
    const isCorrect = selected === question.correctAnswer;
    return (
      <div className="card-elevated overflow-hidden">
        <div className="border-b-2 border-border bg-muted/40 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              stop();
              setStep("video");
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回视频
          </button>
          <h2 className="mt-2 font-display text-lg text-foreground">课后测验</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            第 {qIndex + 1} / {module.questions.length} 题
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: `${((qIndex + (showFeedback ? 1 : 0)) / module.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm font-extrabold text-foreground">{question.prompt}</p>
          <div className="mt-4 space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={showFeedback}
                onClick={() => setSelected(opt)}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-bold transition-all",
                  selected === opt && !showFeedback && "border-primary bg-primary-light/40",
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
              <Button className="flex-1" disabled={!selected} onClick={handleAnswer}>
                确认答案
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleNextQuestion}>
                {qIndex < module.questions.length - 1 ? "下一题" : "完成课程"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!slide) return null;

  const videoProgress = ((slideIndex + 1) / module.slides.length) * 100;

  return (
    <div className="card-elevated overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-secondary/20 via-secondary/10 to-primary-light/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-wide text-secondary">
            视频课 · 第 {slideIndex + 1} / {module.slides.length} 节
          </p>
          <h2 className="mt-3 font-display text-xl text-foreground md:text-2xl">
            {slide.title}
          </h2>
          {slide.bullets.length > 0 && (
            <ul className="mt-4 max-w-md space-y-1 text-left text-sm font-semibold text-foreground">
              {slide.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-black/10">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${videoProgress}%` }}
          />
        </div>
      </div>

      <div className="border-t-2 border-border p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回列表
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className="text-[10px] font-extrabold text-muted-foreground"
            >
              {autoPlay ? "自动讲解开" : "自动讲解关"}
            </button>
            {supported && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  speaking
                    ? stop()
                    : speak(
                        slide.narration,
                        /[\u4e00-\u9fff]/.test(slide.narration) ? "zh-CN" : "en-US"
                      )
                }
              >
                {speaking ? (
                  <Square className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
                {speaking ? "停止" : "播放讲解"}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground">
          {slide.narration}
        </p>

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            disabled={slideIndex === 0}
            onClick={goPrevSlide}
          >
            <ChevronLeft className="size-4" />
            上一节
          </Button>
          <Button className="flex-1" onClick={goNextSlide}>
            {slideIndex < module.slides.length - 1 ? (
              <>
                下一节
                <ChevronRight className="size-4" />
              </>
            ) : (
              <>
                <Play className="size-4" />
                开始测验
              </>
            )}
          </Button>
        </div>

        {alreadyDone && (
          <p className="mt-3 text-center text-xs font-bold text-primary">
            已完成 · 上次得分 {getModuleScore(module.id) ?? "—"}%
          </p>
        )}
      </div>
    </div>
  );
}
