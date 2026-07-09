"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Eye,
  FileText,
  Film,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

import { HrTrainingLesson } from "@/components/grow-in-hotel/hr-training-lesson";
import { Button } from "@/components/ui/button";
import { generateManagementCourseFromTheme } from "@/lib/course/management-theme-generator";
import {
  processDocumentToModule,
  processVideoToModule,
  totalVideoDurationSec,
} from "@/lib/hr/document-processor";
import {
  addPlatformManagementCourse,
  getPlatformManagementCourses,
  removePlatformManagementCourse,
} from "@/lib/hr/platform-management-course-storage";
import { deleteTrainingVideo } from "@/lib/hr/training-video-storage";
import type { HrTrainingModule } from "@/lib/types/hr-training";
import {
  SUPPORTED_DOC_EXTENSIONS,
  SUPPORTED_VIDEO_EXTENSIONS,
} from "@/lib/types/hr-training";
import { ASK_SHORT, type AskDimension } from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

type UploadMode = "theme" | "video" | "document";

export function ManagementCourseAdmin() {
  const [mode, setMode] = useState<UploadMode>("theme");
  const [courses, setCourses] = useState<HrTrainingModule[]>([]);
  const [theme, setTheme] = useState("");
  const [brief, setBrief] = useState("");
  const [title, setTitle] = useState("");
  const [ask, setAsk] = useState<AskDimension>("skill");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<HrTrainingModule | null>(null);

  const refresh = useCallback(() => {
    setCourses(getPlatformManagementCourses());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("platform-management-courses-updated", refresh);
    return () =>
      window.removeEventListener("platform-management-courses-updated", refresh);
  }, [refresh]);

  const handleGenerate = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = theme.trim();
    if (!trimmed) {
      setError("请输入管理培训主题");
      return;
    }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      const course = generateManagementCourseFromTheme({
        theme: trimmed,
        brief,
        ask,
      });
      addPlatformManagementCourse(course);
      setTheme("");
      setBrief("");
      setSuccess(`已生成管理培训课程「${course.title}」，学员可在 Grow in Hotel 学习`);
      refresh();
    } catch {
      setError("生成失败，请重试");
    } finally {
      setProcessing(false);
    }
  };

  const handleVideoFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const course = await processVideoToModule({
        hotel: "platform",
        file,
        title: title || undefined,
        department: "all",
        phase: "management",
        ask,
        source: "platform",
      });
      addPlatformManagementCourse(course);
      setTitle("");
      setSuccess(`视频课程「${course.title}」已发布`);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "视频上传失败");
    } finally {
      setProcessing(false);
    }
  };

  const handleDocumentFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const course = await processDocumentToModule({
        hotel: "platform",
        file,
        title: title || undefined,
        department: "all",
        phase: "management",
        ask,
      });
      addPlatformManagementCourse({
        ...course,
        source: "platform",
        deliveryType: "slides",
      });
      setTitle("");
      setSuccess(
        `图文课程「${course.title}」已发布：${course.slideCount} 节讲解、${course.questionCount} 道测验`
      );
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "文档处理失败");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (course: HrTrainingModule) => {
    if (!window.confirm(`确定删除管理培训课程「${course.title}」？`)) return;
    removePlatformManagementCourse(course.id);
    if (course.deliveryType === "video") {
      await deleteTrainingVideo(course.id).catch(() => undefined);
    }
    refresh();
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>, kind: "video" | "document") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (kind === "video") void handleVideoFile(file);
    else void handleDocumentFile(file);
    e.target.value = "";
  };

  return (
    <>
    <div className="card-elevated border-2 border-accent/25 bg-gradient-to-br from-accent/5 to-white p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-[0_3px_0_0_rgba(0,0,0,0.15)]">
          <Briefcase className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg text-foreground">
            Management Training · 管理培训
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            主题自动生成、上传已有视频课或 PPT / Word 图文课，发布至 Grow in Hotel 管理培训模块
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            { id: "theme" as const, label: "主题生成", icon: Sparkles },
            { id: "video" as const, label: "上传视频课", icon: Film },
            { id: "document" as const, label: "上传图文课", icon: FileText },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setError(null);
              setSuccess(null);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition-colors",
              mode === id
                ? "bg-accent text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(mode === "video" || mode === "document") && (
          <label className="block sm:col-span-2">
            <span className="text-xs font-extrabold text-muted-foreground">
              课程标题（可选）
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="默认使用文件名"
              className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent"
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-extrabold text-muted-foreground">ASK 维度</span>
          <select
            value={ask}
            onChange={(e) => setAsk(e.target.value as AskDimension)}
            className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold outline-none focus:border-accent"
          >
            {(Object.keys(ASK_SHORT) as AskDimension[]).map((a) => (
              <option key={a} value={a}>
                {ASK_SHORT[a]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === "theme" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="text-xs font-extrabold text-foreground">管理培训主题 *</span>
            <input
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                setError(null);
              }}
              placeholder="例如：角色的认知与转化、跨部门协作与值班管理"
              className="mt-1.5 w-full rounded-xl border-2 border-border px-4 py-3 text-sm font-semibold outline-none focus:border-accent"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-xs font-extrabold text-muted-foreground">补充说明（可选）</span>
            <input
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="如：侧重主管层、包含 SBI 反馈与班前会演练"
              className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-accent"
            />
          </label>
          <div className="lg:col-span-2">
            <Button disabled={processing} onClick={() => void handleGenerate()}>
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  正在生成…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  自动生成管理培训课程
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {mode === "video" && (
        <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-10 transition-colors hover:border-accent hover:bg-accent/10">
          <input
            type="file"
            accept={SUPPORTED_VIDEO_EXTENSIONS.join(",")}
            className="hidden"
            disabled={processing}
            onChange={(e) => onFileInput(e, "video")}
          />
          {processing ? (
            <>
              <Loader2 className="size-10 animate-spin text-accent" />
              <p className="mt-3 text-sm font-extrabold text-foreground">正在上传视频…</p>
            </>
          ) : (
            <>
              <Upload className="size-10 text-accent" />
              <p className="mt-3 text-sm font-extrabold text-foreground">点击上传视频课程</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                支持 {SUPPORTED_VIDEO_EXTENSIONS.join("、")}，单文件 ≤ 80MB
              </p>
            </>
          )}
        </label>
      )}

      {mode === "document" && (
        <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-10 transition-colors hover:border-accent hover:bg-accent/10">
          <input
            type="file"
            accept={SUPPORTED_DOC_EXTENSIONS.join(",")}
            className="hidden"
            disabled={processing}
            onChange={(e) => onFileInput(e, "document")}
          />
          {processing ? (
            <>
              <Loader2 className="size-10 animate-spin text-accent" />
              <p className="mt-3 text-sm font-extrabold text-foreground">
                正在解析文档并生成图文课…
              </p>
            </>
          ) : (
            <>
              <Upload className="size-10 text-accent" />
              <p className="mt-3 text-sm font-extrabold text-foreground">
                点击上传 PPT / Word / 文本
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                支持 {SUPPORTED_DOC_EXTENSIONS.join("、")}，自动生成讲解与测验
              </p>
            </>
          )}
        </label>
      )}

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

      {courses.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-extrabold text-foreground">
            已发布管理培训课程（{courses.length}）
          </h3>
          <ul className="mt-3 space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{course.title}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    {course.deliveryType === "video" ? (
                      <>
                        <Video className="mr-0.5 inline size-3" />
                        视频课
                      </>
                    ) : (
                      <>
                        <FileText className="mr-0.5 inline size-3" />
                        {course.slideCount} 节图文 · {course.questionCount} 题
                      </>
                    )}
                    {" · "}
                    {ASK_SHORT[course.ask]}
                    {course.deliveryType !== "video" &&
                      ` · ~${Math.ceil(totalVideoDurationSec(course) / 60)} 分钟`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewCourse(course)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-extrabold text-accent hover:bg-accent/10"
                    aria-label="预览"
                  >
                    <Eye className="size-4" />
                    预览
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(course)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red/10 hover:text-red"
                    aria-label="删除"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {previewCourse && (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10 pb-10">
        <div className="relative w-full max-w-3xl">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-lg">
            <div>
              <p className="text-xs font-extrabold uppercase text-accent">学员端预览</p>
              <p className="font-display text-lg text-foreground">{previewCourse.title}</p>
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
