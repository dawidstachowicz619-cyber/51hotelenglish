"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Printer,
  Sprout,
  Target,
} from "lucide-react";

import { AssignedCatalogCourses } from "@/components/grow-in-hotel/assigned-catalog-courses";
import { HrTrainingSection } from "@/components/grow-in-hotel/hr-training-section";
import { ManagementTrainingSection } from "@/components/grow-in-hotel/management-training-section";
import { HrTrainingUpload } from "@/components/admin/hr/hr-training-upload";
import { ProbationReportDialog } from "@/components/admin/hr/probation-report-dialog";
import { UserProfileForm } from "@/components/points/user-profile-form";
import { Button } from "@/components/ui/button";
import {
  buildCurrentEmployeeRecord,
  loadEmployeeMeta,
  saveEmployeeMeta,
  type EmployeeMeta,
} from "@/lib/hr/current-employee-record";
import { canUploadHrTraining } from "@/lib/hr/hr-training-upload-access";
import { loadHrSession } from "@/lib/hr/hr-session";
import {
  getDepartmentLabel,
  getHotelDepartments,
} from "@/lib/hr/hotel-department-storage";
import {
  buildProbationLearningReport,
  formatReportDate,
} from "@/lib/hr/learning-record-builder";
import {
  type EmployeeDepartment,
  type EmployeeLearningRecord,
} from "@/lib/types/hr-admin";
import {
  ASK_LABELS,
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
  PROBATION_DAYS_DEFAULT,
} from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

const PHASE_ACTIONS = {
  onboarding: {
    href: "/assessment",
    label: "开始入职测评",
    icon: ClipboardCheck,
  },
  role: {
    href: "/courses/front-desk",
    label: "进入岗位课程",
    icon: BookOpen,
  },
  general: {
    href: "/courses",
    label: "通用技能学习",
    icon: Target,
  },
  management: {
    href: "/grow-in-hotel#management-training",
    label: "进入管理培训",
    icon: Briefcase,
  },
} as const;

const PHASE_NUMBER: Record<string, string> = {
  onboarding: "Phase 1",
  role: "Phase 2",
  general: "Phase 3",
  management: "Phase 4",
};

export function GrowInHotelPageContent() {
  const [employee, setEmployee] = useState<EmployeeLearningRecord | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [departments, setDepartments] = useState(() => getHotelDepartments("51HotelEnglish"));
  const [metaDraft, setMetaDraft] = useState<EmployeeMeta>({
    department: "reception",
    role: "学员",
    hireDate: new Date().toISOString().slice(0, 10),
  });
  const [showSetup, setShowSetup] = useState(false);
  const [canUploadTraining, setCanUploadTraining] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(() => {
    const record = buildCurrentEmployeeRecord();
    setEmployee(record);
    if (record) {
      setCanUploadTraining(canUploadHrTraining(record, loadHrSession()));
    } else {
      setCanUploadTraining(false);
    }
    if (record?.hotel) {
      setDepartments(getHotelDepartments(record.hotel));
    }
    const meta = loadEmployeeMeta();
    if (meta) {
      setMetaDraft(meta);
      setShowSetup(false);
    } else if (record && record.hotel === "51HotelEnglish") {
      const depts = getHotelDepartments(record.hotel);
      setMetaDraft((m) => ({
        ...m,
        department: depts[0]?.id ?? m.department,
      }));
      setShowSetup(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    setInitialized(true);
    window.addEventListener("course-progress-updated", refresh);
    window.addEventListener("assessment-updated", refresh);
    window.addEventListener("employee-meta-updated", refresh);
    window.addEventListener("hotel-departments-updated", refresh);
    window.addEventListener("points-updated", refresh);
    return () => {
      window.removeEventListener("course-progress-updated", refresh);
      window.removeEventListener("assessment-updated", refresh);
      window.removeEventListener("employee-meta-updated", refresh);
      window.removeEventListener("hotel-departments-updated", refresh);
      window.removeEventListener("points-updated", refresh);
    };
  }, [refresh]);

  const handleSaveMeta = () => {
    const hire = new Date(metaDraft.hireDate ?? new Date());
    const probationEnd = new Date(hire);
    probationEnd.setDate(probationEnd.getDate() + PROBATION_DAYS_DEFAULT);
    saveEmployeeMeta({
      ...metaDraft,
      hireDate: hire.toISOString(),
      probationEndDate: probationEnd.toISOString(),
    });
    refresh();
  };

  if (!initialized) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 text-center lg:px-8">
        <p className="font-bold text-muted-foreground">加载中…</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-24 pt-24 lg:px-8">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_4px_0_0_var(--primary-dark)]">
            <Sprout className="size-7" strokeWidth={2.25} />
          </span>
          <h1 className="mt-6 font-display text-3xl text-foreground">
            请先完善学员档案
          </h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">
            填写昵称与所在酒店后，即可开始 Grow in Hotel 成长计划、查看 HR 培训课程与学习路径。
          </p>
        </div>
        <div className="mt-8">
          <UserProfileForm onComplete={refresh} />
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">
          也可前往
          <Link href="/profile" className="mx-1 font-extrabold text-primary hover:underline">
            个人档案
          </Link>
          页面完善信息
        </p>
      </div>
    );
  }

  const report = buildProbationLearningReport(employee);

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-24 lg:px-8">
        <header className="rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary-light/40 to-white p-8 md:p-10">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_4px_0_0_var(--primary-dark)]">
              <Sprout className="size-7" strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
                Grow in Hotel
              </p>
              <h1 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
                酒店人才成长计划
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-muted-foreground">
                从入职培训到在岗学习，按岗位职责完成
                <span className="font-extrabold text-foreground">
                  {" "}
                  ASK（态度 · 知识 · 技能）
                </span>
                三维度成长。试用期结束后可打印学习档案，放入转正材料。主管与储备干部可完成
                <span className="font-extrabold text-foreground"> Management Training </span>
                管理培训模块。
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatPill label="学员" value={employee.nickname} />
            <StatPill
              label="岗位"
              value={`${getDepartmentLabel(employee.hotel, employee.department)} · ${employee.role}`}
            />
            <StatPill label="整体完成度" value={`${report.overallPercent}%`} highlight />
          </div>
        </header>

        {showSetup && (
          <section className="card-elevated mt-6 p-6">
            <h2 className="font-display text-lg text-foreground">完善岗位信息</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              请选择您的部门与入职日期，以便生成准确的学习路径与试用期档案。
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-extrabold text-muted-foreground">部门</span>
                <select
                  value={metaDraft.department}
                  onChange={(e) =>
                    setMetaDraft((m) => ({
                      ...m,
                      department: e.target.value as EmployeeDepartment,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-extrabold text-muted-foreground">职位</span>
                <input
                  value={metaDraft.role}
                  onChange={(e) =>
                    setMetaDraft((m) => ({ ...m, role: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold"
                  placeholder="如：礼宾专员"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-extrabold text-muted-foreground">入职日期</span>
                <input
                  type="date"
                  value={metaDraft.hireDate?.slice(0, 10) ?? ""}
                  onChange={(e) =>
                    setMetaDraft((m) => ({ ...m, hireDate: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold"
                />
              </label>
            </div>
            <Button className="mt-4" onClick={handleSaveMeta}>
              保存并开始学习
            </Button>
          </section>
        )}

        <section className="mt-8">
          <AssignedCatalogCourses
            hotel={employee.hotel}
            department={
              employee.department === "other" ? "reception" : employee.department
            }
          />
        </section>

        {canUploadTraining && (
          <section className="mt-8">
            <HrTrainingUpload hotel={employee.hotel} variant="grow" />
          </section>
        )}

        <section className="mt-8">
          <ManagementTrainingSection
            hotel={employee.hotel}
            department={
              employee.department === "other" ? "reception" : employee.department
            }
            employeeRole={employee.role}
          />
        </section>

        <section className="mt-8">
          <HrTrainingSection
            hotel={employee.hotel}
            department={
              employee.department === "other" ? "reception" : employee.department
            }
          />
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl text-foreground">ASK 成长概览</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Attitude · Skill · Knowledge
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {report.askSummary.map((ask) => (
              <div key={ask.dimension} className="card-elevated p-5">
                <p className="text-xs font-extrabold text-muted-foreground">
                  {ASK_LABELS[ask.dimension]}
                </p>
                <p className="mt-2 font-display text-3xl text-foreground">{ask.percent}%</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  {ask.completed} / {ask.total} 项已完成
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${ask.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="font-display text-xl text-foreground">学习路径</h2>

          {report.phases.map((phase) => {
            const action = PHASE_ACTIONS[phase.phase];
            const Icon = action.icon;
            const preview = phase.items.slice(0, 4);

            return (
              <div key={phase.phase} className="card-elevated overflow-hidden">
                <div className="flex flex-col gap-4 border-b-2 border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase text-primary">
                      {PHASE_NUMBER[phase.phase] ?? "Phase"}
                    </p>
                    <h3 className="font-display text-lg text-foreground">
                      {LEARNING_PHASE_LABELS[phase.phase]}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {phase.completed} / {phase.total} 已完成 · {phase.percent}%
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={action.href}>
                      <Icon className="size-4" />
                      {action.label}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>

                <ul className="divide-y divide-border">
                  {preview.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground">
                          {ASK_SHORT[item.ask]} · {item.subtitle}
                        </p>
                      </div>
                      <StatusDot status={item.status} />
                    </li>
                  ))}
                  {phase.items.length > 4 && (
                    <li className="px-5 py-2 text-center text-xs font-bold text-muted-foreground">
                      还有 {phase.items.length - 4} 项…
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl border-2 border-secondary/30 bg-secondary/5 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl text-foreground">试用期学习档案</h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                入职 {formatReportDate(report.hireDate)} · 试用期至{" "}
                {formatReportDate(report.probationEndDate)}
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
                {report.recommendation}
              </p>
            </div>
            <Button size="lg" variant="secondary" onClick={() => setReportOpen(true)}>
              <Printer className="size-5" />
              打印学习档案
            </Button>
          </div>
        </section>
      </div>

      <ProbationReportDialog
        employee={employee}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}

function StatPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-border bg-white/80 px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm font-extrabold",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusDot({
  status,
}: {
  status: "completed" | "in_progress" | "not_started";
}) {
  const colors = {
    completed: "bg-primary",
    in_progress: "bg-accent",
    not_started: "bg-border",
  };
  const labels = {
    completed: "已完成",
    in_progress: "进行中",
    not_started: "未开始",
  };
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground">
      <span className={cn("size-2 rounded-full", colors[status])} />
      {labels[status]}
    </span>
  );
}
