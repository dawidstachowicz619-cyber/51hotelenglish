"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createDepartmentId,
  getHotelDepartments,
  resetHotelDepartmentsToDefault,
  saveHotelDepartments,
} from "@/lib/hr/hotel-department-storage";
import {
  COURSE_TRACK_LABELS,
  FRONT_DESK_TRACK_IDS,
  type HotelDepartment,
} from "@/lib/types/hotel-department";
import type { FrontDeskDepartmentId } from "@/lib/types/front-desk-department";

type HrDepartmentSettingsProps = {
  hotel: string;
};

export function HrDepartmentSettings({ hotel }: HrDepartmentSettingsProps) {
  const [departments, setDepartments] = useState<HotelDepartment[]>([]);
  const [newName, setNewName] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newTrack, setNewTrack] = useState<FrontDeskDepartmentId | "">("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setDepartments(getHotelDepartments(hotel));
  }, [hotel]);

  useEffect(() => {
    refresh();
    window.addEventListener("hotel-departments-updated", refresh);
    return () => window.removeEventListener("hotel-departments-updated", refresh);
  }, [refresh]);

  const persist = (next: HotelDepartment[]) => {
    saveHotelDepartments(hotel, next);
    setDepartments(next);
  };

  const handleAdd = () => {
    setError(null);
    const name = newName.trim();
    if (!name) {
      setError("请填写部门名称");
      return;
    }
    if (departments.some((d) => d.name === name)) {
      setError("该部门名称已存在");
      return;
    }
    const dept: HotelDepartment = {
      id: createDepartmentId(name),
      name,
      subtitle: newSubtitle.trim() || undefined,
      courseTrackId: newTrack || undefined,
      order: departments.length,
    };
    persist([...departments, dept]);
    setNewName("");
    setNewSubtitle("");
    setNewTrack("");
  };

  const handleUpdate = (
    id: string,
    patch: Partial<Pick<HotelDepartment, "name" | "subtitle" | "courseTrackId">>
  ) => {
    persist(
      departments.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  };

  const handleDelete = (id: string) => {
    if (departments.length <= 1) {
      setError("至少保留一个部门");
      return;
    }
    if (!window.confirm("确定删除该部门？已有员工仍保留原部门 id。")) return;
    persist(departments.filter((d) => d.id !== id));
  };

  const handleReset = () => {
    if (!window.confirm("恢复为系统默认的四个前厅部门？")) return;
    resetHotelDepartmentsToDefault(hotel);
    refresh();
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Building2 className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-xl text-foreground">本酒店部门设置</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              添加、编辑、删除部门；用于员工档案、课程分配与学习路径
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="size-4" />
          恢复默认
        </Button>
      </div>

      <ul className="mt-6 space-y-3">
        {departments.map((dept) => (
          <li
            key={dept.id}
            className="rounded-xl border-2 border-border bg-muted/20 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block sm:col-span-2">
                <span className="text-[10px] font-extrabold text-muted-foreground">
                  部门名称
                </span>
                <input
                  value={dept.name}
                  onChange={(e) =>
                    handleUpdate(dept.id, { name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-bold"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-extrabold text-muted-foreground">
                  英文 / 副标题
                </span>
                <input
                  value={dept.subtitle ?? ""}
                  onChange={(e) =>
                    handleUpdate(dept.id, { subtitle: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold"
                  placeholder="可选"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-extrabold text-muted-foreground">
                  关联英语课程
                </span>
                <select
                  value={dept.courseTrackId ?? ""}
                  onChange={(e) =>
                    handleUpdate(dept.id, {
                      courseTrackId: (e.target.value ||
                        undefined) as FrontDeskDepartmentId | undefined,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-bold"
                >
                  <option value="">不关联 / 通用</option>
                  {FRONT_DESK_TRACK_IDS.map((id) => (
                    <option key={id} value={id}>
                      {COURSE_TRACK_LABELS[id]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted-foreground">
                ID: {dept.id}
              </p>
              <button
                type="button"
                onClick={() => handleDelete(dept.id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red hover:bg-red/10"
              >
                <Trash2 className="size-3.5" />
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border-2 border-dashed border-border p-4">
        <p className="text-xs font-extrabold text-foreground">添加新部门</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="部门名称，如：财务部"
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold sm:col-span-2"
          />
          <input
            value={newSubtitle}
            onChange={(e) => setNewSubtitle(e.target.value)}
            placeholder="副标题（可选）"
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
          />
          <select
            value={newTrack}
            onChange={(e) =>
              setNewTrack(e.target.value as FrontDeskDepartmentId | "")
            }
            className="rounded-lg border border-border px-3 py-2 text-sm font-bold"
          >
            <option value="">关联课程（可选）</option>
            {FRONT_DESK_TRACK_IDS.map((id) => (
              <option key={id} value={id}>
                {COURSE_TRACK_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="mt-2 text-xs font-bold text-red">{error}</p>
        )}
        <Button className="mt-3" size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          添加部门
        </Button>
      </div>
    </div>
  );
}
