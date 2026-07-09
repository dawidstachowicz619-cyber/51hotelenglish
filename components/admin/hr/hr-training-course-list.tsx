"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  Trash2,
  UserPlus,
  Video,
  X,
} from "lucide-react";

import { HrTrainingLesson } from "@/components/grow-in-hotel/hr-training-lesson";
import { Button } from "@/components/ui/button";
import { totalVideoDurationSec } from "@/lib/hr/document-processor";
import { getDepartmentLabel } from "@/lib/hr/hotel-department-storage";
import {
  removeHotelTrainingModule,
  updateHotelTrainingModule,
} from "@/lib/hr/training-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import type { HotelDepartment } from "@/lib/types/hotel-department";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import { ASK_SHORT, LEARNING_PHASE_LABELS } from "@/lib/types/learning-record";

type HrTrainingCourseListProps = {
  hotel: string;
  modules: HrTrainingModule[];
  departments: HotelDepartment[];
  onRefresh: () => void;
  /** grow 模式隐藏删除 */
  allowDelete?: boolean;
  title?: string;
};

export function HrTrainingCourseList({
  hotel,
  modules,
  departments,
  onRefresh,
  allowDelete = true,
  title = "已发布课程",
}: HrTrainingCourseListProps) {
  const [previewCourse, setPreviewCourse] = useState<HrTrainingModule | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [assignDept, setAssignDept] = useState<EmployeeDepartment | "all">("all");

  const handleDelete = (mod: HrTrainingModule) => {
    if (!window.confirm(`确定删除培训课程「${mod.title}」？`)) return;
    removeHotelTrainingModule(hotel, mod.id);
    onRefresh();
  };

  const handleAssign = (mod: HrTrainingModule) => {
    updateHotelTrainingModule(hotel, mod.id, { department: assignDept });
    setAssignTarget(null);
    onRefresh();
  };

  const openAssign = (mod: HrTrainingModule) => {
    setAssignTarget(mod.id);
    setAssignDept(mod.department);
  };

  if (modules.length === 0) return null;

  return (
    <>
      <div className="mt-8">
        <h3 className="text-sm font-extrabold text-foreground">
          {title}（{modules.length}）
        </h3>
        <ul className="mt-3 space-y-3">
          {modules.map((mod) => (
            <li
              key={mod.id}
              className="rounded-xl border-2 border-border px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{mod.title}</p>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                    {mod.deliveryType === "video" ? (
                      <>
                        <Video className="mr-0.5 inline size-3" />
                        视频课 · {mod.questionCount} 题
                      </>
                    ) : (
                      <>
                        <FileText className="mr-0.5 inline size-3" />
                        {mod.slideCount} 节讲解 · {mod.questionCount} 题 · ~
                        {Math.ceil(totalVideoDurationSec(mod) / 60)} 分钟
                      </>
                    )}
                    {" · "}
                    {LEARNING_PHASE_LABELS[mod.phase]} · {ASK_SHORT[mod.ask]}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold text-primary">
                    <CheckCircle2 className="size-3" />
                    已分配：
                    {mod.department === "all"
                      ? "全酒店 / 全部岗位"
                      : getDepartmentLabel(hotel, mod.department)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewCourse(mod)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-extrabold text-secondary hover:bg-secondary/10"
                  >
                    <Eye className="size-4" />
                    预览
                  </button>
                  <button
                    type="button"
                    onClick={() => openAssign(mod)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-extrabold text-primary hover:bg-primary-light/40"
                  >
                    <UserPlus className="size-4" />
                    分配
                  </button>
                  {allowDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(mod)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red/10 hover:text-red"
                      aria-label="删除"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {assignTarget === mod.id && (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
                  <label className="flex flex-1 items-center gap-2 text-xs font-bold text-muted-foreground">
                    分配给
                    <select
                      value={assignDept}
                      onChange={(e) =>
                        setAssignDept(e.target.value as EmployeeDepartment | "all")
                      }
                      className="flex-1 rounded-lg border-2 border-border px-2 py-1.5 text-sm font-bold outline-none focus:border-primary"
                    >
                      <option value="all">全酒店 / 全部岗位</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAssign(mod)}>
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
              )}
            </li>
          ))}
        </ul>
      </div>

      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10 pb-10">
          <div className="relative w-full max-w-3xl">
            <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-lg">
              <div>
                <p className="text-xs font-extrabold uppercase text-secondary">
                  课程预览
                </p>
                <p className="font-display text-lg text-foreground">
                  {previewCourse.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCourse(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="关闭预览"
              >
                <X className="size-5" />
              </button>
            </div>
            <HrTrainingLesson
              module={previewCourse}
              preview
              onBack={() => setPreviewCourse(null)}
              onComplete={() => setPreviewCourse(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
