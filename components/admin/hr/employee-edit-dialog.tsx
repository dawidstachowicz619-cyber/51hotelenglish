"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getHotelDepartments } from "@/lib/hr/hotel-department-storage";
import { cloudUpdateEmployee } from "@/lib/hr/roster-api";
import type {
  EmployeeDepartment,
  EmployeeLearningRecord,
  EmployeeUpdatePatch,
} from "@/lib/types/hr-admin";
import { PROBATION_DAYS_DEFAULT } from "@/lib/types/learning-record";

type EmployeeEditDialogProps = {
  hotel: string;
  employee: EmployeeLearningRecord | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function EmployeeEditDialog({
  hotel,
  employee,
  open,
  onClose,
  onSaved,
}: EmployeeEditDialogProps) {
  const departments = getHotelDepartments(hotel);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState<EmployeeDepartment>("reception");
  const [status, setStatus] = useState<EmployeeLearningRecord["status"]>("active");
  const [hireDate, setHireDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !employee) return;
    setName(employee.nickname);
    setPosition(employee.role);
    setDepartment(employee.department);
    setStatus(employee.status);
    setHireDate(employee.hireDate?.slice(0, 10) ?? "");
    setError(null);
  }, [open, employee]);

  if (!open || !employee) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const patch: EmployeeUpdatePatch = {
      nickname: name.trim(),
      role: position.trim(),
      department,
      status,
    };

    if (hireDate) {
      patch.hireDate = new Date(hireDate).toISOString();
      const probation = new Date(hireDate);
      probation.setDate(probation.getDate() + PROBATION_DAYS_DEFAULT);
      patch.probationEndDate = probation.toISOString();
    } else {
      patch.hireDate = null;
      patch.probationEndDate = null;
    }

    const result = await cloudUpdateEmployee(hotel, employee.id, patch);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-elevated w-full max-w-md bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground">编辑员工</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              手机号 {employee.phone}（不可修改）
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
              onChange={(e) => setDepartment(e.target.value as EmployeeDepartment)}
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
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
              required
            />
          </Field>

          <Field label="姓名">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
              required
            />
          </Field>

          <Field label="状态">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as EmployeeLearningRecord["status"])
              }
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-bold outline-none focus:border-secondary"
            >
              <option value="new">新学员</option>
              <option value="active">活跃</option>
              <option value="inactive">未活跃</option>
            </select>
          </Field>

          <Field label="入职日期（可选）">
            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold outline-none focus:border-secondary"
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-red/10 px-3 py-2 text-sm font-bold text-red">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              <Pencil className="size-4" />
              {loading ? "保存中…" : "保存修改"}
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
      <span className="text-xs font-extrabold text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
