"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  LogOut,
  Plus,
  Shield,
  X,
} from "lucide-react";

import { HotelHrAccountsPanel } from "@/components/admin/platform/hotel-hr-accounts-panel";
import { PlatformLoginGate } from "@/components/admin/platform/platform-login-gate";
import { Button } from "@/components/ui/button";
import {
  countEnabledHrAccounts,
  countHrAccountsByHotel,
} from "@/lib/hr/hr-admin-accounts";
import {
  getAllHotelHrPermissions,
  saveHotelHrPermissions,
  setAllHotelHrPermissions,
  setHotelHrEnabled,
  setHotelHrPermission,
} from "@/lib/hr/hotel-hr-permissions";
import {
  getAllManagedHotels,
  registerHotel,
} from "@/lib/hr/hotel-registry";
import {
  clearPlatformAdminSession,
  loadPlatformAdminSession,
} from "@/lib/hr/platform-admin-session";
import {
  HR_PERMISSION_KEYS,
  HR_PERMISSION_LABELS,
  type HotelHrPermissions,
  type HrPermissionKey,
} from "@/lib/types/hr-permissions";
import { cn } from "@/lib/utils";

export function PlatformAdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [hotels, setHotels] = useState<string[]>([]);
  const [configs, setConfigs] = useState<HotelHrPermissions[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newHotel, setNewHotel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [accountCount, setAccountCount] = useState(0);

  const refresh = useCallback(() => {
    const list = getAllManagedHotels();
    setHotels(list);
    setConfigs(getAllHotelHrPermissions(list));
    setAccountCount(countEnabledHrAccounts());
  }, []);

  useEffect(() => {
    if (loadPlatformAdminSession()) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    refresh();
    window.addEventListener("hotel-hr-permissions-updated", refresh);
    window.addEventListener("hotel-registry-updated", refresh);
    window.addEventListener("hr-admin-accounts-updated", refresh);
    return () => {
      window.removeEventListener("hotel-hr-permissions-updated", refresh);
      window.removeEventListener("hotel-registry-updated", refresh);
      window.removeEventListener("hr-admin-accounts-updated", refresh);
    };
  }, [authed, refresh]);

  const handleLogout = () => {
    clearPlatformAdminSession();
    setAuthed(false);
    setExpanded(null);
  };

  const handleAddHotel = () => {
    setAddError(null);
    if (!registerHotel(newHotel)) {
      setAddError("酒店名称无效或已存在");
      return;
    }
    setNewHotel("");
    refresh();
  };

  const getConfig = (hotel: string) =>
    configs.find((c) => c.hotel === hotel) ?? null;

  const handleToggleEnabled = (hotel: string, enabled: boolean) => {
    setHotelHrEnabled(hotel, enabled);
    refresh();
  };

  const handleTogglePermission = (
    hotel: string,
    permission: HrPermissionKey,
    allowed: boolean
  ) => {
    setHotelHrPermission(hotel, permission, allowed);
    refresh();
  };

  const handleSetAll = (hotel: string, allowed: boolean) => {
    setAllHotelHrPermissions(hotel, allowed);
    refresh();
  };

  const handleSaveNote = (hotel: string, note: string) => {
    const current = getConfig(hotel);
    if (!current) return;
    saveHotelHrPermissions({ ...current, note });
    refresh();
  };

  if (!authed) {
    return <PlatformLoginGate onLogin={() => setAuthed(true)} />;
  }

  const enabledCount = configs.filter((c) => c.enabled).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            返回学习平台
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-white">
              <Shield className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl text-foreground md:text-3xl">
                平台管理中心
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                超级管理员 · 权限配置与企业 HR 账号管理
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/platform/courses">课程内容管理</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/hr">企业 HR 后台</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            退出登录
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="管理酒店" value={String(hotels.length)} />
        <StatCard label="已开通 HR" value={String(enabledCount)} highlight />
        <StatCard label="HR 管理员账号" value={String(accountCount)} />
        <StatCard
          label="已禁用酒店"
          value={String(hotels.length - enabledCount)}
        />
      </div>

      <div className="card-elevated mt-6 p-6">
        <h2 className="font-display text-lg text-foreground">添加合作酒店</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          新酒店添加后可为其配置 HR 权限
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={newHotel}
            onChange={(e) => {
              setNewHotel(e.target.value);
              setAddError(null);
            }}
            placeholder="酒店全称，如：北京王府井希尔顿"
            className="flex-1 rounded-xl border-2 border-border px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent"
          />
          <Button onClick={handleAddHotel}>
            <Plus className="size-4" />
            添加酒店
          </Button>
        </div>
        {addError && (
          <p className="mt-2 text-sm font-bold text-red">{addError}</p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="font-display text-lg text-foreground">酒店 HR 权限</h2>
        {hotels.map((hotel) => {
          const config = getConfig(hotel);
          if (!config) return null;
          const isOpen = expanded === hotel;
          const activePerms = HR_PERMISSION_KEYS.filter(
            (k) => config.permissions[k]
          ).length;
          const hotelAccountCount = countHrAccountsByHotel(hotel);

          return (
            <article
              key={hotel}
              className={cn(
                "rounded-xl border-2 transition-colors",
                config.enabled ? "border-border bg-white" : "border-red/30 bg-red/5"
              )}
            >
              <button
                type="button"
                className="flex w-full items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : hotel)}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Building2 className="size-5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base text-foreground">{hotel}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {config.enabled
                      ? `已开通 · ${activePerms}/${HR_PERMISSION_KEYS.length} 项功能 · ${hotelAccountCount} 个管理员`
                      : "HR 后台已禁用"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                    config.enabled
                      ? "bg-primary-light text-primary"
                      : "bg-red/15 text-red"
                  )}
                >
                  {config.enabled ? "启用" : "禁用"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t-2 border-border px-4 pb-4 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-muted-foreground">
                      HR 后台总开关
                    </span>
                    <Button
                      size="sm"
                      variant={config.enabled ? "default" : "outline"}
                      onClick={() => handleToggleEnabled(hotel, true)}
                    >
                      <Check className="size-3.5" />
                      开通
                    </Button>
                    <Button
                      size="sm"
                      variant={!config.enabled ? "default" : "outline"}
                      onClick={() => handleToggleEnabled(hotel, false)}
                    >
                      <X className="size-3.5" />
                      禁用
                    </Button>
                    <span className="mx-1 text-border">|</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetAll(hotel, true)}
                    >
                      全开
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetAll(hotel, false)}
                    >
                      全关
                    </Button>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {HR_PERMISSION_KEYS.map((key) => {
                      const meta = HR_PERMISSION_LABELS[key];
                      const on = config.permissions[key];
                      return (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {meta.label}
                            </p>
                            <p className="text-[10px] font-semibold text-muted-foreground">
                              {meta.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            disabled={!config.enabled}
                            onClick={() =>
                              handleTogglePermission(hotel, key, !on)
                            }
                            className={cn(
                              "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40",
                              on ? "bg-primary" : "bg-border"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                                on ? "left-[22px]" : "left-0.5"
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <HotelHrAccountsPanel hotel={hotel} disabled={!config.enabled} />

                  <label className="mt-4 block">
                    <span className="text-xs font-extrabold text-muted-foreground">
                      备注（可选，HR 不可见）
                    </span>
                    <input
                      defaultValue={config.note ?? ""}
                      onBlur={(e) => handleSaveNote(hotel, e.target.value)}
                      placeholder="如：试用期仅开放看板与员工管理"
                      className="mt-1.5 w-full rounded-xl border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                    />
                  </label>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-elevated p-5 text-center",
        highlight && "border-primary/30 bg-primary-light/20"
      )}
    >
      <p className="text-xs font-extrabold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl text-foreground">{value}</p>
    </div>
  );
}
