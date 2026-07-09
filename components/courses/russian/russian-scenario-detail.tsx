"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";

import { RussianDialoguesTab } from "@/components/courses/russian/russian-dialogues-tab";
import { RussianModuleTabs } from "@/components/courses/russian/russian-module-tabs";
import { RussianPracticeTab } from "@/components/courses/russian/russian-practice-tab";
import { RussianSentencesTab } from "@/components/courses/russian/russian-sentences-tab";
import { RussianWordsTab } from "@/components/courses/russian/russian-words-tab";
import { buildRussianPracticeQuestions } from "@/lib/course/russian-practice-generator";
import {
  countRussianScenario,
  type RussianModuleTab,
  type RussianScenario,
} from "@/lib/types/hotel-russian";

type RussianScenarioDetailProps = {
  scenario: RussianScenario;
  onBack: () => void;
};

export function RussianScenarioDetail({ scenario, onBack }: RussianScenarioDetailProps) {
  const [activeTab, setActiveTab] = useState<RussianModuleTab>("words");

  const counts = useMemo(() => {
    const base = countRussianScenario(scenario);
    const practiceCount = buildRussianPracticeQuestions(scenario).length;
    return {
      words: base.words,
      sentences: base.sentences,
      dialogues: base.dialogues,
      practice: practiceCount,
    };
  }, [scenario]);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-[#0039A6]"
      >
        <ArrowLeft className="size-4" />
        返回场景列表
      </button>

      <header className="mt-4 overflow-hidden rounded-2xl border-2 border-[#0039A6]/15 bg-gradient-to-br from-[#0039A6]/10 to-white">
        <div className="p-6 md:p-8">
          <p className="text-xs font-bold text-muted-foreground">{scenario.subtitle}</p>
          <h2 className="mt-1 font-display text-2xl text-foreground md:text-3xl">
            {scenario.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-muted-foreground">
            {scenario.description}
          </p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-[#0039A6]">
            <BookOpen className="size-3" />
            通过中文学习俄语 · 单词 → 句子 → 对话 → 练习
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ["words", "单词", counts.words],
                ["sentences", "句子", counts.sentences],
                ["dialogues", "对话", counts.dialogues],
                ["practice", "练习", counts.practice],
              ] as const
            ).map(([key, label, count]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-white px-3 py-1 text-xs font-extrabold text-foreground"
              >
                {count} {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-8">
        <RussianModuleTabs active={activeTab} onChange={setActiveTab} counts={counts} />
      </div>

      <div className="mt-8">
        {activeTab === "words" && <RussianWordsTab words={scenario.words} />}
        {activeTab === "sentences" && (
          <RussianSentencesTab sentences={scenario.sentences} />
        )}
        {activeTab === "dialogues" && (
          <RussianDialoguesTab dialogues={scenario.dialogues} />
        )}
        {activeTab === "practice" && <RussianPracticeTab scenario={scenario} />}
      </div>
    </div>
  );
}
