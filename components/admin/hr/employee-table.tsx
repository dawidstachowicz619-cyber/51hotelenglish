"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, Trash2 } from "lucide-react";

import { getDepartmentLabel, getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import type { EmployeeDepartment, EmployeeLearningRecord } from "@/lib/types/hr-admin";
import { cn } from "@/lib/utils";

type EmployeeTableProps = {
  hotel: string;
  employees: EmployeeLearningRecord[];
  selectedId?: string | null;
  onSelect?: (employee: EmployeeLearningRecord) => void;
  getEmployeeHref?: (employee: EmployeeLearningRecord) => string;
  onDelete?: (employee: EmployeeLearningRecord) => void;
};

const STATUS_LABELS = {
  active: { text: "活跃", className: "bg-primary-light/60 text-primary" },
  inactive: { text: "未活跃", className: "bg-muted text-muted-foreground" },
  new: { text: "新学员", className: "bg-secondary/10 text-secondary-dark" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export function EmployeeTable({
  hotel,
  employees,
  selectedId = null,
  onSelect,
  getEmployeeHref,
  onDelete,
}: EmployeeTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<EmployeeDepartment | "all">(
    "all"
  );
  const [departments, setDepartments] = useState(() => getHotelDepartments(hotel));

  useEffect(() => {
    setDepartments(getHotelDepartments(hotel));
    const onUpdate = () => setDepartments(getHotelDepartments(hotel));
    window.addEventListener("hotel-departments-updated", onUpdate);
    return () => window.removeEventListener("hotel-departments-updated", onUpdate);
  }, [hotel]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (deptFilter !== "all" && e.department !== deptFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        e.nickname.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.cefrLevel.toLowerCase().includes(q) ||
        e.phone.includes(q)
      );
    });
  }, [employees, query, deptFilter]);

  const handleRowClick = (emp: EmployeeLearningRecord) => {
    if (getEmployeeHref) {
      router.push(getEmployeeHref(emp));
      return;
    }
    onSelect?.(emp);
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-col gap-3 border-b-2 border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-foreground">员工学习数据</h2>
          {getEmployeeHref && (
            <p className="text-xs font-semibold text-muted-foreground">
              点击学员姓名查看全部学习记录
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="搜索姓名、岗位…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border-2 border-border py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-secondary"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) =>
              setDeptFilter(e.target.value as EmployeeDepartment | "all")
            }
            className="rounded-xl border-2 border-border px-3 py-2 text-sm font-bold outline-none focus:border-secondary"
          >
            <option value="all">全部部门</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/50 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">员工</th>
              <th className="px-4 py-3">职位</th>
              <th className="px-4 py-3">手机号</th>
              <th className="px-4 py-3">部门</th>
              <th className="px-4 py-3">CEFR</th>
              <th className="px-4 py-3">测评</th>
              <th className="px-4 py-3">进度</th>
              <th className="px-4 py-3">积分</th>
              <th className="px-4 py-3">最近活跃</th>
              {getEmployeeHref && <th className="px-4 py-3 w-10" aria-label="查看" />}
              {onDelete && <th className="px-4 py-3 w-12" aria-label="操作" />}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => {
              const status = STATUS_LABELS[emp.status];
              return (
                <tr
                  key={emp.id}
                  onClick={() => handleRowClick(emp)}
                  className={cn(
                    "cursor-pointer border-b border-border transition-colors hover:bg-muted/40",
                    selectedId === emp.id && "bg-secondary/5"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-extrabold",
                          getEmployeeHref
                            ? "text-primary underline-offset-2 hover:underline"
                            : "text-foreground"
                        )}
                      >
                        {emp.nickname}
                      </span>
                      {emp.isImported && (
                        <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-bold text-secondary-dark">
                          导入
                        </span>
                      )}
                      {emp.isLiveUser && (
                        <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                          本机
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {emp.role}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {emp.phone || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {getDepartmentLabel(hotel, emp.department)}
                  </td>
                  <td className="px-4 py-3 font-extrabold">{emp.cefrLevel}</td>
                  <td className="px-4 py-3">
                    {emp.assessmentScore > 0 ? (
                      <span className="font-extrabold text-primary">
                        {emp.assessmentScore} 分
                      </span>
                    ) : (
                      <span className="text-muted-foreground">未测评</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${emp.courseProgressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">
                        {emp.courseProgressPercent}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {emp.completedLessons}/{emp.totalLessons} 关
                    </p>
                  </td>
                  <td className="px-4 py-3 font-extrabold">{emp.totalPoints}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                        status.className
                      )}
                    >
                      {status.text}
                    </span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDate(emp.lastActiveAt)}
                    </p>
                  </td>
                  {getEmployeeHref && (
                    <td className="px-4 py-3 text-muted-foreground">
                      <ChevronRight className="size-4" />
                    </td>
                  )}
                  {onDelete && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(emp);
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red/10 hover:text-red"
                        aria-label={`删除 ${emp.nickname}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="p-8 text-center text-sm font-semibold text-muted-foreground">
          暂无匹配员工
        </p>
      )}
    </div>
  );
}
