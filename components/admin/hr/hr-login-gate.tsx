"use client";

import { useState } from "react";
import { Building2, KeyRound, LogIn, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { verifyHrAdminLogin } from "@/lib/hr/hr-admin-accounts";
import { checkHotelHrAccessEnabled } from "@/lib/hr/platform-api";
import { cloudHrLogin } from "@/lib/hr/roster-api";
import { saveHrSession } from "@/lib/hr/hr-session";
import { isCloudSyncActive } from "@/lib/storage/cloud-sync";
import type { HrAdminSession } from "@/lib/types/hr-admin";

type HrLoginGateProps = {
  onLogin: (hotel: string) => void;
};

function persistCloudSession(session: HrAdminSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("51he-hr-admin-session", JSON.stringify(session));
}

export function HrLoginGate({ onLogin }: HrLoginGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError("请输入账号和密码");
      return;
    }

    setLoading(true);
    try {
      if (isCloudSyncActive()) {
        const result = await cloudHrLogin(trimmedUser, password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        if (!(await checkHotelHrAccessEnabled(result.session.hotel))) {
          setError(`「${result.session.hotel}」的 HR 后台权限尚未开通，请联系平台管理员`);
          return;
        }
        persistCloudSession(result.session);
        onLogin(result.session.hotel);
        return;
      }

      const account = verifyHrAdminLogin(trimmedUser, password);
      if (!account) {
        setError("账号或密码错误，或账号已被禁用");
        return;
      }

      if (!(await checkHotelHrAccessEnabled(account.hotel))) {
        setError(`「${account.hotel}」的 HR 后台权限尚未开通，请联系平台管理员`);
        return;
      }

      saveHrSession(account);
      onLogin(account.hotel);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <div className="card-elevated p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-white shadow-[0_4px_0_0_var(--secondary-dark)]">
          <Building2 className="size-8" />
        </div>
        <h1 className="mt-6 font-display text-2xl text-foreground">
          企业管理员登录
        </h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          使用平台分配的企业 HR 账号登录管理后台
        </p>

        <div className="mt-8 space-y-4 text-left">
          <label className="block">
            <span className="text-xs font-extrabold text-foreground">登录账号</span>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
                placeholder="平台分配的 HR 账号"
                autoComplete="username"
                className="w-full rounded-xl border-2 border-border bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-secondary"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-extrabold text-foreground">密码</span>
            <div className="relative mt-2">
              <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full rounded-xl border-2 border-border bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-secondary"
              />
            </div>
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red/10 px-4 py-2 text-sm font-bold text-red">
            {error}
          </p>
        )}

        <Button className="mt-6 w-full" size="lg" onClick={() => void handleLogin()} disabled={loading}>
          <LogIn className="size-5" />
          {loading ? "登录中…" : "登录管理后台"}
        </Button>

        <p className="mt-4 text-[10px] font-semibold text-muted-foreground">
          账号由平台管理员在「平台管理」中创建并分配
        </p>
      </div>
    </div>
  );
}
