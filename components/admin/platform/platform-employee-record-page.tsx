"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { EmployeeLearningRecordView } from "@/components/admin/hr/employee-learning-record-view";
import { PlatformLoginGate } from "@/components/admin/platform/platform-login-gate";
import { Button } from "@/components/ui/button";
import {
  decodeEmployeeIdParam,
} from "@/lib/hr/employee-record-path";
import { decodeHotelSlug, hotelLearningPath } from "@/lib/hr/hotel-slug";
import { getAllManagedHotels } from "@/lib/hr/hotel-registry";
import { loadPlatformAdminSession } from "@/lib/hr/platform-admin-session";
import { getHotelEmployees } from "@/lib/hr/roster-storage";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

type Props = {
  hotelSlug: string;
  employeeIdParam: string;
};

export function PlatformEmployeeRecordPage({
  hotelSlug,
  employeeIdParam,
}: Props) {
  const hotel = decodeHotelSlug(hotelSlug);
  const employeeId = decodeEmployeeIdParam(employeeIdParam);
  const [authed, setAuthed] = useState(false);
  const [employee, setEmployee] = useState<EmployeeLearningRecord | null>(null);

  const isKnownHotel = useMemo(
    () => getAllManagedHotels().some((h) => h === hotel),
    [hotel]
  );

  const refresh = useCallback(() => {
    syncCurrentUserToRoster();
    const found = getHotelEmployees(hotel).find((e) => e.id === employeeId) ?? null;
    setEmployee(found);
  }, [hotel, employeeId]);

  useEffect(() => {
    if (loadPlatformAdminSession()) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
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
  }, [authed, refresh]);

  if (!authed) {
    return <PlatformLoginGate onLogin={() => setAuthed(true)} />;
  }

  if (!isKnownHotel) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">未找到该酒店</p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/admin/platform">返回平台管理中心</Link>
        </Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">未找到该学员</p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href={hotelLearningPath(hotel)}>返回 {hotel} 学员列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <EmployeeLearningRecordView
      employee={employee}
      backHref={hotelLearningPath(hotel)}
      backLabel={`返回 ${hotel} 学员列表`}
    />
  );
}
