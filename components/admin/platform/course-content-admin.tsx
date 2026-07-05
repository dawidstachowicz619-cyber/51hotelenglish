"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, LogOut, RotateCcw, Save } from "lucide-react";

import { CourseGeneratorPanel } from "@/components/admin/platform/course-generator-panel";
import { PlatformLoginGate } from "@/components/admin/platform/platform-login-gate";
import { Button } from "@/components/ui/button";
import {
  getScenarioOverride,
  resetScenarioOverride,
  resetSimulationOverride,
  saveLevelContentOverride,
  saveScenarioMeta,
  saveSimulationOverride,
} from "@/lib/course/course-content-overrides";
import { getFrontDeskWorkScenarios } from "@/lib/course/course-content-resolver";
import { generatedCourseToWorkScenario } from "@/lib/course/course-theme-generator";
import { isGeneratedScenarioId } from "@/lib/course/department-scenarios";
import {
  deleteGeneratedCourse,
  getAllGeneratedCourses,
  getGeneratedCourseByScenarioId,
  publishGeneratedCourse,
  unpublishGeneratedCourse,
  updateGeneratedCourseLevel,
  updateGeneratedCourseMeta,
  updateGeneratedSimulation,
} from "@/lib/course/generated-course-storage";
import { getDepartmentLevelSimulations } from "@/lib/data/front-desk/simulation-generator";
import {
  clearPlatformAdminSession,
  loadPlatformAdminSession,
} from "@/lib/hr/platform-admin-session";
import type {
  CefrLevel,
  DialogueItem,
  ScenarioItem,
  SentenceItem,
  WordItem,
} from "@/lib/types/course";
import { CEFR_LEVELS } from "@/lib/types/course";
import {
  DEPARTMENT_BY_ID,
  FRONT_DESK_DEPARTMENTS,
  type FrontDeskDepartmentId,
} from "@/lib/types/front-desk-department";
import { cn } from "@/lib/utils";

type EditorTab = "meta" | "words" | "sentences" | "dialogues" | "simulations";

export function CourseContentAdmin() {
  const [authed, setAuthed] = useState(false);
  const [departmentId, setDepartmentId] =
    useState<FrontDeskDepartmentId>("concierge");
  const [scenarioId, setScenarioId] = useState("special-requests");
  const [level, setLevel] = useState<CefrLevel>("A1");
  const [tab, setTab] = useState<EditorTab>("meta");
  const [tick, setTick] = useState(0);
  const [saved, setSaved] = useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaSubtitle, setMetaSubtitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [words, setWords] = useState<WordItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [dialogues, setDialogues] = useState<DialogueItem[]>([]);
  const [simIndex, setSimIndex] = useState(0);
  const [simTitle, setSimTitle] = useState("");
  const [simSetting, setSimSetting] = useState("");
  const [simDescription, setSimDescription] = useState("");
  const [simObjectives, setSimObjectives] = useState("");
  const [simKeyPhrases, setSimKeyPhrases] = useState("");

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (loadPlatformAdminSession()) setAuthed(true);
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("generated-courses-updated", onUpdate);
    return () => window.removeEventListener("generated-courses-updated", onUpdate);
  }, [refresh]);

  const department = DEPARTMENT_BY_ID[departmentId];
  const generatedCourses = useMemo(
    () => getAllGeneratedCourses().filter((c) => c.departmentId === departmentId),
    [departmentId, tick]
  );
  const scenarioIds = useMemo(
    () => [
      ...department.scenarioIds,
      ...generatedCourses.map((c) => c.scenarioId),
    ],
    [department, generatedCourses]
  );

  const scenarios = useMemo(() => {
    const published = getFrontDeskWorkScenarios();
    const draftGen = generatedCourses
      .filter((c) => c.status === "draft")
      .map(generatedCourseToWorkScenario);
    const merged = [...published];
    for (const d of draftGen) {
      if (!merged.some((s) => s.id === d.id)) merged.push(d);
    }
    return merged;
  }, [tick, generatedCourses]);

  const isGenerated = isGeneratedScenarioId(scenarioId);
  const generatedPkg = isGenerated
    ? getGeneratedCourseByScenarioId(scenarioId)
    : undefined;
  const scenario = scenarios.find((s) => s.id === scenarioId);
  const levelContent = scenario?.levels.find((l) => l.level === level);
  const hasOverride =
    Boolean(getScenarioOverride(scenarioId)) || Boolean(generatedPkg);

  const simulations = useMemo(() => {
    return getDepartmentLevelSimulations(departmentId, level).filter(
      (s) => s.categoryId === scenarioId
    );
  }, [departmentId, level, scenarioId, tick]);

  const activeSim: ScenarioItem | undefined = simulations[simIndex];

  useEffect(() => {
    if (!scenario) return;
    setMetaTitle(scenario.title);
    setMetaSubtitle(scenario.subtitle);
    setMetaDescription(scenario.description);
    setWords(levelContent?.words ?? []);
    setSentences(levelContent?.sentences ?? []);
    setDialogues(levelContent?.dialogues ?? []);
    setSimIndex(0);
  }, [scenario, levelContent, scenarioId, level, tick]);

  useEffect(() => {
    if (!activeSim) return;
    setSimTitle(activeSim.title);
    setSimSetting(activeSim.setting);
    setSimDescription(activeSim.description);
    setSimObjectives(activeSim.objectives.join("\n"));
    setSimKeyPhrases(
      activeSim.keyPhrases
        .map((p) => `${p.english}|${p.chinese}`)
        .join("\n")
    );
  }, [activeSim, tick]);

  const handleDeptChange = (id: FrontDeskDepartmentId) => {
    setDepartmentId(id);
    const first = DEPARTMENT_BY_ID[id].scenarioIds[0];
    if (first) setScenarioId(first);
  };

  const flashSaved = () => {
    setSaved(true);
    refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveMeta = () => {
    if (isGenerated && generatedPkg) {
      updateGeneratedCourseMeta(generatedPkg.id, {
        title: metaTitle,
        subtitle: metaSubtitle,
        description: metaDescription,
      });
    } else {
      saveScenarioMeta(scenarioId, {
        title: metaTitle,
        subtitle: metaSubtitle,
        description: metaDescription,
      });
    }
    flashSaved();
  };

  const handleSaveLevel = () => {
    if (isGenerated) {
      const existingSims =
        generatedPkg?.levels[level]?.simulations ??
        levelContent?.scenarios ??
        [];
      updateGeneratedCourseLevel(scenarioId, level, {
        words,
        sentences,
        dialogues,
        simulations: existingSims,
      });
    } else {
      saveLevelContentOverride(scenarioId, level, {
        words,
        sentences,
        dialogues,
      });
    }
    flashSaved();
  };

  const handleSaveSimulation = () => {
    if (!activeSim) return;
    const patch = {
      title: simTitle,
      setting: simSetting,
      description: simDescription,
      objectives: simObjectives.split("\n").filter(Boolean),
      keyPhrases: simKeyPhrases
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [english, chinese] = line.split("|");
          return {
            english: english?.trim() ?? "",
            chinese: chinese?.trim() ?? "",
          };
        })
        .filter((p) => p.english),
    };
    if (isGenerated) {
      updateGeneratedSimulation(scenarioId, activeSim.id, patch);
    } else {
      saveSimulationOverride(activeSim.id, scenarioId, patch);
    }
    flashSaved();
  };

  const handleResetScenario = () => {
    if (isGenerated && generatedPkg) {
      if (!window.confirm("删除此 AI 生成课程？此操作不可撤销。")) return;
      deleteGeneratedCourse(generatedPkg.id);
      setScenarioId(department.scenarioIds[0] ?? "");
      refresh();
      return;
    }
    if (!window.confirm("恢复该工作场景的默认内容？自定义修改将清除。")) return;
    resetScenarioOverride(scenarioId);
    refresh();
  };

  const handleResetSimulation = () => {
    if (!activeSim) return;
    if (!window.confirm(`恢复模拟关卡「${activeSim.title}」为默认？`)) return;
    resetSimulationOverride(scenarioId, activeSim.id);
    refresh();
  };

  if (!authed) {
    return <PlatformLoginGate onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/platform"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回平台管理
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
              <BookOpen className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-foreground md:text-3xl">
                课程内容管理
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                输入主题自动生成课程，或在生成结果 / 内置课程上继续编辑管理
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {saved && (
            <span className="self-center text-xs font-extrabold text-primary">
              已保存
            </span>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/courses/front-desk">预览学员端</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearPlatformAdminSession();
              setAuthed(false);
            }}
          >
            <LogOut className="size-4" />
            退出
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <CourseGeneratorPanel
          defaultDepartment={departmentId}
          onGenerated={(id) => {
            setScenarioId(id);
            const gc = getGeneratedCourseByScenarioId(id);
            if (gc) setLevel(gc.primaryLevel);
            refresh();
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FRONT_DESK_DEPARTMENTS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleDeptChange(d.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-extrabold transition-colors",
              departmentId === d.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {d.title.replace("岗位英语", "").replace("英语", "")}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <aside className="card-elevated p-4 lg:col-span-1">
          <p className="text-xs font-extrabold text-muted-foreground">内置场景</p>
          <ul className="mt-2 space-y-1">
            {department.scenarioIds.map((id) => {
              const ws = scenarios.find((s) => s.id === id);
              if (!ws) return null;
              return (
                <ScenarioListItem
                  key={id}
                  title={ws.title}
                  active={scenarioId === id}
                  badge={
                    getScenarioOverride(id)
                      ? "已定制"
                      : undefined
                  }
                  onSelect={() => setScenarioId(id)}
                />
              );
            })}
          </ul>

          {generatedCourses.length > 0 && (
            <>
              <p className="mt-4 text-xs font-extrabold text-primary">
                AI 生成课程
              </p>
              <ul className="mt-2 space-y-1">
                {generatedCourses.map((gc) => {
                  const ws = scenarios.find((s) => s.id === gc.scenarioId);
                  if (!ws) return null;
                  return (
                    <li key={gc.id}>
                      <ScenarioListItem
                        title={ws.title}
                        active={scenarioId === gc.scenarioId}
                        badge={gc.status === "published" ? "已发布" : "草稿"}
                        onSelect={() => {
                          setScenarioId(gc.scenarioId);
                          setLevel(gc.primaryLevel);
                        }}
                      />
                      {scenarioId === gc.scenarioId && (
                        <div className="mt-1 flex gap-1 px-1">
                          {gc.status === "draft" ? (
                            <Button
                              size="sm"
                              className="h-7 flex-1 text-[10px]"
                              onClick={() => {
                                publishGeneratedCourse(gc.id);
                                refresh();
                              }}
                            >
                              发布
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 flex-1 text-[10px]"
                              onClick={() => {
                                unpublishGeneratedCourse(gc.id);
                                refresh();
                              }}
                            >
                              取消发布
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className="mt-4 text-xs font-extrabold text-muted-foreground">CEFR 级别</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {CEFR_LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-extrabold",
                  level === l
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {(hasOverride || isGenerated) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={handleResetScenario}
            >
              <RotateCcw className="size-3.5" />
              {isGenerated ? "删除生成课程" : "恢复本场景默认"}
            </Button>
          )}
        </aside>

        <div className="card-elevated p-5 lg:col-span-3">
          {isGenerated && generatedPkg && (
            <p className="mb-3 rounded-lg bg-primary-light/40 px-3 py-2 text-xs font-bold text-primary">
              AI 生成课程 · 主级别 {generatedPkg.primaryLevel} ·{" "}
              {generatedPkg.status === "published"
                ? "已发布，学员可见"
                : "草稿，发布后学员可见"}
            </p>
          )}
          <div className="flex flex-wrap gap-2 border-b-2 border-border pb-3">
            {(
              [
                ["meta", "场景主题"],
                ["words", "词汇"],
                ["sentences", "句子"],
                ["dialogues", "对话"],
                ["simulations", "模拟关卡"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-extrabold",
                  tab === key
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "meta" && (
            <MetaEditor
              title={metaTitle}
              subtitle={metaSubtitle}
              description={metaDescription}
              onTitle={setMetaTitle}
              onSubtitle={setMetaSubtitle}
              onDescription={setMetaDescription}
              onSave={handleSaveMeta}
            />
          )}

          {tab === "words" && (
            <WordsEditor words={words} onChange={setWords} onSave={handleSaveLevel} />
          )}

          {tab === "sentences" && (
            <SentencesEditor
              sentences={sentences}
              onChange={setSentences}
              onSave={handleSaveLevel}
            />
          )}

          {tab === "dialogues" && (
            <DialoguesEditor
              dialogues={dialogues}
              onChange={setDialogues}
              onSave={handleSaveLevel}
            />
          )}

          {tab === "simulations" && (
            <SimulationsEditor
              simulations={simulations}
              simIndex={simIndex}
              onSimIndex={setSimIndex}
              title={simTitle}
              setting={simSetting}
              description={simDescription}
              objectives={simObjectives}
              keyPhrases={simKeyPhrases}
              onTitle={setSimTitle}
              onSetting={setSimSetting}
              onDescription={setSimDescription}
              onObjectives={setSimObjectives}
              onKeyPhrases={setSimKeyPhrases}
              onSave={handleSaveSimulation}
              onReset={handleResetSimulation}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioListItem({
  title,
  active,
  badge,
  onSelect,
}: {
  title: string;
  active: boolean;
  badge?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors",
        active ? "bg-secondary/15 text-secondary" : "hover:bg-muted"
      )}
    >
      {title}
      {badge && (
        <span className="ml-1 text-[10px] text-primary">· {badge}</span>
      )}
    </button>
  );
}

function MetaEditor({
  title,
  subtitle,
  description,
  onTitle,
  onSubtitle,
  onDescription,
  onSave,
}: {
  title: string;
  subtitle: string;
  description: string;
  onTitle: (v: string) => void;
  onSubtitle: (v: string) => void;
  onDescription: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <Field label="场景标题">
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>
      <Field label="英文副标题">
        <input
          value={subtitle}
          onChange={(e) => onSubtitle(e.target.value)}
          className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>
      <Field label="场景说明">
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>
      <SaveButton onSave={onSave} />
    </div>
  );
}

function WordsEditor({
  words,
  onChange,
  onSave,
}: {
  words: WordItem[];
  onChange: (w: WordItem[]) => void;
  onSave: () => void;
}) {
  const update = (index: number, patch: Partial<WordItem>) => {
    onChange(words.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">
        共 {words.length} 个词汇 · 修改后点击保存生效
      </p>
      {words.map((w, i) => (
        <div key={w.id} className="rounded-lg border-2 border-border p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={w.english}
              onChange={(e) => update(i, { english: e.target.value })}
              placeholder="English"
              className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
            />
            <input
              value={w.chinese}
              onChange={(e) => update(i, { chinese: e.target.value })}
              placeholder="中文"
              className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
            />
            <input
              value={w.phonetic}
              onChange={(e) => update(i, { phonetic: e.target.value })}
              placeholder="音标"
              className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary sm:col-span-2"
            />
            <input
              value={w.example ?? ""}
              onChange={(e) => update(i, { example: e.target.value })}
              placeholder="例句"
              className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary sm:col-span-2"
            />
          </div>
        </div>
      ))}
      <SaveButton onSave={onSave} />
    </div>
  );
}

function SentencesEditor({
  sentences,
  onChange,
  onSave,
}: {
  sentences: SentenceItem[];
  onChange: (s: SentenceItem[]) => void;
  onSave: () => void;
}) {
  const update = (index: number, patch: Partial<SentenceItem>) => {
    onChange(sentences.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  return (
    <div className="mt-4 space-y-3">
      {sentences.map((s, i) => (
        <div key={s.id} className="rounded-lg border-2 border-border p-3 space-y-2">
          <input
            value={s.context}
            onChange={(e) => update(i, { context: e.target.value })}
            placeholder="使用场景"
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
          />
          <textarea
            value={s.english}
            onChange={(e) => update(i, { english: e.target.value })}
            placeholder="English"
            rows={2}
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
          />
          <textarea
            value={s.chinese}
            onChange={(e) => update(i, { chinese: e.target.value })}
            placeholder="中文"
            rows={2}
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>
      ))}
      <SaveButton onSave={onSave} />
    </div>
  );
}

function DialoguesEditor({
  dialogues,
  onChange,
  onSave,
}: {
  dialogues: DialogueItem[];
  onChange: (d: DialogueItem[]) => void;
  onSave: () => void;
}) {
  const update = (index: number, patch: Partial<DialogueItem>) => {
    onChange(dialogues.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const updateLine = (
    dIndex: number,
    lIndex: number,
    patch: Partial<DialogueItem["lines"][number]>
  ) => {
    const next = [...dialogues];
    const lines = [...next[dIndex].lines];
    lines[lIndex] = { ...lines[lIndex], ...patch };
    next[dIndex] = { ...next[dIndex], lines };
    onChange(next);
  };

  return (
    <div className="mt-4 space-y-4">
      {dialogues.map((d, di) => (
        <div key={d.id} className="rounded-lg border-2 border-border p-3">
          <input
            value={d.title}
            onChange={(e) => update(di, { title: e.target.value })}
            placeholder="对话标题"
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary mb-2"
          />
          {d.lines.map((line, li) => (
            <div key={li} className="mt-2 grid gap-2 sm:grid-cols-3">
              <select
                value={line.speaker}
                onChange={(e) =>
                  updateLine(di, li, {
                    speaker: e.target.value as "staff" | "guest",
                  })
                }
                className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
              >
                <option value="staff">员工</option>
                <option value="guest">客人</option>
              </select>
              <input
                value={line.english}
                onChange={(e) => updateLine(di, li, { english: e.target.value })}
                placeholder="English"
                className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
              />
              <input
                value={line.chinese}
                onChange={(e) => updateLine(di, li, { chinese: e.target.value })}
                placeholder="中文"
                className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      ))}
      <SaveButton onSave={onSave} />
    </div>
  );
}

function SimulationsEditor({
  simulations,
  simIndex,
  onSimIndex,
  title,
  setting,
  description,
  objectives,
  keyPhrases,
  onTitle,
  onSetting,
  onDescription,
  onObjectives,
  onKeyPhrases,
  onSave,
  onReset,
}: {
  simulations: ScenarioItem[];
  simIndex: number;
  onSimIndex: (i: number) => void;
  title: string;
  setting: string;
  description: string;
  objectives: string;
  keyPhrases: string;
  onTitle: (v: string) => void;
  onSetting: (v: string) => void;
  onDescription: (v: string) => void;
  onObjectives: (v: string) => void;
  onKeyPhrases: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  if (simulations.length === 0) {
    return (
      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        该级别下此场景暂无模拟关卡分配。
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold text-muted-foreground">
          选择关卡（共 {simulations.length} 个）
        </span>
        <select
          value={simIndex}
          onChange={(e) => onSimIndex(Number(e.target.value))}
          className="rounded-lg border-2 border-border px-3 py-1.5 text-sm font-bold"
        >
          {simulations.map((s, i) => (
            <option key={s.id} value={i}>
              #{s.simulationNumber ?? i + 1} · {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="关卡标题">
          <input value={title} onChange={(e) => onTitle(e.target.value)} className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary" />
        </Field>
        <Field label="场景设定 (setting)">
          <input value={setting} onChange={(e) => onSetting(e.target.value)} className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary" />
        </Field>
        <Field label="情境描述">
          <textarea
            value={description}
            onChange={(e) => onDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
          />
        </Field>
        <Field label="学习目标（每行一条）">
          <textarea
            value={objectives}
            onChange={(e) => onObjectives(e.target.value)}
            rows={4}
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
          />
        </Field>
        <Field label="关键表达（每行：英文|中文）">
          <textarea
            value={keyPhrases}
            onChange={(e) => onKeyPhrases(e.target.value)}
            rows={4}
            className="w-full rounded-lg border-2 border-border px-3 py-2 font-mono text-xs font-semibold outline-none focus:border-primary"
          />
        </Field>
      </div>

      <div className="mt-4 flex gap-2">
        <SaveButton onSave={onSave} />
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          恢复此关默认
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <Button size="sm" onClick={onSave}>
      <Save className="size-3.5" />
      保存修改
    </Button>
  );
}
