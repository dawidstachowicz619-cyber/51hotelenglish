"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";

import { GENERAL_COURSE_CATALOG } from "@/lib/data/general-course-catalog";
import {
  getAssignedCatalogCoursesForEmployee,
  isCourseAssignedToEmployee,
  setEmployeeCourseAssignment,
} from "@/lib/hr/course-assignment-storage";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import { CATALOG_CATEGORY_LABELS, type CatalogCategory } from "@/lib/types/course-catalog";
import { LEARNING_PHASE_LABELS } from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

type EmployeeCourseAssignPanelProps = {
  hotel: string;
  employee: EmployeeLearningRecord;
  allEmployees: EmployeeLearningRecord[];
  canEdit?: boolean;
};

export function EmployeeCourseAssignPanel({
  hotel,
  employee,
  allEmployees,
  canEdit = true,
}: EmployeeCourseAssignPanelProps) {
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CatalogCategory | "all">("all");

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("hotel-course-assignments-updated", onUpdate);
    return () => window.removeEventListener("hotel-course-assignments-updated", onUpdate);
  }, [refresh]);

  const assigned = useMemo(
    () => getAssignedCatalogCoursesForEmployee(hotel, employee.department, employee.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotel, employee.department, employee.id, version]
  );

  const filtered = useMemo(
    () =>
      category === "all"
        ? GENERAL_COURSE_CATALOG
        : GENERAL_COURSE_CATALOG.filter((c) => c.category === category),
    [category]
  );

  const handleToggle = (courseId: string, enabled: boolean) => {
    if (!canEdit) return;
    setError(null);
    const result = setEmployeeCourseAssignment(
      hotel,
      courseId,
      employee.id,
      enabled,
      allEmployees
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refresh();
  };

  return (
    <section className="mt-6 rounded-xl border-2 border-primary/20 bg-primary-light/15 p-4">
      <div className="flex items-start gap-2">
        <BookOpen className="mt-0.5 size-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-extrabold text-foreground">分配课程</p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            为 {employee.nickname} 勾选课程，已分配 {assigned.length} 门
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["all", ...Object.keys(CATALOG_CATEGORY_LABELS)] as (CatalogCategory | "all")[]).map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-extrabold",
                category === key
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground"
              )}
            >
              {key === "all" ? "全部" : CATALOG_CATEGORY_LABELS[key]}
            </button>
          )
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red/10 px-3 py-2 text-xs font-bold text-red">{error}</p>
      )}

      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {filtered.map((course) => {
          const checked = isCourseAssignedToEmployee(
            hotel,
            course.id,
            employee.department,
            employee.id
          );
          return (
            <li
              key={course.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!canEdit}
                onChange={(e) => handleToggle(course.id, e.target.checked)}
                className="size-4 accent-primary"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-foreground">{course.title}</p>
                <p className="text-[10px] font-semibold text-muted-foreground">
                  {CATALOG_CATEGORY_LABELS[course.category]} ·{" "}
                  {LEARNING_PHASE_LABELS[course.phase]}
                </p>
              </div>
              {checked && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
            </li>
          );
        })}
      </ul>

      {assigned.length > 0 && (
        <div className="mt-3 rounded-lg bg-white/80 px-3 py-2">
          <p className="text-[10px] font-extrabold text-muted-foreground">学员端可见</p>
          <p className="mt-1 text-xs font-semibold text-foreground">
            {assigned.map((a) => a.course.title).join("、")}
          </p>
        </div>
      )}
    </section>
  );
}
