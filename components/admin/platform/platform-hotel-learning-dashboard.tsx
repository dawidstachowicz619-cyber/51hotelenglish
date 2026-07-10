"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, LogOut, RefreshCw, Shield } from "lucide-react";

import { DepartmentBreakdown, DepartmentRanking, LevelBreakdown } from "@/components/admin/hr/hr-charts";
import { EmployeeTable } from "@/components/admin/hr/employee-table";
import { HotelStatsCards } from "@/components/admin/hr/hotel-stats-cards";
import { PlatformLoginGate } from "@/components/admin/platform/platform-login-gate";
import { Button } from "@/components/ui/button";
import { computeHotelStats } from "@/lib/hr/hotel-analytics";
import { platformEmployeeRecordPath } from "@/lib/hr/employee-record-path";
import { getAllManagedHotels } from "@/lib/hr/hotel-registry";
import { decodeHotelSlug } from "@/lib/hr/hotel-slug";
import {
  clearPlatformAdminSession,
  loadPlatformAdminSession,
} from "@/lib/hr/platform-admin-session";
import { getHotelEmployees } from "@/lib/hr/roster-storage";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";

type Props = {
  slug: string;
};

export function PlatformHotelLearningDashboard({ slug }: Props) {
  const hotel = decodeHotelSlug(slug);
  const [authed, setAuthed] = useState(false);
  const [employees, setEmployees] = useState<EmployeeLearningRecord[]>([]);

  const isKnownHotel = useMemo(() => {
    if (!authed) return true;
    return getAllManagedHotels().some((h) => h === hotel);
  }, [authed, hotel]);

  const refresh = useCallback(() => {
    syncCurrentUserToRoster();
    setEmployees(getHotelEmployees(hotel));
  }, [hotel]);

  useEffect(() => {
    if (loadPlatformAdminSession()) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("hr-roster-updated", onUpdate);
    window.addEventListener("points-updated", onUpdate);
    window.addEventListener("course-progress-updated", onUpdate);
    window.addEventListener("assessment-updated", onUpdate);
    return () => {
      window.removeEventListener("hr-roster-updated", onUpdate);
      window.removeEventListener("points-updated", onUpdate);
      window.removeEventListener("course-progress-updated", onUpdate);
      window.removeEventListener("assessment-updated", onUpdate);
    };
  }, [authed, refresh]);

  const stats = useMemo(
    () => computeHotelStats(employees, hotel),
    [employees, hotel]
  );

  const handleLogout = () => {
    clearPlatformAdminSession();
    setAuthed(false);
  };

  if (!authed) {
    return <PlatformLoginGate onLogin={() => setAuthed(true)} />;
  }

  if (!isKnownHotel) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">未找到该酒店</p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          「{hotel}」不在平台管理列表中
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/admin/platform">
            <ArrowLeft className="size-4" />
            返回平台管理中心
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/platform"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回平台管理中心
          </Link>
          <div className="mt-2 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
              <BarChart3 className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-foreground md:text-3xl">
                {hotel}
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                学员学习数据 · 平台管理员只读查看
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-extrabold text-accent">
            <Shield className="size-3.5" />
            超级管理员
          </span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="size-4" />
            刷新数据
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            退出登录
          </Button>
        </div>
      </div>

      <p className="mt-4 rounded-xl border-2 border-primary/20 bg-primary-light/20 px-4 py-3 text-xs font-semibold text-foreground">
        您正在以平台管理员身份查看该酒店全部学员的学习进度、测评成绩与试用期报告。员工增删与 HR 权限配置请在
        <Link href="/admin/platform" className="mx-1 font-bold text-primary underline">
          平台管理中心
        </Link>
        或企业 HR 后台操作。
      </p>

      <div className="mt-8">
        <HotelStatsCards stats={stats} />
      </div>

      <div className="mt-6">
        <DepartmentRanking stats={stats} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DepartmentBreakdown stats={stats} />
        <LevelBreakdown stats={stats} />
      </div>

      <div className="mt-6">
        <EmployeeTable
          hotel={hotel}
          employees={employees}
          getEmployeeHref={(emp) => platformEmployeeRecordPath(hotel, emp.id)}
        />
      </div>
    </div>
  );
}
