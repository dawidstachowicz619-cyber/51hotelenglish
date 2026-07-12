"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { EmployeeLearningRecordView } from "@/components/admin/hr/employee-learning-record-view";
import { HrLoginGate } from "@/components/admin/hr/hr-login-gate";
import { Button } from "@/components/ui/button";
import { useHrPermissions } from "@/hooks/use-hr-permissions";
import { decodeEmployeeIdParam } from "@/lib/hr/employee-record-path";
import { isHotelHrAccessEnabled } from "@/lib/hr/hotel-hr-permissions";
import { loadHrSession } from "@/lib/hr/hr-session";
import {
  fetchHotelEmployees,
  cloudRemoveEmployee,
  cloudUpdateEmployee,
} from "@/lib/hr/roster-api";
import { fetchHotelCourseAssignments } from "@/lib/hr/course-assignment-api";
import { fetchHotelDepartments } from "@/lib/hr/hotel-department-api";
import { fetchHotelTrainingModules } from "@/lib/hr/training-modules-api";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import type { EmployeeLearningRecord, EmployeeUpdatePatch } from "@/lib/types/hr-admin";

type Props = {
  employeeIdParam: string;
};

export function HrEmployeeRecordPage({ employeeIdParam }: Props) {
  const employeeId = decodeEmployeeIdParam(employeeIdParam);
  const [hotel, setHotel] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeLearningRecord[]>([]);
  const [employee, setEmployee] = useState<EmployeeLearningRecord | null>(null);

  const refresh = useCallback(() => {
    syncCurrentUserToRoster();
    if (!hotel) return;
    void fetchHotelEmployees(hotel).then((list) => {
      setEmployees(list);
      setEmployee(list.find((e) => e.id === employeeId) ?? null);
    });
    void fetchHotelCourseAssignments(hotel);
    void fetchHotelDepartments(hotel);
    void fetchHotelTrainingModules(hotel);
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
    window.addEventListener("hotel-course-assignments-updated", refresh);
    return () => {
      window.removeEventListener("hr-roster-updated", refresh);
      window.removeEventListener("points-updated", refresh);
      window.removeEventListener("course-progress-updated", refresh);
      window.removeEventListener("assessment-updated", refresh);
      window.removeEventListener("hotel-course-assignments-updated", refresh);
    };
  }, [hotel, refresh]);

  const { can } = useHrPermissions(hotel);

  const handleDelete = () => {
    if (!hotel || !employee) return;
    const label = `${employee.nickname}（${employee.role}）`;
    if (!window.confirm(`确定删除员工「${label}」？此操作不可撤销。`)) return;
    void cloudRemoveEmployee(hotel, employee.id).then(() => {
      window.location.href = "/admin/hr";
    });
  };

  const handleSave = async (patch: EmployeeUpdatePatch) => {
    if (!hotel || !employee) {
      return { ok: false as const, error: "未找到员工" };
    }
    const result = await cloudUpdateEmployee(hotel, employee.id, patch);
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }
    refresh();
    return { ok: true as const };
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
        <p className="font-display text-xl text-foreground">未找到该员工</p>
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
      allEmployees={employees}
      onSave={can("employees") ? handleSave : undefined}
      onDelete={can("employees") ? handleDelete : undefined}
      canAssignCourses={can("catalog")}
    />
  );
}
