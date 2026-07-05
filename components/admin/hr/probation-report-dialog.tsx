"use client";

import { Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDepartmentLabel } from "@/lib/hr/hotel-department-storage";
import {
  buildProbationLearningReport,
  formatReportDate,
} from "@/lib/hr/learning-record-builder";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import {
  ASK_LABELS,
  LEARNING_PHASE_LABELS,
} from "@/lib/types/learning-record";
import { cn } from "@/lib/utils";

type ProbationReportDialogProps = {
  employee: EmployeeLearningRecord;
  open: boolean;
  onClose: () => void;
};

export function ProbationReportDialog({
  employee,
  open,
  onClose,
}: ProbationReportDialogProps) {
  if (!open) return null;

  const report = buildProbationLearningReport(employee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 print:relative print:inset-auto print:block print:bg-white print:p-0">
      <div className="probation-report my-4 w-full max-w-4xl rounded-2xl bg-white shadow-xl print:my-0 print:max-w-none print:rounded-none print:shadow-none">
        <div className="flex items-center justify-between border-b-2 border-border px-6 py-4 print:hidden">
          <div>
            <h2 className="font-display text-xl text-foreground">
              试用期学习档案
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {employee.nickname} · 可打印放入试用期材料
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={handlePrint}>
              <Printer className="size-4" />
              打印
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              aria-label="关闭"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="p-8 print:p-10">
          <header className="border-b-2 border-foreground pb-6 text-center">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              51HotelEnglish · 员工试用期在线学习记录
            </p>
            <h1 className="mt-2 font-display text-2xl text-foreground print:text-3xl">
              试用期学习档案
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {employee.hotel}
            </p>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <InfoCell label="姓名" value={employee.nickname} />
            <InfoCell label="部门" value={getDepartmentLabel(employee.hotel, employee.department)} />
            <InfoCell label="职位" value={employee.role} />
            <InfoCell label="手机号" value={employee.phone || "—"} />
            <InfoCell label="入职日期" value={formatReportDate(report.hireDate)} />
            <InfoCell
              label="试用期至"
              value={formatReportDate(report.probationEndDate)}
            />
            <InfoCell label="档案生成日期" value={formatReportDate(report.generatedAt)} />
            <InfoCell
              label="整体完成度"
              value={`${report.overallPercent}%`}
              highlight
            />
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              ASK 三维度学习概览
            </h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              态度 (Attitude) · 技能 (Skill) · 知识 (Knowledge)
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {report.askSummary.map((ask) => (
                <div
                  key={ask.dimension}
                  className="rounded-xl border-2 border-border px-4 py-3"
                >
                  <p className="text-xs font-extrabold text-muted-foreground">
                    {ASK_LABELS[ask.dimension]}
                  </p>
                  <p className="mt-1 font-display text-2xl text-foreground">
                    {ask.percent}%
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    已完成 {ask.completed} / {ask.total} 项
                  </p>
                </div>
              ))}
            </div>
          </section>

          {report.phases.map((phase) => (
            <section key={phase.phase} className="mt-8 break-inside-avoid">
              <div className="flex items-end justify-between border-b border-border pb-2">
                <h2 className="font-display text-lg text-foreground">
                  {phase.label}
                </h2>
                <p className="text-xs font-extrabold text-primary">
                  {phase.completed}/{phase.total} · {phase.percent}%
                </p>
              </div>
              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-extrabold uppercase text-muted-foreground">
                    <th className="pb-2 pr-2">ASK</th>
                    <th className="pb-2 pr-2">学习项目</th>
                    <th className="pb-2 pr-2">状态</th>
                    <th className="pb-2">完成日期</th>
                  </tr>
                </thead>
                <tbody>
                  {phase.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-border/60 text-xs"
                    >
                      <td className="py-2 pr-2 font-extrabold text-muted-foreground">
                        {ASK_LABELS[item.ask].split(" ")[0]}
                      </td>
                      <td className="py-2 pr-2">
                        <p className="font-bold text-foreground">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-[10px] font-semibold text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-2 font-semibold text-muted-foreground">
                        {item.completedAt
                          ? formatReportDate(item.completedAt)
                          : "—"}
                        {item.score != null && (
                          <span className="ml-1 text-foreground">
                            ({item.score}分)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}

          <section className="mt-10 rounded-xl border-2 border-primary/20 bg-primary-light/20 p-5 break-inside-avoid">
            <h2 className="text-sm font-extrabold text-foreground">
              主管评语 / 转正建议
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
              {report.recommendation}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-8 print:mt-12">
              <SignatureLine label="员工签字" />
              <SignatureLine label="直属主管签字" />
            </div>
            <div className="mt-6">
              <SignatureLine label="人力资源部确认" />
            </div>
          </section>

          <p className="mt-8 text-center text-[10px] font-semibold text-muted-foreground print:mt-12">
            本档案由 51HotelEnglish 平台自动生成 · 数据来源：在线学习记录、CEFR
            测评与岗位闯关进度
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-extrabold",
          highlight ? "text-primary text-lg" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "completed" | "in_progress" | "not_started";
}) {
  const labels = {
    completed: "已完成",
    in_progress: "进行中",
    not_started: "未开始",
  };
  const styles = {
    completed: "text-primary",
    in_progress: "text-accent",
    not_started: "text-muted-foreground",
  };
  return (
    <span className={cn("font-extrabold", styles[status])}>
      {labels[status]}
    </span>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold text-muted-foreground">{label}</p>
      <div className="mt-8 border-b border-foreground" />
      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
        日期：__________
      </p>
    </div>
  );
}
