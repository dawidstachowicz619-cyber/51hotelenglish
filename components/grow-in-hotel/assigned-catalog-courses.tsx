"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Library,
  Play,
  Video,
} from "lucide-react";

import { HrTrainingLesson } from "@/components/grow-in-hotel/hr-training-lesson";
import { Button } from "@/components/ui/button";
import {
  catalogCourseToTrainingModule,
  getAssignedCatalogCoursesForEmployee,
} from "@/lib/hr/course-assignment-storage";
import {
  getModuleScore,
  isModuleCompleted,
} from "@/lib/hr/training-progress-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { CatalogCourse } from "@/lib/types/course-catalog";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
} from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

type AssignedCatalogCoursesProps = {
  hotel: string;
  department: EmployeeDepartment;
};

function linkCourseCompleted(courseId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("51he-catalog-link-progress");
    const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    return Boolean(map[courseId]);
  } catch {
    return false;
  }
}

function markLinkCourseVisited(courseId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("51he-catalog-link-progress");
    const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    map[courseId] = true;
    localStorage.setItem("51he-catalog-link-progress", JSON.stringify(map));
    window.dispatchEvent(new Event("catalog-course-updated"));
  } catch {
    /* ignore */
  }
}

export function AssignedCatalogCourses({
  hotel,
  department,
}: AssignedCatalogCoursesProps) {
  const [items, setItems] = useState(() =>
    getAssignedCatalogCoursesForEmployee(hotel, department)
  );
  const [activeModule, setActiveModule] = useState<HrTrainingModule | null>(null);
  const [, tick] = useState(0);

  const refresh = useCallback(() => {
    setItems(getAssignedCatalogCoursesForEmployee(hotel, department));
    tick((n) => n + 1);
  }, [hotel, department]);

  useEffect(() => {
    refresh();
    window.addEventListener("hotel-course-assignments-updated", refresh);
    window.addEventListener("catalog-course-updated", refresh);
    window.addEventListener("employee-training-updated", refresh);
    return () => {
      window.removeEventListener("hotel-course-assignments-updated", refresh);
      window.removeEventListener("catalog-course-updated", refresh);
      window.removeEventListener("employee-training-updated", refresh);
    };
  }, [refresh]);

  if (activeModule) {
    return (
      <HrTrainingLesson
        module={activeModule}
        onBack={() => setActiveModule(null)}
        onComplete={() => {
          setActiveModule(null);
          refresh();
        }}
      />
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Library className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl text-foreground">企业指定课程</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            人力资源部从通用课程资源中心为您分配的学习内容
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ course, assignment }) => (
          <CourseCard
            key={course.id}
            course={course}
            required={assignment.required}
            hotel={hotel}
            onStartTraining={(mod) => setActiveModule(mod)}
          />
        ))}
      </div>
    </section>
  );
}

function CourseCard({
  course,
  required,
  hotel,
  onStartTraining,
}: {
  course: CatalogCourse;
  required: boolean;
  hotel: string;
  onStartTraining: (mod: HrTrainingModule) => void;
}) {
  const linkDelivery =
    course.delivery.type === "link" ? course.delivery : null;
  const isLink = linkDelivery !== null;
  const trainingDone =
    !isLink && isModuleCompleted(course.id);
  const trainingScore = !isLink ? getModuleScore(course.id) : 0;
  const linkDone = isLink && linkCourseCompleted(course.id);
  const done = isLink ? linkDone : trainingDone;

  return (
    <div
      className={cn(
        "card-elevated flex flex-col p-5 transition-all hover:-translate-y-0.5",
        done && "border-primary/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          {isLink ? <ExternalLink className="size-5" /> : <Video className="size-5" />}
        </span>
        <div className="flex flex-wrap gap-1">
          {required && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold text-accent">
              必修
            </span>
          )}
          {done && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-extrabold text-primary">
              <CheckCircle2 className="size-3" />
              {isLink ? "已访问" : `已完成 ${trainingScore}%`}
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-3 font-display text-lg text-foreground">{course.title}</h3>
      <p className="mt-1 flex-1 text-xs font-semibold text-muted-foreground">
        {course.description}
      </p>
      <p className="mt-2 text-[10px] font-bold text-muted-foreground">
        {LEARNING_PHASE_LABELS[course.phase]} · {ASK_SHORT[course.ask]} · ~
        {course.durationMinutes} 分钟
      </p>

      {linkDelivery ? (
        <Button className="mt-4 w-full" variant={done ? "outline" : "default"} asChild>
          <Link
            href={linkDelivery.href}
            onClick={() => markLinkCourseVisited(course.id)}
          >
            <BookOpen className="size-4" />
            {linkDelivery.linkLabel}
          </Link>
        </Button>
      ) : (
        <Button
          className="mt-4 w-full"
          variant={done ? "outline" : "default"}
          onClick={() => {
            const mod = catalogCourseToTrainingModule(course, hotel);
            if (mod) onStartTraining(mod);
          }}
        >
          <Play className="size-4" />
          {done ? "重新学习" : "开始学习"}
        </Button>
      )}
    </div>
  );
}
