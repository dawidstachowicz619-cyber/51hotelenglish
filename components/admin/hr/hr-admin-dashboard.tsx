"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, RefreshCw, Upload, UserPlus } from "lucide-react";

import { HrAccessDenied } from "@/components/admin/hr/hr-access-denied";
import { HrCourseCatalog } from "@/components/admin/hr/hr-course-catalog";
import { HrDepartmentSettings } from "@/components/admin/hr/hr-department-settings";
import { HrTrainingUpload } from "@/components/admin/hr/hr-training-upload";
import { DepartmentBreakdown, DepartmentRanking, LevelBreakdown } from "@/components/admin/hr/hr-charts";
import { EmployeeAddDialog } from "@/components/admin/hr/employee-add-dialog";
import { EmployeeEditDialog } from "@/components/admin/hr/employee-edit-dialog";
import { EmployeeImportDialog } from "@/components/admin/hr/employee-import-dialog";
import { EmployeeTable } from "@/components/admin/hr/employee-table";
import { HotelStatsCards } from "@/components/admin/hr/hotel-stats-cards";
import { HrLoginGate } from "@/components/admin/hr/hr-login-gate";
import { Button } from "@/components/ui/button";
import { useHrPermissions } from "@/hooks/use-hr-permissions";
import { computeHotelStats } from "@/lib/hr/hotel-analytics";
import { hrEmployeeRecordPath } from "@/lib/hr/employee-record-path";
import { isHotelHrAccessEnabled } from "@/lib/hr/hotel-hr-permissions";
import { clearHrSession, loadHrSession } from "@/lib/hr/hr-session";
import { fetchHotelEmployees, cloudRemoveEmployee } from "@/lib/hr/roster-api";
import { syncCurrentUserToRoster } from "@/lib/hr/sync-employee";
import type { EmployeeLearningRecord } from "@/lib/types/hr-admin";
import {
  HR_PERMISSION_KEYS,
  HR_PERMISSION_LABELS,
} from "@/lib/types/hr-permissions";

export function HrAdminDashboard() {
  const [hotel, setHotel] = useState<string | null>(null);
  const [hrAdmin, setHrAdmin] = useState<{ displayName: string; username: string } | null>(null);
  const [employees, setEmployees] = useState<EmployeeLearningRecord[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeLearningRecord | null>(null);

  const refresh = useCallback(() => {
    syncCurrentUserToRoster();
    if (!hotel) return;
    void fetchHotelEmployees(hotel).then(setEmployees);
  }, [hotel]);

  useEffect(() => {
    const session = loadHrSession();
    if (session?.hotel && session.accountId) {
      setHotel(session.hotel);
      setHrAdmin({
        displayName: session.displayName,
        username: session.username,
      });
    }
  }, []);

  useEffect(() => {
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
  }, [refresh]);

  const stats = useMemo(
    () => computeHotelStats(employees, hotel ?? undefined),
    [employees, hotel]
  );

  const { enabled, can, config } = useHrPermissions(hotel);

  useEffect(() => {
    if (!hotel) return;
    const onPerm = () => {
      if (!isHotelHrAccessEnabled(hotel)) {
        /* permissions changed */
      }
    };
    window.addEventListener("hotel-hr-permissions-updated", onPerm);
    return () => window.removeEventListener("hotel-hr-permissions-updated", onPerm);
  }, [hotel]);

  const handleLogout = () => {
    clearHrSession();
    setHotel(null);
    setHrAdmin(null);
  };

  const handleDeleteEmployee = (employee: EmployeeLearningRecord) => {
    if (!hotel) return;
    const label = `${employee.nickname}（${employee.role}）`;
    if (!window.confirm(`确定删除员工「${label}」？此操作不可撤销。`)) return;
    void cloudRemoveEmployee(hotel, employee.id).then(refresh);
  };

  if (!hotel) {
    return (
      <HrLoginGate
        onLogin={(h) => {
          setHotel(h);
          const session = loadHrSession();
          if (session) {
            setHrAdmin({
              displayName: session.displayName,
              username: session.username,
            });
          }
        }}
      />
    );
  }

  if (!enabled) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <HrAccessDenied hotel={hotel} reason="disabled" />
        <Button className="mt-4 w-full" variant="outline" onClick={handleLogout}>
          <LogOut className="size-4" />
          切换酒店
        </Button>
      </div>
    );
  }

  const canEmployees = can("employees");
  const canDashboard = can("dashboard");
  const canDepartments = can("departments");
  const canCatalog = can("catalog");
  const canTraining = can("training");
  const canReports = can("reports");

  const disabledPermissions = config
    ? HR_PERMISSION_KEYS.filter((k) => !config.permissions[k])
    : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回学习平台
          </Link>
          <h1 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
            {hotel}
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">
            人力资源部 · 员工学习数据看板
            {hrAdmin && (
              <>
                {" · "}
                <span className="text-foreground">{hrAdmin.displayName}</span>
                <span className="font-mono text-xs"> ({hrAdmin.username})</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEmployees && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
                <UserPlus className="size-4" />
                添加员工
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="size-4" />
                Excel 导入员工
              </Button>
            </>
          )}
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

      {disabledPermissions.length > 0 && (
        <p className="mt-4 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
          平台管理员已限制部分功能：
          {disabledPermissions
            .map((k) => HR_PERMISSION_LABELS[k].label)
            .join("、")}
          。如需开通请联系平台管理员。
        </p>
      )}

      {canDashboard ? (
        <div className="mt-8">
          <HotelStatsCards stats={stats} />
        </div>
      ) : (
        <div className="mt-8">
          <HrAccessDenied hotel={hotel} reason="permission" permission="dashboard" />
        </div>
      )}

      {canDepartments ? (
        <div className="mt-6">
          <HrDepartmentSettings hotel={hotel} />
        </div>
      ) : null}

      {canCatalog ? (
        <div className="mt-6">
          <HrCourseCatalog hotel={hotel} employees={employees} />
        </div>
      ) : null}

      {canTraining ? (
        <div className="mt-6">
          <HrTrainingUpload hotel={hotel} />
        </div>
      ) : null}

      {canDashboard ? (
        <>
          <div className="mt-6">
            <DepartmentRanking stats={stats} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DepartmentBreakdown stats={stats} />
            <LevelBreakdown stats={stats} />
          </div>
        </>
      ) : null}

      {canEmployees || canReports ? (
        <div className="mt-6">
          {canEmployees ? (
            <EmployeeTable
              hotel={hotel}
              employees={employees}
              getEmployeeHref={
                canReports
                  ? (emp) => hrEmployeeRecordPath(emp.id)
                  : undefined
              }
              onDelete={handleDeleteEmployee}
              onEdit={(emp) => {
                setEditingEmployee(emp);
                setEditOpen(true);
              }}
            />
          ) : (
            <HrAccessDenied hotel={hotel} reason="permission" permission="employees" />
          )}
        </div>
      ) : null}

      {canEmployees && (
        <>
          <EmployeeAddDialog
            hotel={hotel}
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onAdded={refresh}
          />

          <EmployeeImportDialog
            hotel={hotel}
            open={importOpen}
            onClose={() => setImportOpen(false)}
            onImported={refresh}
          />

          <EmployeeEditDialog
            hotel={hotel}
            employee={editingEmployee}
            open={editOpen}
            onClose={() => {
              setEditOpen(false);
              setEditingEmployee(null);
            }}
            onSaved={refresh}
          />
        </>
      )}
    </div>
  );
}
