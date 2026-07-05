"use client";

import { useState } from "react";
import { CheckCircle2, Mic, MicOff, User, XCircle } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { CourseImage } from "@/components/courses/course-image";
import { Button } from "@/components/ui/button";
import { getOralImage } from "@/lib/data/course-images";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { matchSpeechTranscript } from "@/lib/assessment/speech-match";
import type { DialogueOralQuestion } from "@/lib/types/assessment";
import { cn } from "@/lib/utils";

type DialogueOralQuestionCardProps = {
  question: DialogueOralQuestion;
  questionIndex: number;
  total: number;
  showFeedback: boolean;
  isCorrect: boolean;
  onSubmit: (correct: boolean) => void;
  onContinue: () => void;
};

function OptionButton({
  label,
  selected,
  correct,
  showFeedback,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  correct: boolean;
  showFeedback: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border-2 px-5 py-4 text-left text-sm font-bold transition-all",
        !showFeedback && selected && "border-primary bg-primary-light/50",
        !showFeedback && !selected && "border-border bg-white hover:border-primary/40 hover:bg-muted",
        showFeedback && correct && "border-primary bg-primary-light/60",
        showFeedback && selected && !correct && "border-red bg-red/10 text-red",
        showFeedback && !selected && !correct && "opacity-50"
      )}
    >
      <span className="flex items-center gap-3">
        {showFeedback && correct && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
        {showFeedback && selected && !correct && <XCircle className="size-5 shrink-0 text-red" />}
        {label}
      </span>
    </button>
  );
}

export function DialogueOralQuestionCard({
  question,
  questionIndex,
  total,
  showFeedback,
  isCorrect,
  onSubmit,
  onContinue,
}: DialogueOralQuestionCardProps) {
  const [mode, setMode] = useState<"speak" | "choice">("speak");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [speechResult, setSpeechResult] = useState<{
    passed: boolean;
    score: number;
    transcript: string;
  } | null>(null);

  const {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    displayTranscript,
  } = useSpeechRecognition({ lang: "en-US" });

  const progress = ((questionIndex + 1) / total) * 100;
  const imageSrc = question.image ?? getOralImage(question.id);

  const handleCheckSpeech = () => {
    stop();
    const text = transcript.trim() || interimTranscript.trim();
    if (!text) return;

    const result = matchSpeechTranscript(
      text,
      question.speakKeywords,
      question.modelAnswer
    );
    setSpeechResult({ ...result, transcript: text });
    onSubmit(result.passed);
  };

  const handleSelectOption = (option: string) => {
    if (showFeedback) return;
    setSelectedOption(option);
    onSubmit(option === question.options[question.correctIndex]);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
          <span>
            第 {questionIndex + 1} / {total} 题
          </span>
          <span className="rounded-full bg-purple/15 px-3 py-0.5 text-xs font-extrabold text-purple">
            {question.level} · 对话口语
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-purple transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        {imageSrc && (
          <CourseImage
            src={imageSrc}
            alt={question.scenario}
            className="aspect-[21/9] w-full rounded-none border-0 border-b-2"
          />
        )}
        <div className="p-6 md:p-8">
        <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-extrabold text-accent">
          {question.scenario}
        </span>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          {question.prompt}
        </p>

        {/* Guest dialogue bubble */}
        <div className="mt-6 flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
            <User className="size-5" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm border-2 border-secondary/20 bg-secondary/5 p-4">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-base font-bold text-foreground">
                {question.guestLine}
              </p>
              <PronunciationButton text={question.guestLine} />
            </div>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {question.guestLineChinese}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => !showFeedback && setMode("speak")}
            disabled={showFeedback}
            className={cn(
              "flex-1 rounded-xl border-2 py-2.5 text-xs font-extrabold uppercase transition-all",
              mode === "speak"
                ? "border-purple bg-purple/10 text-purple"
                : "border-border text-muted-foreground"
            )}
          >
            口语作答
          </button>
          <button
            type="button"
            onClick={() => !showFeedback && setMode("choice")}
            disabled={showFeedback}
            className={cn(
              "flex-1 rounded-xl border-2 py-2.5 text-xs font-extrabold uppercase transition-all",
              mode === "choice"
                ? "border-primary bg-primary-light/50 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            选择回应
          </button>
        </div>

        {mode === "speak" ? (
          <div className="mt-6">
            {!supported && (
              <p className="mb-4 rounded-xl bg-accent/10 p-3 text-sm font-semibold text-accent">
                当前浏览器不支持语音识别，请切换到「选择回应」模式。
              </p>
            )}

            <div className="rounded-2xl border-2 border-dashed border-purple/30 bg-purple/5 p-6 text-center">
              <p className="text-sm font-bold text-foreground">
                作为前台，请用英语口头回应客人
              </p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                参考：{question.modelAnswer}
              </p>

              <Button
                type="button"
                variant={listening ? "outline" : "default"}
                size="lg"
                className={cn(
                  "mt-6",
                  listening && "border-red text-red hover:bg-red/5"
                )}
                disabled={showFeedback || !supported}
                onClick={listening ? stop : start}
              >
                {listening ? (
                  <>
                    <MicOff className="size-5" />
                    停止录音
                  </>
                ) : (
                  <>
                    <Mic className="size-5" />
                    开始录音
                  </>
                )}
              </Button>

              {(displayTranscript || listening) && (
                <div className="mt-4 rounded-xl bg-white p-4 text-left">
                  <p className="text-xs font-extrabold text-muted-foreground">
                    识别结果
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {displayTranscript || "正在聆听..."}
                  </p>
                </div>
              )}

              {error && (
                <p className="mt-3 text-sm font-semibold text-red">{error}</p>
              )}

              {!showFeedback && displayTranscript && !listening && (
                <Button className="mt-4 w-full" onClick={handleCheckSpeech}>
                  提交口语回答
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {question.options.map((option, i) => (
              <OptionButton
                key={option}
                label={option}
                selected={selectedOption === option}
                correct={i === question.correctIndex}
                showFeedback={showFeedback}
                disabled={showFeedback}
                onClick={() => handleSelectOption(option)}
              />
            ))}
          </div>
        )}

        {showFeedback && (
          <div
            className={cn(
              "mt-6 rounded-2xl border-2 p-4",
              isCorrect
                ? "border-primary/30 bg-primary-light/40"
                : "border-red/30 bg-red/5"
            )}
          >
            <p className="font-extrabold text-foreground">
              {isCorrect ? "回答正确！" : "回答错误"}
            </p>
            {speechResult && (
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                口语匹配度：{speechResult.score}% · 识别：「{speechResult.transcript}」
              </p>
            )}
            <div className="mt-3 rounded-xl bg-white/80 p-3">
              <p className="text-xs font-extrabold text-primary">标准回应</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {question.modelAnswer}
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              {question.explanation}
            </p>
            <Button className="mt-4 w-full" onClick={onContinue}>
              {questionIndex + 1 < total ? "下一题" : "查看结果"}
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
