"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Film,
  Play,
  Square,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SpeechSpeedControl } from "@/components/training/speech-speed-control";
import { TrainingSlideVisual } from "@/components/training/training-slide-illustration";
import { illustrationForSlideIndex } from "@/lib/types/training-slide-illustration";
import { SLIDE_SECTION_LABELS } from "@/lib/hr/slide-structure";
import {
  completeTrainingModule,
  getModuleScore,
  isModuleCompleted,
} from "@/lib/hr/training-progress-storage";
import { resolveTrainingVideoUrl } from "@/lib/hr/training-video-storage";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import { detectSpeechLang } from "@/lib/speech/voice-selection";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";

type HrTrainingLessonProps = {
  module: HrTrainingModule;
  onBack: () => void;
  onComplete: () => void;
  /** 管理员预览：不写入学习进度 */
  preview?: boolean;
};

type Step = "video" | "quiz" | "done";

export function HrTrainingLesson({
  module,
  onBack,
  onComplete,
  preview = false,
}: HrTrainingLessonProps) {
  const [step, setStep] = useState<Step>("video");
  const [slideIndex, setSlideIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { speakNatural, stop, speaking, supported, voicesReady, speed, setSpeechSpeed } =
    useSpeech();

  const slide = module.slides[slideIndex];
  const question = module.questions[qIndex];
  const alreadyDone = isModuleCompleted(module.id);
  const isVideoCourse = module.deliveryType === "video";

  useEffect(() => {
    if (!isVideoCourse || !module.videoUrl) {
      setVideoSrc(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    void resolveTrainingVideoUrl(module.videoUrl).then((url) => {
      if (!active) return;
      objectUrl = url;
      setVideoSrc(url);
    });

    return () => {
      active = false;
      if (objectUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isVideoCourse, module.videoUrl]);

  useEffect(() => {
    if (step !== "video" || !slide || !autoPlay || !voicesReady || isVideoCourse) return;
    speakNatural(slide.narration, detectSpeechLang(slide.narration));
    return () => stop();
  }, [
    step,
    slideIndex,
    slide,
    autoPlay,
    speakNatural,
    stop,
    voicesReady,
    isVideoCourse,
    speed,
  ]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, videoSrc]);

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
      if (!preview) {
        const result = completeTrainingModule(module.id, score, {
          title: module.title,
          phase: module.phase,
          ask: module.ask,
        });
        if (!result.ok) return;
      }
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
        <h2 className="mt-4 font-display text-2xl text-foreground">
          {preview ? "预览完成" : "课程完成！"}
        </h2>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {module.title} · 测验得分 {scorePercent}%
          {preview && " · 预览模式未保存进度"}
        </p>
        <Button className="mt-6" onClick={onComplete}>
          {preview ? "关闭预览" : "返回 Grow in Hotel"}
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
        {isVideoCourse && videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            playsInline
            className="absolute inset-0 size-full bg-black object-contain"
          />
        ) : (
          <TrainingSlideVisual
            illustration={slide.illustration ?? illustrationForSlideIndex(slideIndex)}
            slideLabel={
              slide.section
                ? `${SLIDE_SECTION_LABELS[slide.section]} · 第 ${slideIndex + 1} / ${module.slides.length} 节`
                : `讲解课 · 第 ${slideIndex + 1} / ${module.slides.length} 节`
            }
            title={slide.title}
            bullets={slide.bullets}
            section={slide.section}
          />
        )}
        {isVideoCourse && !videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-sm font-bold text-white">视频加载中…</p>
          </div>
        )}
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
            {preview ? "关闭预览" : "返回列表"}
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isVideoCourse ? (
              <>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-accent">
                  <Film className="size-3" />
                  视频培训
                </span>
                <SpeechSpeedControl value={speed} onChange={setSpeechSpeed} compact />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAutoPlay((v) => !v)}
                  className="text-[10px] font-extrabold text-muted-foreground"
                >
                  {autoPlay ? "自动讲解开" : "自动讲解关"}
                </button>
                <SpeechSpeedControl value={speed} onChange={setSpeechSpeed} compact />
                {supported && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      speaking
                        ? stop()
                        : speakNatural(slide.narration, detectSpeechLang(slide.narration))
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
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold leading-relaxed text-muted-foreground">
          {isVideoCourse
            ? "请完整观看上方视频，然后点击下方进入课后测验。"
            : slide.narration}
        </p>

        <div className="mt-6 flex gap-2">
          {!isVideoCourse && (
            <Button
              variant="outline"
              disabled={slideIndex === 0}
              onClick={goPrevSlide}
            >
              <ChevronLeft className="size-4" />
              上一节
            </Button>
          )}
          <Button className="flex-1" onClick={goNextSlide}>
            {isVideoCourse || slideIndex >= module.slides.length - 1 ? (
              <>
                <Play className="size-4" />
                开始测验
              </>
            ) : (
              <>
                下一节
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>

        {alreadyDone && !preview && (
          <p className="mt-3 text-center text-xs font-bold text-primary">
            已完成 · 上次得分 {getModuleScore(module.id) ?? "—"}%
          </p>
        )}
      </div>
    </div>
  );
}
