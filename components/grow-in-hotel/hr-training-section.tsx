"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Play, Video } from "lucide-react";

import { HrTrainingLesson } from "@/components/grow-in-hotel/hr-training-lesson";
import { Button } from "@/components/ui/button";
import { getDepartmentLabel } from "@/lib/hr/hotel-department-storage";
import { totalVideoDurationSec } from "@/lib/hr/document-processor";
import { getVisibleTrainingModules } from "@/lib/hr/training-storage";
import {
  getModuleScore,
  isModuleCompleted,
} from "@/lib/hr/training-progress-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
} from "@/lib/types/learning-record";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import { cn } from "@/lib/utils";

type HrTrainingSectionProps = {
  hotel: string;
  department: EmployeeDepartment;
};

export function HrTrainingSection({ hotel, department }: HrTrainingSectionProps) {
  const [modules, setModules] = useState<HrTrainingModule[]>([]);
  const [active, setActive] = useState<HrTrainingModule | null>(null);
  const [, tick] = useState(0);

  const refresh = useCallback(() => {
    setModules(
      getVisibleTrainingModules(hotel, department).filter(
        (m) => m.phase !== "management"
      )
    );
    tick((n) => n + 1);
  }, [hotel, department]);

  useEffect(() => {
    refresh();
    window.addEventListener("hr-training-updated", refresh);
    window.addEventListener("employee-training-updated", refresh);
    return () => {
      window.removeEventListener("hr-training-updated", refresh);
      window.removeEventListener("employee-training-updated", refresh);
    };
  }, [refresh]);

  if (active) {
    return (
      <HrTrainingLesson
        module={active}
        onBack={() => setActive(null)}
        onComplete={() => {
          setActive(null);
          refresh();
        }}
      />
    );
  }

  if (modules.length === 0) {
    return (
      <section className="card-elevated p-6 text-center">
        <BookOpen className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-display text-lg text-foreground">HR 培训课程</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          人力资源部上传 PPT / 文档后，将在此显示为讲解课与测验
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl text-foreground">HR 培训课程</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          人力资源部上传 PPT / 文档 · 自动生成讲解课与测验
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => {
          const done = isModuleCompleted(mod.id);
          const score = getModuleScore(mod.id);
          const mins = Math.max(1, Math.ceil(totalVideoDurationSec(mod) / 60));

          return (
            <div
              key={mod.id}
              className={cn(
                "card-elevated flex flex-col p-5 transition-all hover:-translate-y-0.5",
                done && "border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <Video className="size-5" />
                </span>
                {done && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-extrabold text-primary">
                    <CheckCircle2 className="size-3" />
                    已完成 {score}%
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-display text-lg text-foreground">
                {mod.title}
              </h3>
              <p className="mt-1 flex-1 text-xs font-semibold text-muted-foreground">
                {mod.slideCount} 节视频 · {mod.questionCount} 道测验 · ~{mins}{" "}
                分钟
              </p>
              <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                {LEARNING_PHASE_LABELS[mod.phase]} · {ASK_SHORT[mod.ask]}
                {mod.department !== "all" &&
                  ` · ${getDepartmentLabel(hotel, mod.department)}`}
              </p>

              <Button
                className="mt-4 w-full"
                variant={done ? "outline" : "default"}
                onClick={() => setActive(mod)}
              >
                <Play className="size-4" />
                {done ? "重新学习" : "开始学习"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
