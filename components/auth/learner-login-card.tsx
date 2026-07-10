"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import {
  isValidLoginAccount,
  isValidLoginPassword,
  isValidRegisterPassword,
  isValidRegisterUsername,
} from "@/lib/auth/learner-account";
import { isValidMainlandPhone } from "@/lib/auth/phone";
import {
  getRememberedLoginAccount,
  getRememberedPhone,
} from "@/lib/auth/remembered-login";
import { cn } from "@/lib/utils";

type LoginMode = "password" | "otp";

type LearnerLoginCardProps = {
  variant?: "inline" | "gate";
  isRegister?: boolean;
  onLoggedIn?: () => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-extrabold uppercase text-muted-foreground">
      {children}
    </label>
  );
}

export function LearnerLoginCard({
  variant = "inline",
  isRegister = false,
  onLoggedIn,
}: LearnerLoginCardProps) {
  const auth = usePhoneAuth();
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [account, setAccount] = useState(() =>
    isRegister ? "" : getRememberedLoginAccount()
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState(() => getRememberedPhone());
  const [code, setCode] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);

  const isGate = variant === "gate";
  const rememberedAccount = getRememberedLoginAccount();
  const hasRememberedAccount =
    !isRegister && Boolean(rememberedAccount) && account.trim() === rememberedAccount;
  const hasRememberedPhone =
    phone === getRememberedPhone() && phone.length === 11;

  useEffect(() => {
    if (isRegister) {
      setMode("password");
      return;
    }
    if (!auth.signedIn && !auth.otpSent) {
      const remembered = getRememberedLoginAccount();
      if (remembered && !account) setAccount(remembered);
      const rememberedPhone = getRememberedPhone();
      if (rememberedPhone && !phone) setPhone(rememberedPhone);
    }
  }, [auth.signedIn, auth.otpSent, account, phone, isRegister]);

  const handleSuccess = () => {
    onLoggedIn?.();
    if (isGate) router.push("/");
  };

  const canRegister =
    isValidRegisterUsername(username) &&
    isValidRegisterPassword(password) &&
    password === confirmPassword;

  if (!auth.phoneAuthAvailable) {
    return (
      <div
        className={cn(
          "card-elevated border-2 border-border bg-muted/30 p-6",
          isGate && "mx-auto max-w-md"
        )}
      >
        <div className="flex items-start gap-3">
          <KeyRound className="size-6 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="font-display text-lg text-foreground">登录暂未配置</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              请联系管理员配置 Supabase 登录，或稍后再试。
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
    const label = auth.phone
      ? `+86 ${auth.phone}`
      : auth.accountLabel ?? "登录成功";

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
            <h2 className="font-display text-lg text-foreground">已登录</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {label} · 学习数据可在多设备同步
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
        "card-elevated border-2 border-border bg-white p-6",
        isGate && "mx-auto max-w-md shadow-md"
      )}
    >
      <h2 className="font-display text-xl text-foreground">
        {isRegister ? "注册账号" : mode === "otp" ? "验证码登录" : "账号密码登录"}
      </h2>
      {!isRegister && mode === "password" && (
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          可使用账号、手机号或邮箱登录
        </p>
      )}
      {isRegister && (
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          请设置登录账号与密码，注册成功后即可开始学习
        </p>
      )}

      {isRegister ? (
        <div className="mt-5 space-y-4">
          <div>
            <FieldLabel>账号 *</FieldLabel>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setRegisterError(null);
              }}
              placeholder="3–20 位字母、数字或中文"
              autoComplete="username"
              maxLength={20}
              className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>
          <div>
            <FieldLabel>登录密码 *</FieldLabel>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setRegisterError(null);
              }}
              placeholder="至少 6 位"
              autoComplete="new-password"
              maxLength={32}
              className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>
          <div>
            <FieldLabel>确认密码 *</FieldLabel>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setRegisterError(null);
              }}
              placeholder="再次输入密码"
              autoComplete="new-password"
              maxLength={32}
              className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs font-bold text-red">两次输入的密码不一致</p>
          )}
          <Button
            className="mt-1 w-full"
            size={isGate ? "lg" : "default"}
            disabled={!canRegister || auth.loading}
            onClick={() =>
              void auth.registerWithPassword(username, password).then((result) => {
                if (result.ok) {
                  handleSuccess();
                  return;
                }
                setRegisterError(result.error ?? "注册失败");
              })
            }
          >
            注册并登录
          </Button>
        </div>
      ) : mode === "password" ? (
        <div className="mt-5 space-y-3">
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="手机号 / 用户名 / 邮箱"
            autoComplete="username"
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
          {hasRememberedAccount && (
            <p className="text-xs font-semibold text-muted-foreground">
              已填入上次登录的账号
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="登录密码"
            autoComplete="current-password"
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
          <Button
            className="mt-1 w-full"
            size={isGate ? "lg" : "default"}
            disabled={
              !isValidLoginAccount(account) ||
              !isValidLoginPassword(password) ||
              auth.loading
            }
            onClick={() =>
              void auth.signInWithPassword(account, password).then((result) => {
                if (result.ok) handleSuccess();
              })
            }
          >
            登录
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
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

          {!auth.otpSent ? (
            <Button
              className="w-full"
              variant="secondary"
              size={isGate ? "lg" : "default"}
              disabled={!isValidMainlandPhone(phone) || auth.loading}
              onClick={() => void auth.sendOtp(phone)}
            >
              发送验证码
            </Button>
          ) : (
            <>
              <p className="text-xs font-bold text-muted-foreground">
                验证码已发送至 {auth.pendingPhone || phone}
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
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
                    if (result.ok) handleSuccess();
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
            </>
          )}
        </div>
      )}

      {(auth.error || registerError) && (
        <p className="mt-3 text-xs font-bold text-red">{registerError ?? auth.error}</p>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-bold">
        {isRegister ? (
          <>
            <span className="text-muted-foreground">注册需设置账号与密码</span>
            <Link href="/profile" className="text-foreground hover:text-primary hover:underline">
              已有账号，去登录
            </Link>
          </>
        ) : mode === "password" ? (
          <>
            <button
              type="button"
              className="text-secondary hover:underline"
              onClick={() => {
                setMode("otp");
                setPassword("");
              }}
            >
              验证码登录
            </button>
            <Link
              href="/profile?register=1"
              className="text-foreground hover:text-primary hover:underline"
            >
              免费注册
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              className="text-secondary hover:underline"
              onClick={() => {
                setMode("password");
                setCode("");
              }}
            >
              账号密码登录
            </button>
            <Link
              href="/profile?register=1"
              className="text-foreground hover:text-primary hover:underline"
            >
              免费注册
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use LearnerLoginCard */
export const PhoneLoginCard = LearnerLoginCard;
