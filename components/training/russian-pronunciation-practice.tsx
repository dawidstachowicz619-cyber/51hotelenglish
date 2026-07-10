"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mic, MicOff, Volume2, XCircle } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { Button } from "@/components/ui/button";
import { useRussianVoicePractice } from "@/hooks/use-russian-voice-practice";
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
    mode,
    supported,
    listening,
    transcribing,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    displayTranscript,
    pendingSelfCheck,
    confirmSelfCheck,
  } = useRussianVoicePractice({ lang: "ru-RU" });

  const applyEval = useCallback(
    (evalResult: RussianPronunciationEval, text: string) => {
      const payload = { ...evalResult, transcript: text };
      setResult(payload);
      onEvaluated?.(payload);
    },
    [onEvaluated]
  );

  const handleEvaluate = useCallback(() => {
    stop();
    const text = transcript.trim() || interimTranscript.trim();
    applyEval(evaluateRussianPronunciation(text, target), text);
  }, [stop, transcript, interimTranscript, target, applyEval]);

  useEffect(() => {
    if (mode !== "recorder" || !transcript || pendingSelfCheck || result) return;
    applyEval(evaluateRussianPronunciation(transcript, target), transcript);
  }, [mode, transcript, pendingSelfCheck, result, target, applyEval]);

  const handleStart = () => {
    setResult(null);
    start();
  };

  const handleSelfCheck = (passed: boolean) => {
    confirmSelfCheck(passed);
    if (passed) {
      applyEval(
        {
          passed: true,
          score: 80,
          level: "good",
          feedback: `录音完成！对照转写「${target.transliteration}」自评通过，继续保持。`,
        },
        target.transliteration
      );
    }
  };

  const isCompact = variant === "compact";
  const statusText = listening
    ? mode === "recorder"
      ? "正在录音，读完后点停止"
      : "正在聆听…"
    : transcribing
      ? "正在识别语音…"
      : displayTranscript;

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
          先听标准发音，再点麦克风朗读：{target.russian}（{target.transliteration}）
        </p>
      )}

      {mode === "recorder" && supported && (
        <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
          手机录音模式：点「跟读」开始，读完点「停止」
        </p>
      )}

      {!supported && (
        <p className="mt-2 text-xs font-semibold text-accent">
          当前浏览器不支持录音。请先点喇叭听发音，用下方选择题练习即可。
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
          disabled={!supported || transcribing}
          onClick={listening ? stop : handleStart}
        >
          {transcribing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              识别中
            </>
          ) : listening ? (
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

        {mode === "webspeech" && !listening && displayTranscript && !result && (
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

      {(statusText || listening || transcribing) && !result && !pendingSelfCheck && (
        <div className={cn("rounded-lg bg-white p-3", isCompact ? "mt-2" : "mt-3")}>
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            {listening ? "录音状态" : transcribing ? "识别中" : "识别结果"}
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">{statusText}</p>
        </div>
      )}

      {pendingSelfCheck && !result && (
        <div className={cn("rounded-lg border-2 border-[#0039A6]/20 bg-white p-3", isCompact ? "mt-2" : "mt-3")}>
          <p className="text-xs font-extrabold text-foreground">录音完成！请对照转写自评</p>
          <p className="mt-1 font-display text-base text-[#0039A6]">{target.russian}</p>
          <p className="text-xs italic text-muted-foreground">{target.transliteration}</p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1 bg-primary"
              onClick={() => handleSelfCheck(true)}
            >
              <CheckCircle2 className="size-4" />
              我读对了
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleSelfCheck(false)}
            >
              再录一次
            </Button>
          </div>
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
          {result.transcript && result.transcript !== target.transliteration && (
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
