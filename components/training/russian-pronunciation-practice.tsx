"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Mic, MicOff, Volume2, XCircle } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import {
  evaluateRussianPronunciation,
  type RussianPronunciationEval,
  type RussianPronunciationTarget,
} from "@/lib/speech/russian-pronunciation-match";
import { cn } from "@/lib/utils";

type RussianPronunciationPracticeProps = {
  target: RussianPronunciationTarget;
  /** compact=图卡内嵌；full=练习页大块 */
  variant?: "compact" | "full";
  className?: string;
  onEvaluated?: (result: RussianPronunciationEval & { transcript: string }) => void;
};

export function RussianPronunciationPractice({
  target,
  variant = "full",
  className,
  onEvaluated,
}: RussianPronunciationPracticeProps) {
  const [result, setResult] = useState<
    (RussianPronunciationEval & { transcript: string }) | null
  >(null);

  const {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    displayTranscript,
  } = useSpeechRecognition({ lang: "ru-RU" });

  const handleEvaluate = useCallback(() => {
    stop();
    const text = (transcript.trim() || interimTranscript.trim());
    const evalResult = evaluateRussianPronunciation(text, target);
    const payload = { ...evalResult, transcript: text };
    setResult(payload);
    onEvaluated?.(payload);
  }, [stop, transcript, interimTranscript, target, onEvaluated]);

  const handleStart = () => {
    setResult(null);
    start();
  };

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed",
        isCompact
          ? "border-[#0039A6]/25 bg-[#0039A6]/5 p-3"
          : "border-purple/30 bg-purple/5 p-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "font-extrabold text-foreground",
            isCompact ? "text-xs" : "text-sm"
          )}
        >
          语音跟读评价
        </p>
        <PronunciationButton
          text={target.russian}
          lang="ru-RU"
          className="text-[#0039A6] hover:bg-[#0039A6]/10"
        />
      </div>

      {!isCompact && (
        <p className="mt-2 text-xs font-semibold text-muted-foreground">
          先听标准发音，再点击麦克风朗读：{target.russian}（{target.transliteration}）
        </p>
      )}

      {!supported && (
        <p className="mt-2 text-xs font-semibold text-accent">
          当前浏览器不支持语音识别，请使用 Chrome / Edge 并允许麦克风权限。
        </p>
      )}

      <div className={cn("flex flex-wrap gap-2", isCompact ? "mt-2" : "mt-4")}>
        <Button
          type="button"
          size={isCompact ? "sm" : "default"}
          variant={listening ? "outline" : "default"}
          className={cn(
            listening && "border-red text-red hover:bg-red/5",
            !isCompact && "flex-1"
          )}
          disabled={!supported}
          onClick={listening ? stop : handleStart}
        >
          {listening ? (
            <>
              <MicOff className="size-4" />
              停止录音
            </>
          ) : (
            <>
              <Mic className="size-4" />
              {isCompact ? "跟读" : "开始跟读"}
            </>
          )}
        </Button>

        {!listening && displayTranscript && !result && (
          <Button
            type="button"
            size={isCompact ? "sm" : "default"}
            variant="secondary"
            onClick={handleEvaluate}
          >
            <Volume2 className="size-4" />
            提交评价
          </Button>
        )}
      </div>

      {(displayTranscript || listening) && !result && (
        <div className={cn("rounded-lg bg-white p-3", isCompact ? "mt-2" : "mt-3")}>
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            识别结果
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {displayTranscript || "正在聆听…"}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-semibold text-red">{error}</p>
      )}

      {result && (
        <div
          className={cn(
            "mt-3 rounded-lg border-2 p-3",
            result.level === "retry"
              ? "border-red/30 bg-red/5"
              : "border-primary/30 bg-primary-light/40"
          )}
        >
          <div className="flex items-center gap-2">
            {result.passed ? (
              <CheckCircle2 className="size-5 shrink-0 text-primary" />
            ) : (
              <XCircle className="size-5 shrink-0 text-red" />
            )}
            <p className="text-sm font-extrabold text-foreground">
              匹配度 {result.score}%
              {result.level === "excellent" && " · 优秀"}
              {result.level === "good" && " · 合格"}
              {result.level === "retry" && " · 再练一次"}
            </p>
          </div>
          {result.transcript && (
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              识别：「{result.transcript}」
            </p>
          )}
          <p className="mt-2 text-xs font-semibold leading-relaxed text-foreground">
            {result.feedback}
          </p>
          <button
            type="button"
            className="mt-2 text-xs font-extrabold text-[#0039A6] hover:underline"
            onClick={() => {
              setResult(null);
              start();
            }}
          >
            再读一遍
          </button>
        </div>
      )}
    </div>
  );
}
