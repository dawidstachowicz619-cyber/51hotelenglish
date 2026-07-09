"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Trophy } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { RussianPronunciationPractice } from "@/components/training/russian-pronunciation-practice";
import { Button } from "@/components/ui/button";
import { buildCampaignLevelQuiz } from "@/lib/course/russian-campaign-practice";
import { completeRussianCampaignLevel } from "@/lib/course/russian-campaign-progress-storage";
import type { RussianCampaignLevel } from "@/lib/types/hotel-russian-campaign";
import { cn } from "@/lib/utils";

type RussianCampaignLevelPlayerProps = {
  level: RussianCampaignLevel;
  onBack: () => void;
  onComplete: () => void;
};

type Phase = "learn" | "quiz" | "done";

const PASS_SCORE = 60;

export function RussianCampaignLevelPlayer({
  level,
  onBack,
  onComplete,
}: RussianCampaignLevelPlayerProps) {
  const [phase, setPhase] = useState<Phase>("learn");
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const questions = useMemo(
    () => buildCampaignLevelQuiz(level.sentences, level.words, 5, level.level * 100),
    [level]
  );

  const question = questions[quizIndex];
  const lookupByRussian = useMemo(() => {
    const map = new Map<string, { chinese: string; transliteration: string }>();
    for (const s of level.sentences) {
      map.set(s.russian, { chinese: s.chinese, transliteration: s.transliteration });
    }
    for (const w of level.words) {
      map.set(w.russian, { chinese: w.chinese, transliteration: w.transliteration });
    }
    return map;
  }, [level.sentences, level.words]);

  const finishQuiz = () => {
    const score = Math.round((correctCount / questions.length) * 100);
    setFinalScore(score);
    if (score >= PASS_SCORE) {
      completeRussianCampaignLevel(level.department, level.level, score, level.title);
    }
    setPhase("done");
  };

  if (phase === "learn") {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={onBack}>
          返回闯关地图
        </Button>
        <div className="mt-4 rounded-2xl border-2 border-[#0039A6]/20 bg-[#0039A6]/5 px-5 py-4">
          <p className="text-xs font-bold text-[#0039A6]">
            第 {level.level} 关 · {level.zone}
          </p>
          <h2 className="mt-1 font-display text-2xl text-foreground">{level.title}</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{level.subtitle}</p>
          <p className="mt-2 text-xs font-extrabold text-muted-foreground">
            本关 {level.sentences.length} 句 + {level.words.length} 词 · 5 题测验（{PASS_SCORE}% 过关）
          </p>
        </div>

        <p className="mt-6 text-sm font-extrabold text-foreground">📖 五句话</p>
        <div className="mt-3 space-y-3">
          {level.sentences.map((s, i) => (
            <article
              key={s.id}
              className="rounded-xl border-2 border-border bg-white p-4"
            >
              <p className="text-[10px] font-bold text-muted-foreground">
                #{i + 1} · {s.context}
              </p>
              <p className="mt-1 font-bold text-foreground">{s.chinese}</p>
              <div className="mt-2 flex items-start justify-between gap-2 rounded-lg bg-[#0039A6]/5 px-3 py-2">
                <div>
                  <p className="font-display text-base text-foreground">{s.russian}</p>
                  <p className="text-xs italic text-muted-foreground">{s.transliteration}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.english}</p>
                </div>
                <PronunciationButton text={s.russian} lang="ru-RU" />
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-sm font-extrabold text-foreground">📚 五个单词</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {level.words.map((w, i) => (
            <article
              key={w.id}
              className="rounded-xl border-2 border-[#D52B1E]/20 bg-[#FFF5F5]/50 p-4"
            >
              <p className="text-[10px] font-bold text-[#B91C1C]">
                单词 #{i + 1} · {w.category}
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">{w.chinese}</p>
              <p className="text-xs text-muted-foreground">{w.english}</p>
              <div className="mt-2 flex items-start justify-between gap-2 rounded-lg bg-white px-3 py-2">
                <div>
                  <p className="font-display text-base text-foreground">{w.russian}</p>
                  <p className="text-xs italic text-muted-foreground">{w.transliteration}</p>
                </div>
                <PronunciationButton text={w.russian} lang="ru-RU" />
              </div>
              <RussianPronunciationPractice
                variant="compact"
                className="mt-2"
                target={{
                  russian: w.russian,
                  transliteration: w.transliteration,
                  chinese: w.chinese,
                }}
              />
            </article>
          ))}
        </div>

        <Button
          size="lg"
          className="mt-6 w-full bg-[#0039A6] hover:bg-[#002d85]"
          onClick={() => setPhase("quiz")}
        >
          开始过关测验（5 题）
        </Button>
      </div>
    );
  }

  if (phase === "quiz" && question) {
    return (
      <div>
        <div className="rounded-2xl border-2 border-border bg-white p-6">
          <p className="text-xs font-extrabold text-[#0039A6]">
            第 {level.level} 关测验 · {quizIndex + 1}/{questions.length}
          </p>
          <p className="mt-3 text-base font-extrabold">{question.prompt}</p>
          <div className="mt-4 space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={showFeedback}
                onClick={() => setSelected(opt)}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-bold",
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
                {lookupByRussian.get(opt) && (
                  <span className="mt-0.5 block text-xs font-normal italic text-muted-foreground">
                    {lookupByRussian.get(opt)!.transliteration}
                  </span>
                )}
              </button>
            ))}
          </div>
          {showFeedback && lookupByRussian.get(question.correctAnswer) && (
            <RussianPronunciationPractice
              variant="full"
              className="mt-4"
              target={{
                russian: question.correctAnswer,
                transliteration: lookupByRussian.get(question.correctAnswer)!.transliteration,
                chinese: lookupByRussian.get(question.correctAnswer)!.chinese,
              }}
            />
          )}
          <div className="mt-6">
            {!showFeedback ? (
              <Button className="w-full" disabled={!selected} onClick={() => {
                if (selected === question.correctAnswer) setCorrectCount((c) => c + 1);
                setShowFeedback(true);
              }}>
                确认
              </Button>
            ) : (
              <Button
                className="w-full"
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
                {quizIndex < questions.length - 1 ? "下一题" : "查看结果"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const passed = finalScore >= PASS_SCORE;

  return (
    <div className="card-elevated p-8 text-center">
      {passed ? (
        <Trophy className="mx-auto size-16 text-[#D52B1E]" />
      ) : (
        <CheckCircle2 className="mx-auto size-16 text-muted-foreground" />
      )}
      <h2 className="mt-4 font-display text-2xl">
        {passed ? "过关成功！" : "未达过关标准"}
      </h2>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        得分 {finalScore}% · 需 {PASS_SCORE}% 以上过关
        {passed && " · +15 积分 · 下一关已解锁"}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!passed && (
          <Button onClick={() => {
            setPhase("quiz");
            setQuizIndex(0);
            setSelected(null);
            setShowFeedback(false);
            setCorrectCount(0);
          }}>
            重新测验
          </Button>
        )}
        <Button variant="outline" onClick={onBack}>
          返回地图
        </Button>
        {passed && (
          <Button className="bg-[#0039A6]" onClick={onComplete}>
            继续闯关
          </Button>
        )}
      </div>
    </div>
  );
}
