"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, Target } from "lucide-react";

import { PronunciationButton } from "@/components/courses/pronunciation-button";
import { Button } from "@/components/ui/button";
import type { ScenarioItem } from "@/lib/types/course";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type ScenariosTabProps = {
  scenarios: ScenarioItem[];
  showCategory?: boolean;
};

export function ScenariosTab({
  scenarios,
  showCategory = false,
}: ScenariosTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    scenarios[0]?.id ?? null
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scenarios;
    return scenarios.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.categoryTitle?.toLowerCase().includes(q)
    );
  }, [scenarios, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  if (scenarios.length === 0) {
    return (
      <div className="card-elevated p-8 text-center text-sm font-semibold text-muted-foreground">
        当前级别暂无模拟场景
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-extrabold text-foreground">
          共 {scenarios.length} 个模拟场景
          {search && filtered.length !== scenarios.length && (
            <span className="ml-2 font-semibold text-muted-foreground">
              （筛选 {filtered.length} 个）
            </span>
          )}
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="搜索场景..."
            className="w-full rounded-xl border-2 border-border bg-white py-2 pl-9 pr-4 text-sm font-semibold outline-none focus:border-primary sm:w-56"
          />
        </div>
      </div>

      {pageItems.map((scenario) => {
        const isOpen = expandedId === scenario.id;

        return (
          <article
            key={scenario.id}
            className="card-elevated overflow-hidden transition-all hover:shadow-md"
          >
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 p-6 text-left"
              onClick={() => setExpandedId(isOpen ? null : scenario.id)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {scenario.simulationNumber != null && (
                    <span className="rounded-lg bg-primary px-2 py-0.5 text-xs font-extrabold text-white">
                      #{scenario.simulationNumber}
                    </span>
                  )}
                  {showCategory && scenario.categoryTitle && (
                    <span className="rounded-lg bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary-dark">
                      {scenario.categoryTitle}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-xl text-foreground md:text-2xl">
                  {scenario.title}
                </h3>
                <p className="mt-2 text-xs font-bold text-accent">
                  {scenario.setting}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-primary transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t-2 border-border px-6 pb-6 pt-2">
                <p className="text-sm font-semibold leading-relaxed text-muted-foreground">
                  {scenario.description}
                </p>

                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-primary">
                    <Target className="size-4" />
                    学习目标
                  </div>
                  <ul className="mt-3 space-y-2">
                    {scenario.objectives.map((obj) => (
                      <li
                        key={obj}
                        className="flex items-start gap-2 text-sm font-semibold text-foreground"
                      >
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-extrabold text-secondary">
                    核心表达
                  </p>
                  <div className="mt-4 space-y-3">
                    {scenario.keyPhrases.map((phrase, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-2xl border-2 border-border bg-muted p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground">
                            {phrase.english}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {phrase.chinese}
                          </p>
                        </div>
                        <PronunciationButton text={phrase.english} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-extrabold text-accent">
                    示范对话
                  </p>
                  <div className="mt-4 space-y-4">
                    {scenario.sampleDialogue.map((line, i) => (
                      <div key={i} className="flex gap-3">
                        <span
                          className={cn(
                            "shrink-0 rounded-lg px-2 py-0.5 text-xs font-extrabold text-white",
                            line.speaker === "staff"
                              ? "bg-primary"
                              : "bg-secondary"
                          )}
                        >
                          {line.speaker === "staff" ? "前台" : "客人"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <p className="flex-1 text-sm font-bold text-foreground">
                              {line.english}
                            </p>
                            <PronunciationButton text={line.english} />
                          </div>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {line.chinese}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm font-extrabold text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
