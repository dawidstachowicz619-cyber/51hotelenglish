"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Phone, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { isValidMainlandPhone } from "@/lib/auth/phone";
import { getRememberedPhone } from "@/lib/auth/remembered-phone";
import { cn } from "@/lib/utils";

type PhoneLoginCardProps = {
  variant?: "inline" | "gate";
  onLoggedIn?: () => void;
};

export function PhoneLoginCard({
  variant = "inline",
  onLoggedIn,
}: PhoneLoginCardProps) {
  const auth = usePhoneAuth();
  const router = useRouter();
  const [phone, setPhone] = useState(() => getRememberedPhone());
  const [code, setCode] = useState("");

  const isGate = variant === "gate";
  const hasRememberedPhone = phone === getRememberedPhone() && phone.length === 11;

  useEffect(() => {
    if (!auth.signedIn && !auth.otpSent && !phone) {
      const remembered = getRememberedPhone();
      if (remembered) setPhone(remembered);
    }
  }, [auth.signedIn, auth.otpSent, phone]);

  if (!auth.phoneAuthAvailable) {
    return (
      <div
        className={cn(
          "card-elevated border-2 border-border bg-muted/30 p-6",
          isGate && "mx-auto max-w-md"
        )}
      >
        <div className="flex items-start gap-3">
          <Phone className="size-6 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="font-display text-lg text-foreground">手机号登录暂未配置</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              请联系管理员配置 Supabase 短信登录，或稍后再试。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.loading) {
    return (
      <div
        className={cn(
          "card-elevated p-6 text-center text-sm font-semibold text-muted-foreground",
          isGate && "mx-auto max-w-md"
        )}
      >
        加载登录状态…
      </div>
    );
  }

  if (auth.signedIn) {
    return (
      <div
        className={cn(
          "card-elevated border-2 border-primary/20 bg-primary-light/20 p-6",
          isGate && "mx-auto max-w-md"
        )}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg text-foreground">已绑定手机号</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {auth.phone ? `+86 ${auth.phone}` : "登录成功"} · 学习数据可在多设备同步
            </p>
            {!isGate && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => void auth.signOut()}
                disabled={auth.loading}
              >
                <LogOut className="size-4" />
                退出登录
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "card-elevated border-2 border-secondary/20 bg-secondary/5 p-6",
        isGate && "mx-auto max-w-md shadow-md"
      )}
    >
      <div className="flex items-start gap-3">
        <Phone className="size-6 shrink-0 text-secondary" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg text-foreground">
            {isGate ? "手机号登录" : "手机号登录"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {isGate
              ? "输入手机号并验证，即可登录开始学习。"
              : "登录后可在手机、电脑等多设备同步学习进度"}
          </p>

          {!auth.otpSent ? (
            <div className="mt-4 space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11 位手机号"
                maxLength={11}
                className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-secondary"
              />
              {hasRememberedPhone && (
                <p className="text-xs font-semibold text-muted-foreground">
                  已填入上次登录的手机号
                </p>
              )}
              <Button
                className="w-full"
                variant="secondary"
                size={isGate ? "lg" : "default"}
                disabled={!isValidMainlandPhone(phone) || auth.loading}
                onClick={() => void auth.sendOtp(phone)}
              >
                发送验证码
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground">
                验证码已发送至 {auth.pendingPhone || phone}
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 位验证码"
                maxLength={6}
                className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold tracking-widest outline-none focus:border-secondary"
              />
              <Button
                className="w-full"
                variant="secondary"
                size={isGate ? "lg" : "default"}
                disabled={code.length < 4 || auth.loading}
                onClick={() =>
                  void auth.verifyOtp(code).then((result) => {
                    if (result.ok) {
                      onLoggedIn?.();
                      if (isGate) router.push("/");
                    }
                  })
                }
              >
                验证并登录
              </Button>
              <button
                type="button"
                className="text-xs font-bold text-muted-foreground underline"
                onClick={() => void auth.sendOtp(auth.pendingPhone || phone)}
              >
                重新发送
              </button>
            </div>
          )}

          {auth.error && (
            <p className="mt-3 text-xs font-bold text-red">{auth.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
