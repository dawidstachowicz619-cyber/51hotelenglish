import { ChevronRight } from "lucide-react";

import { CourseImage } from "@/components/courses/course-image";
import { getScenarioImage } from "@/lib/data/course-images";
import {
  countLevelContent,
  type CefrLevel,
  type WorkScenario,
  getScenarioLevelContent,
} from "@/lib/types/course";

type WorkScenarioCardProps = {
  scenario: WorkScenario;
  level: CefrLevel;
  onSelect: () => void;
};

export function WorkScenarioCard({
  scenario,
  level,
  onSelect,
}: WorkScenarioCardProps) {
  const content = getScenarioLevelContent(scenario, level);
  if (!content) return null;

  const counts = countLevelContent(content);
  const imageSrc = scenario.image ? getScenarioImage(scenario.image) : undefined;
  const availableLevels = scenario.levels.map((l) => l.level);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="card-elevated group w-full overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {imageSrc && (
        <CourseImage
          src={imageSrc}
          alt={scenario.title}
          className="aspect-[16/7] w-full rounded-none border-0 border-b-2"
        />
      )}
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-muted-foreground">
              {scenario.subtitle}
            </p>
            <h3 className="mt-1 font-display text-xl text-foreground group-hover:text-primary">
              {scenario.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-muted-foreground">
              {scenario.description}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-light/60 px-3 py-0.5 text-xs font-extrabold text-primary">
            {level}
          </span>
          {availableLevels.length > 1 && (
            <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-semibold text-muted-foreground">
              另有 {availableLevels.filter((l) => l !== level).join(" / ")} 版本
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-extrabold text-muted-foreground">
          <span>{counts.words} 单词</span>
          <span>{counts.sentences} 句子</span>
          <span>{counts.dialogues} 对话</span>
          <span>{counts.scenario} 模拟场景</span>
        </div>
      </div>
    </button>
  );
}

type WorkScenarioListProps = {
  scenarios: WorkScenario[];
  level: CefrLevel;
  onSelect: (scenarioId: string) => void;
};

export function WorkScenarioList({
  scenarios,
  level,
  onSelect,
}: WorkScenarioListProps) {
  const visible = scenarios.filter((s) =>
    s.levels.some((l) => l.level === level)
  );

  if (visible.length === 0) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="font-bold text-muted-foreground">
          当前 {level} 级别暂无可用场景，请切换其他 CEFR 级别。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {visible.map((scenario) => (
        <WorkScenarioCard
          key={scenario.id}
          scenario={scenario}
          level={level}
          onSelect={() => onSelect(scenario.id)}
        />
      ))}
    </div>
  );
}
