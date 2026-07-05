"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateCourseFromTheme } from "@/lib/course/course-theme-generator";
import { saveGeneratedCourse } from "@/lib/course/generated-course-storage";
import type { CefrLevel } from "@/lib/types/course";
import { CEFR_LEVELS } from "@/lib/types/course";
import { GENERATED_SIMULATIONS_COUNT } from "@/lib/types/generated-course";
import {
  DEPARTMENT_BY_ID,
  FRONT_DESK_DEPARTMENTS,
  type FrontDeskDepartmentId,
} from "@/lib/types/front-desk-department";

type CourseGeneratorPanelProps = {
  defaultDepartment?: FrontDeskDepartmentId;
  onGenerated: (scenarioId: string) => void;
};

export function CourseGeneratorPanel({
  defaultDepartment = "concierge",
  onGenerated,
}: CourseGeneratorPanelProps) {
  const [theme, setTheme] = useState("");
  const [brief, setBrief] = useState("");
  const [departmentId, setDepartmentId] =
    useState<FrontDeskDepartmentId>(defaultDepartment);
  const [level, setLevel] = useState<CefrLevel>("A2");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    const trimmed = theme.trim();
    if (!trimmed) {
      setError("请输入课程主题");
      return;
    }

    setGenerating(true);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const course = generateCourseFromTheme({
        theme: trimmed,
        departmentId,
        level,
        brief,
      });
      saveGeneratedCourse(course);
      onGenerated(course.scenarioId);
      setTheme("");
      setBrief("");
    } catch {
      setError("生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card-elevated border-2 border-primary/25 bg-gradient-to-br from-primary-light/30 to-white p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_3px_0_0_var(--primary-dark)]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg text-foreground">主题生成课程</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            输入一个业务主题（如「米其林餐厅预订」「机场豪车接送」），系统自动生成词汇、句型、对话与{" "}
            {GENERATED_SIMULATIONS_COUNT} 个模拟关卡，生成后可继续编辑并发布给学员
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block lg:col-span-2">
          <span className="text-xs font-extrabold text-foreground">课程主题 *</span>
          <input
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setError(null);
            }}
            placeholder="例如：高端客人机场接送与行李协助"
            className="mt-1.5 w-full rounded-xl border-2 border-border px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="text-xs font-extrabold text-muted-foreground">
            补充说明（可选）
          </span>
          <input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="如：侧重商务客人、强调时效与隐私"
            className="mt-1.5 w-full rounded-xl border-2 border-border px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-xs font-extrabold text-muted-foreground">所属岗位</span>
          <select
            value={departmentId}
            onChange={(e) =>
              setDepartmentId(e.target.value as FrontDeskDepartmentId)
            }
            className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold"
          >
            {FRONT_DESK_DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-extrabold text-muted-foreground">主级别</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CefrLevel)}
            className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold"
          >
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="mt-3 text-sm font-bold text-red">{error}</p>
      )}

      <Button
        className="mt-5"
        disabled={generating}
        onClick={() => void handleGenerate()}
      >
        {generating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            正在生成课程…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            自动生成课程
          </>
        )}
      </Button>

      <p className="mt-3 text-[10px] font-semibold text-muted-foreground">
        生成后默认为草稿，编辑确认无误后点击「发布」即可在学员端
        {DEPARTMENT_BY_ID[departmentId].title} 学习路径中显示
      </p>
    </div>
  );
}
