"use client";

import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import { getTotalFrontDeskLessons } from "@/lib/hr/lesson-totals";
import { cloudAddEmployee } from "@/lib/hr/roster-api";
import type { EmployeeDepartment, EmployeeLearningRecord } from "@/lib/types/hr-admin";
import { PROBATION_DAYS_DEFAULT } from "@/lib/types/learning-record";

type EmployeeAddDialogProps = {
  hotel: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export function EmployeeAddDialog({
  hotel,
  open,
  onClose,
  onAdded,
}: EmployeeAddDialogProps) {
  const departments = getHotelDepartments(hotel);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState<EmployeeDepartment>(
    departments[0]?.id ?? "reception"
  );
  const [hireDate, setHireDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const depts = getHotelDepartments(hotel);
      setDepartment(depts[0]?.id ?? "reception");
    }
  }, [open, hotel]);

  if (!open) return null;

  const reset = () => {
    setName("");
    setPosition("");
    setPhone("");
    setDepartment(departments[0]?.id ?? "reception");
    setHireDate(new Date().toISOString().slice(0, 10));
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedPhone = phone.trim().replace(/\s|-/g, "").replace(/^\+86/, "");
    const hireIso = new Date(hireDate).toISOString();
    const probationEnd = new Date(hireDate);
    probationEnd.setDate(probationEnd.getDate() + PROBATION_DAYS_DEFAULT);

    const record: EmployeeLearningRecord = {
      id: `import-${normalizedPhone}`,
      nickname: name.trim(),
      phone: normalizedPhone,
      hotel,
      department,
      role: position.trim(),
      cefrLevel: "未测评",
      assessmentScore: 0,
      passedAssessmentLevels: [],
      totalPoints: 0,
      weeklyPoints: 0,
      completedLessons: 0,
      totalLessons: getTotalFrontDeskLessons(),
      courseProgressPercent: 0,
      lastActiveAt: new Date().toISOString(),
      hireDate: hireIso,
      probationEndDate: probationEnd.toISOString(),
      status: "new",
      isImported: true,
    };

    const result = await cloudAddEmployee(hotel, record);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    reset();
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-elevated w-full max-w-md bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground">添加员工</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              填写部门、职位、姓名、手机号。学员须用相同手机号登录后才能解锁全部课程。
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="关闭"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="部门">
            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value as EmployeeDepartment)
              }
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold outline-none focus:border-secondary"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="职位">
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="如：前台接待"
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
              required
            />
          </Field>

          <Field label="姓名">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="员工姓名"
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
              required
            />
          </Field>

          <Field label="手机号">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11 位中国大陆手机号"
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
              required
            />
          </Field>

          <Field label="入职日期">
            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
              required
            />
            <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
              试用期默认 {PROBATION_DAYS_DEFAULT} 天，到期可打印学习档案
            </p>
          </Field>

          {error && (
            <p className="rounded-xl bg-red/10 px-3 py-2 text-sm font-bold text-red">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              <UserPlus className="size-4" />
              {loading ? "添加中…" : "确认添加"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClose}>
              取消
            </Button>
          </div>
        </form>
      </div>
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
      <span className="text-xs font-extrabold text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
