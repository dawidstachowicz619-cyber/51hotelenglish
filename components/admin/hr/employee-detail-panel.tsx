"use client";

import { useState } from "react";
import { Printer, Trash2, X } from "lucide-react";

import { ProbationReportDialog } from "@/components/admin/hr/probation-report-dialog";
import { EmployeeCourseStatsTable } from "@/components/admin/hr/employee-course-stats-table";
import { Button } from "@/components/ui/button";
import { getDepartmentLabel } from "@/lib/hr/hotel-department-storage";
import {
  buildProbationLearningReport,
  formatReportDate,
} from "@/lib/hr/learning-record-builder";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import {
  ASK_SHORT,
  LEARNING_PHASE_LABELS,
} from "@/lib/types/learning-record";

type EmployeeDetailPanelProps = {
  employee: EmployeeLearningRecord;
  onClose: () => void;
  onDelete?: () => void;
};

export function EmployeeDetailPanel({
  employee,
  onClose,
  onDelete,
}: EmployeeDetailPanelProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const report = buildProbationLearningReport(employee);

  return (
    <>
      <div className="card-elevated p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl text-foreground">
              {employee.nickname}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">
              {employee.role} · {getDepartmentLabel(employee.hotel, employee.department)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="关闭"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailItem label="职位" value={employee.role} />
          <DetailItem label="部门" value={getDepartmentLabel(employee.hotel, employee.department)} />
          <DetailItem label="手机号" value={employee.phone || "—"} />
          <DetailItem label="入职日期" value={formatReportDate(report.hireDate)} />
          <DetailItem
            label="试用期至"
            value={formatReportDate(report.probationEndDate)}
          />
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
        </div>

        <section className="mt-6 rounded-xl border-2 border-secondary/20 bg-secondary/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-foreground">
                试用期学习路径 · ASK
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                入职培训 → 岗位学习 → 通用技能（态度 / 知识 / 技能）
              </p>
            </div>
            <p className="font-display text-2xl text-primary">
              {report.overallPercent}%
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {report.askSummary.map((ask) => (
              <div
                key={ask.dimension}
                className="rounded-lg border border-border bg-white px-3 py-2"
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

          <Button
            className="mt-4 w-full"
            variant="secondary"
            onClick={() => setReportOpen(true)}
          >
            <Printer className="size-4" />
            打印试用期学习档案
          </Button>
        </section>

        <EmployeeCourseStatsTable employee={employee} />

        <div className="mt-4">
          <p className="text-xs font-extrabold text-muted-foreground">
            学习进度
          </p>
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${employee.courseProgressPercent}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold text-muted-foreground">
          最近活跃：{" "}
          {new Date(employee.lastActiveAt).toLocaleString("zh-CN")}
          {employee.isLiveUser && " · 数据来自本设备实时同步"}
          {employee.isImported && !employee.isLiveUser && " · Excel 导入"}
        </p>

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="mt-6 w-full border-red/30 text-red hover:bg-red/10 hover:text-red"
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
    <div className="rounded-xl border-2 border-border bg-muted/30 px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-foreground">{value}</p>
    </div>
  );
}
