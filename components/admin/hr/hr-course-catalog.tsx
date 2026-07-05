"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Library,
  Plus,
  Trash2,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  GENERAL_COURSE_CATALOG,
  getCatalogCourseById,
} from "@/lib/data/general-course-catalog";
import {
  assignCatalogCourse,
  getHotelCourseAssignments,
  isCatalogCourseAssigned,
  unassignCatalogCourse,
} from "@/lib/hr/course-assignment-storage";
import { getDepartmentLabel, getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import {
  CATALOG_CATEGORY_LABELS,
  type CatalogCategory,
} from "@/lib/types/course-catalog";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
} from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

type HrCourseCatalogProps = {
  hotel: string;
};

export function HrCourseCatalog({ hotel }: HrCourseCatalogProps) {
  const [assignments, setAssignments] = useState(() => getHotelCourseAssignments(hotel));
  const [departments, setDepartments] = useState(() => getHotelDepartments(hotel));
  const [category, setCategory] = useState<CatalogCategory | "all">("all");
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [assignDept, setAssignDept] = useState<EmployeeDepartment | "all">("all");

  const refresh = useCallback(() => {
    setAssignments(getHotelCourseAssignments(hotel));
    setDepartments(getHotelDepartments(hotel));
  }, [hotel]);

  useEffect(() => {
    refresh();
    window.addEventListener("hotel-course-assignments-updated", refresh);
    window.addEventListener("hotel-departments-updated", refresh);
    return () => {
      window.removeEventListener("hotel-course-assignments-updated", refresh);
      window.removeEventListener("hotel-departments-updated", refresh);
    };
  }, [refresh]);

  const filtered = useMemo(
    () =>
      category === "all"
        ? GENERAL_COURSE_CATALOG
        : GENERAL_COURSE_CATALOG.filter((c) => c.category === category),
    [category]
  );

  const categories = useMemo(
    () => ["all", ...Object.keys(CATALOG_CATEGORY_LABELS)] as (CatalogCategory | "all")[],
    []
  );

  const handleAssign = (courseId: string) => {
    assignCatalogCourse(hotel, courseId, assignDept, true);
    setAssignTarget(null);
    refresh();
  };

  const handleUnassign = (courseId: string) => {
    if (!window.confirm("确定取消分配该课程？员工端将不再显示。")) return;
    unassignCatalogCourse(hotel, courseId);
    refresh();
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_3px_0_0_var(--primary-dark)]">
          <Library className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl text-foreground">通用课程资源中心</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            从平台课程库选择课程分配给本酒店员工，员工可在 Grow in Hotel 学习
          </p>
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="mt-6 rounded-xl border-2 border-primary/20 bg-primary-light/20 p-4">
          <p className="text-xs font-extrabold text-primary">
            已分配 {assignments.length} 门课程
          </p>
          <ul className="mt-2 space-y-2">
            {assignments.map((a) => {
              const course = getCatalogCourseById(a.catalogCourseId);
              if (!course) return null;
              return (
                <li
                  key={a.catalogCourseId}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {course.title}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {a.department === "all"
                        ? "全员"
                        : getDepartmentLabel(hotel, a.department)}
                      {" · "}
                      {LEARNING_PHASE_LABELS[course.phase]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnassign(a.catalogCourseId)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-red/10 hover:text-red"
                    aria-label="取消分配"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors",
              category === cat
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat === "all" ? "全部" : CATALOG_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((course) => {
          const assigned = isCatalogCourseAssigned(hotel, course.id);
          const isLink = course.delivery.type === "link";
          const isAssigning = assignTarget === course.id;

          return (
            <article
              key={course.id}
              className={cn(
                "rounded-xl border-2 p-4 transition-colors",
                assigned ? "border-primary/30 bg-primary-light/10" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {isLink ? (
                    <ExternalLink className="size-4" />
                  ) : (
                    <Video className="size-4" />
                  )}
                </span>
                {assigned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                    <CheckCircle2 className="size-3" />
                    已分配
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-display text-base text-foreground">
                {course.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-muted-foreground">
                {course.description}
              </p>
              <p className="mt-2 text-[10px] font-bold text-muted-foreground">
                {CATALOG_CATEGORY_LABELS[course.category]} ·{" "}
                {LEARNING_PHASE_LABELS[course.phase]} · {ASK_SHORT[course.ask]} · ~
                {course.durationMinutes} 分钟
                {isLink ? " · 平台课程" : ` · ${course.lessonCount} 节视频`}
              </p>

              {isAssigning ? (
                <div className="mt-3 space-y-2">
                  <select
                    value={assignDept}
                    onChange={(e) =>
                      setAssignDept(e.target.value as EmployeeDepartment | "all")
                    }
                    className="w-full rounded-lg border-2 border-border px-2 py-1.5 text-xs font-bold"
                  >
                    <option value="all">全员 / 全部岗位</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleAssign(course.id)}>
                      确认分配
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssignTarget(null)}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant={assigned ? "outline" : "secondary"}
                  className="mt-3 w-full"
                  onClick={() => {
                    setAssignTarget(course.id);
                    setAssignDept("all");
                  }}
                >
                  {assigned ? (
                    <>
                      <BookOpen className="size-3.5" />
                      修改分配范围
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      分配给员工
                    </>
                  )}
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
