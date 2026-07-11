"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Printer, Save, Trash2, X } from "lucide-react";

import { EmployeeCourseAssignPanel } from "@/components/admin/hr/employee-course-assign-panel";
import { EmployeeCourseStatsTable } from "@/components/admin/hr/employee-course-stats-table";
import { EmployeeLearningHistoryList } from "@/components/admin/hr/employee-learning-history-list";
import { ProbationReportDialog } from "@/components/admin/hr/probation-report-dialog";
import { Button } from "@/components/ui/button";
import { getDepartmentLabel, getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import {
  buildProbationLearningReport,
  formatReportDate,
} from "@/lib/hr/learning-record-builder";
import type {
  EmployeeDepartment,
  EmployeeLearningRecord,
  EmployeeUpdatePatch,
} from "@/lib/types/hr-admin";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
  PROBATION_DAYS_DEFAULT,
} from "@/lib/types/learning-record";

type EmployeeDraft = {
  nickname: string;
  role: string;
  department: EmployeeDepartment;
  status: EmployeeLearningRecord["status"];
  hireDate: string;
};

type Props = {
  employee: EmployeeLearningRecord;
  backHref: string;
  backLabel?: string;
  allEmployees?: EmployeeLearningRecord[];
  onSave?: (
    patch: EmployeeUpdatePatch
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDelete?: () => void;
  canAssignCourses?: boolean;
};

function draftFromEmployee(employee: EmployeeLearningRecord): EmployeeDraft {
  return {
    nickname: employee.nickname,
    role: employee.role,
    department: employee.department,
    status: employee.status,
    hireDate: employee.hireDate?.slice(0, 10) ?? "",
  };
}

function patchFromDraft(draft: EmployeeDraft): EmployeeUpdatePatch {
  const patch: EmployeeUpdatePatch = {
    nickname: draft.nickname.trim(),
    role: draft.role.trim(),
    department: draft.department,
    status: draft.status,
  };
  if (draft.hireDate) {
    patch.hireDate = new Date(draft.hireDate).toISOString();
    const probation = new Date(draft.hireDate);
    probation.setDate(probation.getDate() + PROBATION_DAYS_DEFAULT);
    patch.probationEndDate = probation.toISOString();
  } else {
    patch.hireDate = null;
    patch.probationEndDate = null;
  }
  return patch;
}

export function EmployeeLearningRecordView({
  employee,
  backHref,
  backLabel = "返回员工列表",
  allEmployees = [],
  onSave,
  onDelete,
  canAssignCourses = false,
}: Props) {
  const [reportOpen, setReportOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft>(() => draftFromEmployee(employee));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const departments = getHotelDepartments(employee.hotel);
  const report = buildProbationLearningReport(employee);

  useEffect(() => {
    setDraft(draftFromEmployee(employee));
    setEditing(false);
    setSaveError(null);
  }, [employee]);

  const handleStartEdit = () => {
    setDraft(draftFromEmployee(employee));
    setSaveError(null);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft(draftFromEmployee(employee));
    setSaveError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    if (!draft.nickname.trim()) {
      setSaveError("姓名为空");
      return;
    }
    if (!draft.role.trim()) {
      setSaveError("职位为空");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const result = await onSave(patchFromDraft(draft));
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setEditing(false);
  };

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          {backLabel}
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground md:text-3xl">
              {employee.nickname}
            </h1>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {employee.role} · {getDepartmentLabel(employee.hotel, employee.department)}
              {employee.isLiveUser && " · 本机实时同步"}
              {employee.isImported && !employee.isLiveUser && " · Excel 导入"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onSave && editing && (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="size-4" />
                  {saving ? "保存中…" : "保存"}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  <X className="size-4" />
                  取消
                </Button>
              </>
            )}
            {onSave && !editing && (
              <Button variant="outline" onClick={handleStartEdit}>
                <Pencil className="size-4" />
                编辑员工
              </Button>
            )}
            <Button variant="secondary" onClick={() => setReportOpen(true)}>
              <Printer className="size-4" />
              打印试用期档案
            </Button>
          </div>
        </div>

        {saveError && (
          <p className="mt-3 rounded-xl bg-red/10 px-3 py-2 text-sm font-bold text-red">
            {saveError}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {editing ? (
            <>
              <EditField label="姓名">
                <input
                  value={draft.nickname}
                  onChange={(e) => setDraft((d) => ({ ...d, nickname: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bold"
                />
              </EditField>
              <EditField label="职位">
                <input
                  value={draft.role}
                  onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bold"
                />
              </EditField>
              <EditField label="部门">
                <select
                  value={draft.department}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, department: e.target.value as EmployeeDepartment }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </EditField>
              <DetailItem label="手机号" value={employee.phone || "—"} />
              <EditField label="状态">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      status: e.target.value as EmployeeLearningRecord["status"],
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bold"
                >
                  <option value="new">新学员</option>
                  <option value="active">活跃</option>
                  <option value="inactive">未活跃</option>
                </select>
              </EditField>
              <EditField label="入职日期">
                <input
                  type="date"
                  value={draft.hireDate}
                  onChange={(e) => setDraft((d) => ({ ...d, hireDate: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bold"
                />
              </EditField>
            </>
          ) : (
            <>
              <DetailItem label="职位" value={employee.role} />
              <DetailItem
                label="部门"
                value={getDepartmentLabel(employee.hotel, employee.department)}
              />
              <DetailItem label="手机号" value={employee.phone || "—"} />
              <DetailItem label="入职日期" value={formatReportDate(report.hireDate)} />
              <DetailItem label="试用期至" value={formatReportDate(report.probationEndDate)} />
            </>
          )}
          <DetailItem label="CEFR 等级" value={employee.cefrLevel} />
          <DetailItem
            label="测评最高分"
            value={
              employee.assessmentScore > 0
                ? `${employee.assessmentScore} 分`
                : "未测评"
            }
          />
          <DetailItem
            label="通关级别"
            value={
              employee.passedAssessmentLevels.length > 0
                ? employee.passedAssessmentLevels.join("、")
                : "暂无"
            }
          />
          <DetailItem label="累计积分" value={String(employee.totalPoints)} />
          <DetailItem
            label="课程进度"
            value={`${employee.completedLessons} / ${employee.totalLessons} 关（${employee.courseProgressPercent}%）`}
          />
          <DetailItem
            label="最近活跃"
            value={new Date(employee.lastActiveAt).toLocaleString("zh-CN")}
          />
        </div>

        <section className="card-elevated mt-6 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-foreground">
                试用期学习路径 · ASK
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                入职培训 → 岗位学习 → 通用技能
              </p>
            </div>
            <p className="font-display text-3xl text-primary">
              {report.overallPercent}%
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {report.askSummary.map((ask) => (
              <div
                key={ask.dimension}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <p className="text-[10px] font-extrabold text-muted-foreground">
                  {ASK_SHORT[ask.dimension]}
                </p>
                <p className="text-sm font-extrabold text-foreground">
                  {ask.completed}/{ask.total} · {ask.percent}%
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {report.phases.map((phase) => (
              <div key={phase.phase}>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">
                    {LEARNING_PHASE_LABELS[phase.phase]}
                  </span>
                  <span className="text-muted-foreground">
                    {phase.completed}/{phase.total}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-secondary transition-all"
                    style={{ width: `${phase.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <EmployeeCourseStatsTable employee={employee} />

        {canAssignCourses && (
          <EmployeeCourseAssignPanel
            hotel={employee.hotel}
            employee={employee}
            allEmployees={allEmployees.length > 0 ? allEmployees : [employee]}
            canEdit={canAssignCourses}
          />
        )}

        <EmployeeLearningHistoryList employeeId={employee.id} />

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="mt-6 border-red/30 text-red hover:bg-red/10 hover:text-red"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            删除员工
          </Button>
        )}
      </div>

      <ProbationReportDialog
        employee={employee}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-border bg-white px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-foreground">{value}</p>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-white px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
