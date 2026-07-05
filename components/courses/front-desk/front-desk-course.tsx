"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  Trophy,
} from "lucide-react";

import { CourseLevelPicker } from "@/components/courses/course-level-picker";
import { DepartmentPicker } from "@/components/courses/front-desk/department-picker";
import { LevelExerciseFlow } from "@/components/courses/front-desk/level-exercise-flow";
import { ProgressionMap } from "@/components/courses/front-desk/progression-map";
import { Button } from "@/components/ui/button";
import { useAssessmentAccess } from "@/hooks/use-assessment-access";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { usePoints } from "@/hooks/use-points";
import {
  buildProgressionMap,
  getProgressionMapStats,
  pickStudyLevelForMap,
} from "@/lib/course/progression-map";
import { TRIAL_CEFR_LEVEL } from "@/lib/assessment/course-access";
import { getFrontDeskWorkScenarios } from "@/lib/course/course-content-resolver";
import type { CefrLevel } from "@/lib/types/course";
import { CEFR_LABELS } from "@/lib/types/course";
import type { ProgressionNode } from "@/lib/types/course-progress";
import type {
  FrontDeskDepartment,
  FrontDeskDepartmentId,
} from "@/lib/types/front-desk-department";

export function FrontDeskCourse() {
  const { completedNodeIds, completeNode } = useCourseProgress();
  const { enterCourse } = usePoints();
  const {
    ready,
    maxLevel,
    hasAssessment,
    canAccess,
    defaultStudyLevel,
  } = useAssessmentAccess();

  const [department, setDepartment] = useState<FrontDeskDepartment | null>(
    null
  );
  const [courseBonus, setCourseBonus] = useState(0);
  const [activeNode, setActiveNode] = useState<ProgressionNode | null>(null);
  const [studyLevel, setStudyLevel] = useState<CefrLevel>("A1");
  const [contentTick, setContentTick] = useState(0);

  const workScenarios = useMemo(
    () => getFrontDeskWorkScenarios(),
    [contentTick]
  );

  useEffect(() => {
    const refresh = () => setContentTick((n) => n + 1);
    window.addEventListener("course-content-updated", refresh);
    return () => window.removeEventListener("course-content-updated", refresh);
  }, []);

  const mapNodes = useMemo(
    () =>
      department ? buildProgressionMap(department.id as FrontDeskDepartmentId) : [],
    [department, contentTick]
  );

  useEffect(() => {
    if (ready) {
      setStudyLevel(defaultStudyLevel);
    }
  }, [ready, defaultStudyLevel]);

  useEffect(() => {
    if (!department) return;
    const nextLevel = pickStudyLevelForMap(mapNodes, maxLevel, studyLevel);
    if (nextLevel !== studyLevel) {
      setStudyLevel(nextLevel);
      setActiveNode(null);
    }
  }, [department, mapNodes, maxLevel, studyLevel]);

  useEffect(() => {
    if (ready) {
      const earned = enterCourse("front-desk");
      if (earned > 0) setCourseBonus(earned);
    }
  }, [enterCourse, ready]);

  const levelNodes = useMemo(
    () => mapNodes.filter((n) => n.cefrLevel === studyLevel),
    [mapNodes, studyLevel]
  );

  const levelStats = useMemo(
    () => getProgressionMapStats(levelNodes),
    [levelNodes]
  );

  const levelCompletedCount = useMemo(
    () => levelNodes.filter((n) => completedNodeIds.includes(n.id)).length,
    [levelNodes, completedNodeIds]
  );

  const selectedScenario = activeNode
    ? workScenarios.find((s) => s.id === activeNode.workScenarioId)
    : null;

  const handleSelectDepartment = (dept: FrontDeskDepartment) => {
    setDepartment(dept);
    setActiveNode(null);
  };

  const handleBackToDepartments = () => {
    setDepartment(null);
    setActiveNode(null);
  };

  const handleSelectNode = (node: ProgressionNode) => {
    setActiveNode(node);
  };

  const handleBack = () => setActiveNode(null);

  const handleComplete = () => {
    if (!activeNode) return;
    completeNode(activeNode.id);
    setActiveNode(null);
  };

  const handleStudyLevelChange = (level: CefrLevel) => {
    if (!canAccess(level)) return;
    setStudyLevel(level);
    setActiveNode(null);
  };

  const isMapView = !activeNode;

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 text-center lg:px-8">
        <p className="font-bold text-muted-foreground">加载中…</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-24 lg:px-8">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          返回课程列表
        </Link>

        {!hasAssessment && (
          <div className="mt-6 rounded-2xl border-2 border-secondary/30 bg-secondary/10 p-4 text-center">
            <p className="text-sm font-extrabold text-foreground">
              试学模式 · 当前可学习 {TRIAL_CEFR_LEVEL}（{CEFR_LABELS[TRIAL_CEFR_LEVEL]}）
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              完成测评通关后，可解锁更高级别课程
            </p>
            <Button className="mt-3" variant="secondary" size="sm" asChild>
              <Link href="/assessment">
                <ClipboardCheck className="size-4" />
                去测评
              </Link>
            </Button>
          </div>
        )}

        <header className="mt-6 text-center">
          <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
            Front Desk English
          </p>
          <h1 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
            前厅英语 · 选择岗位
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-muted-foreground">
            {hasAssessment ? (
              <>
                前厅分为四个岗位方向，请选择你要学习的部门。测评通关至{" "}
                <span className="font-extrabold text-primary">{maxLevel}</span>
                ，可学习对应级别及以下课程。
              </>
            ) : (
              <>
                前厅分为四个岗位方向，请选择你要学习的部门。未测评时可试学{" "}
                <span className="font-extrabold text-primary">{TRIAL_CEFR_LEVEL}</span>{" "}
                级别，完成测评后解锁更多级别。
              </>
            )}
          </p>
        </header>

        <div className="mt-10">
          <DepartmentPicker onSelect={handleSelectDepartment} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 lg:px-8">
      <button
        type="button"
        onClick={handleBackToDepartments}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        返回岗位选择
      </button>

      {isMapView && (
        <>
          <header className="mt-6 rounded-2xl border-2 border-primary/20 bg-primary-light/30 p-6 md:p-8">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
                {department.subtitle}
              </p>
              <h1 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
                {department.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-muted-foreground">
                {department.description} 当前 {studyLevel} 级别共{" "}
                {levelStats.totalNodes} 关，已完成 {levelCompletedCount} 关。
                {courseBonus > 0 && (
                  <span className="ml-2 font-extrabold text-accent">
                    +{courseBonus} 积分
                  </span>
                )}
              </p>
            </div>
          </header>

          <div className="mt-6">
            <CourseLevelPicker
              value={studyLevel}
              onChange={handleStudyLevelChange}
              maxAccessibleLevel={maxLevel}
              canAccess={canAccess}
            />
          </div>
        </>
      )}

      <div className="mt-8">
        {activeNode ? (
          selectedScenario ? (
            <LevelExerciseFlow
              node={activeNode}
              scenario={selectedScenario}
              onBack={handleBack}
              onComplete={handleComplete}
              isCompleted={completedNodeIds.includes(activeNode.id)}
            />
          ) : (
            <div className="card-elevated p-8 text-center">
              <p className="font-bold text-muted-foreground">
                无法加载该关卡内容，请返回地图重试。
              </p>
              <Button className="mt-4" variant="outline" onClick={handleBack}>
                返回地图
              </Button>
            </div>
          )
        ) : levelNodes.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <p className="font-display text-xl text-foreground">
              {department.title} · {studyLevel} 暂无课程
            </p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              该岗位在 {studyLevel}（{CEFR_LABELS[studyLevel]}）级别暂无内容，请切换到
              A2 或其他有课程的级别。
            </p>
            {maxLevel && (
              <div className="mt-6">
                <CourseLevelPicker
                  value={studyLevel}
                  onChange={handleStudyLevelChange}
                  maxAccessibleLevel={maxLevel}
                  canAccess={canAccess}
                />
              </div>
            )}
          </div>
        ) : (
          <ProgressionMap
            nodes={levelNodes}
            completedNodeIds={completedNodeIds}
            onSelectNode={handleSelectNode}
          />
        )}
      </div>

      {isMapView &&
        levelNodes.length > 0 &&
        levelCompletedCount === levelNodes.length && (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border-2 border-accent/30 bg-accent/10 p-6">
            <Trophy className="size-8 text-accent" />
            <div>
              <p className="font-display text-xl text-foreground">
                {department.title} · {studyLevel} 已全部通关！
              </p>
              <p className="text-sm font-semibold text-muted-foreground">
                可切换级别或其他岗位继续学习
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
