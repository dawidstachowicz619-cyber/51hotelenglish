"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { CourseImage } from "@/components/courses/course-image";
import { Button } from "@/components/ui/button";
import { getAssessmentVocabImage } from "@/lib/data/course-images";
import type { AssessmentQuestion } from "@/lib/types/assessment";
import { QUESTION_TYPE_LABELS } from "@/lib/types/assessment";
import { cn } from "@/lib/utils";

type QuestionCardProps = {
  question: AssessmentQuestion;
  questionIndex: number;
  total: number;
  selectedAnswer: string | boolean | null;
  showFeedback: boolean;
  onSelect: (answer: string | boolean) => void;
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
        !showFeedback && selected && "border-primary bg-primary-light/50 text-foreground",
        !showFeedback && !selected && "border-border bg-white text-foreground hover:border-primary/40 hover:bg-muted",
        showFeedback && correct && "border-primary bg-primary-light/60 text-foreground",
        showFeedback && selected && !correct && "border-red bg-red/10 text-red",
        showFeedback && !selected && !correct && "border-border bg-white opacity-50"
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

export function QuestionCard({
  question,
  questionIndex,
  total,
  selectedAnswer,
  showFeedback,
  onSelect,
  onContinue,
}: QuestionCardProps) {
  const progress = ((questionIndex + 1) / total) * 100;
  const isCorrect = getIsCorrect(question, selectedAnswer);
  const imageSrc =
    question.image ??
    (question.type === "multiple_choice" && question.category === "vocabulary"
      ? getAssessmentVocabImage(question.id)
      : undefined);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
          <span>
            第 {questionIndex + 1} / {total} 题
          </span>
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-extrabold text-foreground">
            {question.level} · {QUESTION_TYPE_LABELS[question.type]}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card-elevated p-6 md:p-8">
        <p className="text-sm font-extrabold uppercase tracking-wide text-secondary">
          {QUESTION_TYPE_LABELS[question.type]}
        </p>

        {imageSrc && (
          <CourseImage
            src={imageSrc}
            alt=""
            className="mt-4 aspect-[16/10] w-full"
          />
        )}

        {question.type === "reading" && (
          <div className="mt-4 rounded-2xl border-2 border-secondary/20 bg-secondary/5 p-5">
            <p className="text-sm font-semibold leading-relaxed text-foreground">
              {question.passage}
            </p>
          </div>
        )}

        {question.type === "true_false" ? (
          <p className="mt-4 text-lg font-bold leading-relaxed text-foreground">
            {question.statement}
          </p>
        ) : question.type === "fill_blank" ? (
          <p className="mt-4 text-lg font-bold leading-relaxed text-foreground">
            {question.sentence.replace("___", "______")}
          </p>
        ) : question.type === "matching" ? (
          <div className="mt-4 flex items-center gap-3">
            <span className="rounded-xl bg-accent/15 px-4 py-2 font-display text-xl text-accent">
              {question.term}
            </span>
            <PronunciationButton text={question.term} />
          </div>
        ) : question.type === "reading" ? (
          <p className="mt-4 text-lg font-bold text-foreground">{question.question}</p>
        ) : (
          <p className="mt-4 text-lg font-bold leading-relaxed text-foreground">
            {question.prompt}
          </p>
        )}

        {(question.type === "true_false" || question.type === "fill_blank" || question.type === "matching") && (
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {question.prompt}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {question.type === "true_false" ? (
            <>
              <OptionButton
                label="True · 正确"
                selected={selectedAnswer === true}
                correct={question.correct === true}
                showFeedback={showFeedback}
                disabled={showFeedback}
                onClick={() => onSelect(true)}
              />
              <OptionButton
                label="False · 错误"
                selected={selectedAnswer === false}
                correct={question.correct === false}
                showFeedback={showFeedback}
                disabled={showFeedback}
                onClick={() => onSelect(false)}
              />
            </>
          ) : (
            question.options.map((option, i) => {
              const correctIndex =
                question.type === "multiple_choice" ||
                question.type === "fill_blank" ||
                question.type === "reading" ||
                question.type === "matching"
                  ? question.correctIndex
                  : 0;

              return (
                <OptionButton
                  key={option}
                  label={option}
                  selected={selectedAnswer === option}
                  correct={i === correctIndex}
                  showFeedback={showFeedback}
                  disabled={showFeedback}
                  onClick={() => onSelect(option)}
                />
              );
            })
          )}
        </div>

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
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {question.explanation}
            </p>
            <Button className="mt-4 w-full" onClick={onContinue}>
              {questionIndex + 1 < total ? "下一题" : "查看结果"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function getIsCorrect(
  question: AssessmentQuestion,
  answer: string | boolean | null
): boolean {
  if (answer === null) return false;

  switch (question.type) {
    case "true_false":
      return answer === question.correct;
    case "multiple_choice":
    case "fill_blank":
    case "reading":
    case "matching":
      return answer === question.options[question.correctIndex];
    default:
      return false;
  }
}

export { getIsCorrect };
