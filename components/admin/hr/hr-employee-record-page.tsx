"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { EmployeeLearningRecordView } from "@/components/admin/hr/employee-learning-record-view";
import { HrLoginGate } from "@/components/admin/hr/hr-login-gate";
import { Button } from "@/components/ui/button";
import { decodeEmployeeIdParam } from "@/lib/hr/employee-record-path";
import { isHotelHrAccessEnabled } from "@/lib/hr/hotel-hr-permissions";
import { loadHrSession } from "@/lib/hr/hr-session";
import {
  getHotelEmployees,
  removeHotelEmployee,
} from "@/lib/hr/roster-storage";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

type Props = {
  employeeIdParam: string;
};

export function HrEmployeeRecordPage({ employeeIdParam }: Props) {
  const employeeId = decodeEmployeeIdParam(employeeIdParam);
  const [hotel, setHotel] = useState<string | null>(null);
  const [employee, setEmployee] = useState<EmployeeLearningRecord | null>(null);

  const refresh = useCallback(() => {
    syncCurrentUserToRoster();
    if (!hotel) return;
    const found = getHotelEmployees(hotel).find((e) => e.id === employeeId) ?? null;
    setEmployee(found);
  }, [hotel, employeeId]);

  useEffect(() => {
    const session = loadHrSession();
    if (session?.hotel) setHotel(session.hotel);
  }, []);

  useEffect(() => {
    if (!hotel) return;
    refresh();
    window.addEventListener("hr-roster-updated", refresh);
    window.addEventListener("points-updated", refresh);
    window.addEventListener("course-progress-updated", refresh);
    window.addEventListener("assessment-updated", refresh);
    return () => {
      window.removeEventListener("hr-roster-updated", refresh);
      window.removeEventListener("points-updated", refresh);
      window.removeEventListener("course-progress-updated", refresh);
      window.removeEventListener("assessment-updated", refresh);
    };
  }, [hotel, refresh]);

  const handleDelete = () => {
    if (!hotel || !employee) return;
    const label = `${employee.nickname}（${employee.role}）`;
    if (!window.confirm(`确定删除员工「${label}」？此操作不可撤销。`)) return;
    removeHotelEmployee(hotel, employee.id);
    window.location.href = "/admin/hr";
  };

  if (!hotel) {
    return <HrLoginGate onLogin={(h) => setHotel(h)} />;
  }

  if (!isHotelHrAccessEnabled(hotel)) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">HR 后台已禁用</p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/admin/hr">返回 HR 后台</Link>
        </Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">未找到该学员</p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          员工 ID：{employeeId}
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/admin/hr">返回员工列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <EmployeeLearningRecordView
      employee={employee}
      backHref="/admin/hr"
      backLabel={`返回 ${hotel} 员工列表`}
      onDelete={handleDelete}
    />
  );
}
