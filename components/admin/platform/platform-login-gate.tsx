"use client";

import { useState } from "react";
import { KeyRound, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PLATFORM_ADMIN_DEMO_PASSWORD } from "@/lib/types/hr-permissions";
import {
  savePlatformAdminSession,
  verifyPlatformAdminPassword,
} from "@/lib/hr/platform-admin-session";

type PlatformLoginGateProps = {
  onLogin: () => void;
};

export function PlatformLoginGate({ onLogin }: PlatformLoginGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!verifyPlatformAdminPassword(password)) {
      setError("密码错误，请重试");
      return;
    }
    savePlatformAdminSession(password);
    onLogin();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <div className="card-elevated p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)]">
          <Shield className="size-8" />
        </div>
        <h1 className="mt-6 font-display text-2xl text-foreground">
          平台超级管理员
        </h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          管理各酒店 HR 后台权限与功能开关
        </p>

        <label className="mt-8 block text-left">
          <span className="text-xs font-extrabold text-foreground">管理员密码</span>
          <div className="relative mt-2">
            <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="请输入平台管理员密码"
              className="w-full rounded-xl border-2 border-border bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-accent"
            />
          </div>
        </label>

        {error && (
          <p className="mt-3 rounded-lg bg-red/10 px-3 py-2 text-sm font-bold text-red">
            {error}
          </p>
        )}

        <Button className="mt-6 w-full" size="lg" onClick={handleLogin}>
          进入平台管理
        </Button>

        <p className="mt-4 text-[10px] font-semibold text-muted-foreground">
          演示密码：{PLATFORM_ADMIN_DEMO_PASSWORD}
        </p>
      </div>
    </div>
  );
}
