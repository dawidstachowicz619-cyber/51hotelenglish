"use client";

import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";

import { DialoguesTab } from "@/components/courses/front-desk/dialogues-tab";
import { ScenarioModuleTabs } from "@/components/courses/front-desk/scenario-module-tabs";
import { ScenariosTab } from "@/components/courses/front-desk/scenarios-tab";
import { SentencesTab } from "@/components/courses/front-desk/sentences-tab";
import { WordsTab } from "@/components/courses/front-desk/words-tab";
import { CourseImage } from "@/components/courses/course-image";
import { Button } from "@/components/ui/button";
import { getScenarioImage } from "@/lib/data/course-images";
import {
  countLevelContent,
  type CefrLevel,
  type CourseModuleTab,
  type WorkScenario,
  getScenarioLevelContent,
} from "@/lib/types/course";
import { cn } from "@/lib/utils";

type WorkScenarioDetailProps = {
  scenario: WorkScenario;
  level: CefrLevel;
  onBack: () => void;
  activeTab: CourseModuleTab;
  onTabChange: (tab: CourseModuleTab) => void;
  stageLabel?: string;
  lockedModule?: CourseModuleTab;
  onComplete?: () => void;
  isCompleted?: boolean;
};

export function WorkScenarioDetail({
  scenario,
  level,
  onBack,
  activeTab,
  onTabChange,
  stageLabel,
  lockedModule,
  onComplete,
  isCompleted = false,
}: WorkScenarioDetailProps) {
  const content = getScenarioLevelContent(scenario, level);

  if (!content) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="font-bold text-muted-foreground">该关卡暂无内容。</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-extrabold text-primary"
        >
          返回通关地图
        </button>
      </div>
    );
  }

  const counts = countLevelContent(content);
  const tabCounts: Record<CourseModuleTab, number> = {
    words: counts.words,
    sentences: counts.sentences,
    dialogues: counts.dialogues,
    scenario: counts.scenario,
  };

  const imageSrc = scenario.image ? getScenarioImage(scenario.image) : undefined;
  const effectiveTab = lockedModule ?? activeTab;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        返回通关地图
      </button>

      {stageLabel && (
        <div className="mt-4 rounded-xl border-2 border-accent/30 bg-accent/10 px-4 py-2 text-center">
          <p className="text-sm font-extrabold text-accent">{stageLabel}</p>
        </div>
      )}

      <header className="mt-4 overflow-hidden rounded-2xl border-2 border-border bg-white">
        {imageSrc && (
          <CourseImage
            src={imageSrc}
            alt={scenario.title}
            className="aspect-[21/9] w-full rounded-none border-0 border-b-2"
          />
        )}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground">
                {scenario.subtitle}
              </p>
              <h2 className="mt-1 font-display text-2xl text-foreground md:text-3xl">
                {scenario.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-muted-foreground">
                {scenario.description}
              </p>
            </div>
            <span
              className={cn(
                "rounded-xl border-2 px-4 py-2 text-sm font-extrabold",
                "border-primary bg-primary-light/50 text-primary"
              )}
            >
              {level} 级别
            </span>
          </div>

          {!lockedModule && (
            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["words", "单词", counts.words],
                  ["sentences", "句子", counts.sentences],
                  ["dialogues", "对话", counts.dialogues],
                  ["scenario", "模拟场景", counts.scenario],
                ] as const
              ).map(([key, label, count]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-muted px-3 py-1 text-xs font-extrabold text-foreground"
                >
                  <BookOpen className="size-3 text-primary" />
                  {count} {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {!lockedModule && (
        <div className="mt-8">
          <ScenarioModuleTabs
            active={activeTab}
            onChange={onTabChange}
            counts={tabCounts}
          />
        </div>
      )}

      <div className="mt-8">
        {effectiveTab === "words" && <WordsTab words={content.words} />}
        {effectiveTab === "sentences" && (
          <SentencesTab sentences={content.sentences} />
        )}
        {effectiveTab === "dialogues" && (
          <DialoguesTab dialogues={content.dialogues} />
        )}
        {effectiveTab === "scenario" && (
          <ScenariosTab scenarios={content.scenarios} />
        )}
      </div>

      {onComplete && (
        <div className="mt-10 flex flex-col items-center gap-3 border-t-2 border-border pt-8">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="size-6" />
              <span className="font-extrabold">本关已完成</span>
            </div>
          ) : (
            <>
              <p className="text-center text-sm font-semibold text-muted-foreground">
                学习完成后点击按钮通关，解锁下一关
              </p>
              <Button size="lg" className="min-w-[200px]" onClick={onComplete}>
                完成本关 · 继续闯关
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
