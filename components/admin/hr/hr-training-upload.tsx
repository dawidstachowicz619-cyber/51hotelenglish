"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Film,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";

import { HrTrainingCourseList } from "@/components/admin/hr/hr-training-course-list";
import { processDocumentToModule, processVideoToModule } from "@/lib/hr/document-processor";
import { getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import {
  addHotelTrainingModule,
  getHotelTrainingModules,
} from "@/lib/hr/training-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
  type AskDimension,
  type LearningPhase,
} from "@/lib/types/learning-record";
import {
  SUPPORTED_DOC_EXTENSIONS,
  SUPPORTED_VIDEO_EXTENSIONS,
} from "@/lib/types/hr-training";
import { cn } from "@/lib/utils";

type HrTrainingUploadProps = {
  hotel: string;
  variant?: "admin" | "grow";
};

type UploadKind = "document" | "video";

export function HrTrainingUpload({ hotel, variant = "admin" }: HrTrainingUploadProps) {
  const [modules, setModules] = useState(() => getHotelTrainingModules(hotel));
  const [departments, setDepartments] = useState(() => getHotelDepartments(hotel));
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<EmployeeDepartment | "all">("all");
  const [phase, setPhase] = useState<LearningPhase>("onboarding");
  const [ask, setAsk] = useState<AskDimension>("knowledge");
  const [uploadKind, setUploadKind] = useState<UploadKind>("document");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setModules(getHotelTrainingModules(hotel));
  }, [hotel]);

  useEffect(() => {
    refresh();
    window.addEventListener("hr-training-updated", refresh);
    return () => window.removeEventListener("hr-training-updated", refresh);
  }, [refresh]);

  useEffect(() => {
    setDepartments(getHotelDepartments(hotel));
    const onDepts = () => setDepartments(getHotelDepartments(hotel));
    window.addEventListener("hotel-departments-updated", onDepts);
    return () => window.removeEventListener("hotel-departments-updated", onDepts);
  }, [hotel]);

  const handleDocumentFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const module = await processDocumentToModule({
        hotel,
        file,
        title: title || undefined,
        department,
        phase,
        ask,
      });
      addHotelTrainingModule(module);
      setTitle("");
      setSuccess(
        `已生成课程「${module.title}」：${module.slideCount} 节讲解、${module.questionCount} 道测验。可在下方预览并分配给员工。`
      );
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "文档处理失败");
    } finally {
      setProcessing(false);
    }
  };

  const handleVideoFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const module = await processVideoToModule({
        hotel,
        file,
        title: title || undefined,
        department,
        phase,
        ask,
        source: "hr",
      });
      addHotelTrainingModule(module);
      setTitle("");
      setSuccess(`视频课程「${module.title}」已上传，可在下方预览并分配给员工。`);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "视频上传失败");
    } finally {
      setProcessing(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadKind === "video") void handleVideoFile(file);
    else void handleDocumentFile(file);
    e.target.value = "";
  };

  const isGrow = variant === "grow";
  const accept =
    uploadKind === "video"
      ? SUPPORTED_VIDEO_EXTENSIONS.join(",")
      : SUPPORTED_DOC_EXTENSIONS.join(",");

  return (
    <div
      className={cn(
        "card-elevated p-6",
        isGrow && "border-2 border-secondary/25 bg-gradient-to-br from-secondary/5 to-white"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white shadow-[0_3px_0_0_var(--secondary-dark)]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl text-foreground">
            {isGrow ? "上传培训文档 · 自动生成课程" : "培训文档上传"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            上传 PPT / Word / 视频，自动生成讲解课与测验；上传后可在下方
            <span className="font-extrabold text-secondary"> 预览 </span>
            并
            <span className="font-extrabold text-secondary"> 分配 </span>
            给指定部门员工
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUploadKind("document")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold",
            uploadKind === "document"
              ? "bg-secondary text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <FileText className="size-3.5" />
          图文 / PPT
        </button>
        <button
          type="button"
          onClick={() => setUploadKind("video")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold",
            uploadKind === "video"
              ? "bg-secondary text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Film className="size-3.5" />
          视频课
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="课程标题（可选）">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="默认使用文件名"
            className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
          />
        </Field>
        <Field label="默认分配部门">
          <select
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value as EmployeeDepartment | "all")
            }
            className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold outline-none focus:border-secondary"
          >
            <option value="all">全酒店 / 全部岗位</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="学习阶段">
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value as LearningPhase)}
            className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold outline-none focus:border-secondary"
          >
            {(Object.keys(LEARNING_PHASE_LABELS) as LearningPhase[]).map((p) => (
              <option key={p} value={p}>
                {LEARNING_PHASE_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ASK 维度">
          <select
            value={ask}
            onChange={(e) => setAsk(e.target.value as AskDimension)}
            className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold outline-none focus:border-secondary"
          >
            {(Object.keys(ASK_SHORT) as AskDimension[]).map((a) => (
              <option key={a} value={a}>
                {ASK_SHORT[a]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-secondary/40 bg-secondary/5 px-6 py-10 transition-colors hover:border-secondary hover:bg-secondary/10">
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={processing}
          onChange={onInputChange}
        />
        {processing ? (
          <>
            <Loader2 className="size-10 animate-spin text-secondary" />
            <p className="mt-3 text-sm font-extrabold text-foreground">
              {uploadKind === "video" ? "正在上传视频…" : "正在解析文档并生成课程…"}
            </p>
          </>
        ) : (
          <>
            <Upload className="size-10 text-secondary" />
            <p className="mt-3 text-sm font-extrabold text-foreground">
              {uploadKind === "video"
                ? "点击上传视频课程"
                : "点击上传 PPT 或培训文档"}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {uploadKind === "video"
                ? `支持 ${SUPPORTED_VIDEO_EXTENSIONS.join("、")}，≤ 80MB`
                : `支持 ${SUPPORTED_DOC_EXTENSIONS.join("、")}（PPT 请使用 .pptx）`}
            </p>
          </>
        )}
      </label>

      {error && (
        <p className="mt-4 rounded-xl bg-red/10 px-4 py-2 text-sm font-bold text-red">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-xl bg-primary-light/50 px-4 py-2 text-sm font-bold text-primary">
          {success}
        </p>
      )}

      <HrTrainingCourseList
        hotel={hotel}
        modules={modules}
        departments={departments}
        onRefresh={refresh}
        allowDelete={!isGrow}
        title={isGrow ? "我上传的课程" : "已发布课程"}
      />

      {modules.length === 0 && !processing && (
        <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <FileText className="size-4" />
          尚未上传课程。上传后可在此预览、分配部门，员工在 Grow in Hotel 对应板块学习。
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
