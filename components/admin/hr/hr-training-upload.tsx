"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { processDocumentToModule, totalVideoDurationSec } from "@/lib/hr/document-processor";
import {
  getDepartmentLabel,
  getHotelDepartments,
} from "@/lib/hr/hotel-department-storage";
import {
  addHotelTrainingModule,
  getHotelTrainingModules,
  removeHotelTrainingModule,
} from "@/lib/hr/training-storage";
import type { EmployeeDepartment } from "@/lib/types/hr-admin";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
  type AskDimension,
  type LearningPhase,
} from "@/lib/types/learning-record";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import { SUPPORTED_DOC_EXTENSIONS } from "@/lib/types/hr-training";

type HrTrainingUploadProps = {
  hotel: string;
};

export function HrTrainingUpload({ hotel }: HrTrainingUploadProps) {
  const [modules, setModules] = useState<HrTrainingModule[]>([]);
  const [departments, setDepartments] = useState(() => getHotelDepartments(hotel));
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<EmployeeDepartment | "all">("all");
  const [phase, setPhase] = useState<LearningPhase>("onboarding");
  const [ask, setAsk] = useState<AskDimension>("knowledge");
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

  const handleFile = async (file: File) => {
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
        `已生成视频课 ${module.slideCount} 节、测试题 ${module.questionCount} 道，员工可在 Grow in Hotel 学习`
      );
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "文档处理失败");
    } finally {
      setProcessing(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  const handleDelete = (mod: HrTrainingModule) => {
    if (!window.confirm(`确定删除培训课程「${mod.title}」？`)) return;
    removeHotelTrainingModule(hotel, mod.id);
    refresh();
  };

  const accept = SUPPORTED_DOC_EXTENSIONS.join(",");

  return (
    <div className="card-elevated p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white shadow-[0_3px_0_0_var(--secondary-dark)]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl text-foreground">培训文档上传</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            上传 Word / 文本，系统自动生成
            <span className="font-extrabold text-secondary"> 视频讲解课 </span>
            与
            <span className="font-extrabold text-secondary"> 测验题 </span>
            ，发布至 Grow in Hotel
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="课程标题（可选）">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="默认使用文件名"
            className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
          />
        </Field>
        <Field label="适用部门">
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
              正在解析文档并生成视频课与测验…
            </p>
          </>
        ) : (
          <>
            <Upload className="size-10 text-secondary" />
            <p className="mt-3 text-sm font-extrabold text-foreground">
              点击上传培训文档
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              支持 {SUPPORTED_DOC_EXTENSIONS.join("、")}
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

      {modules.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-extrabold text-foreground">
            已发布课程（{modules.length}）
          </h3>
          <ul className="mt-3 space-y-2">
            {modules.map((mod) => (
              <li
                key={mod.id}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{mod.title}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    <Video className="mr-0.5 inline size-3" />
                    {mod.slideCount} 节视频 · {mod.questionCount} 题 ·{" "}
                    {LEARNING_PHASE_LABELS[mod.phase]} · {ASK_SHORT[mod.ask]} ·{" "}
                    {mod.department === "all"
                      ? "全员"
                      : getDepartmentLabel(hotel, mod.department)}
                    {" · ~"}
                    {Math.ceil(totalVideoDurationSec(mod) / 60)} 分钟
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(mod)}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-red/10 hover:text-red"
                  aria-label="删除"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modules.length === 0 && !processing && (
        <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <FileText className="size-4" />
          尚未上传课程。员工端将显示演示课程，上传后自动替换。
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
