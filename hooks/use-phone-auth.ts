"use client";

import { useCallback, useEffect, useState } from "react";

import {
  accountToAuthEmail,
  authEmailToAccountLabel,
  extractMainlandPhone,
  isValidRegisterPassword,
  isValidRegisterUsername,
  isValidRealName,
  isValidNickname,
} from "@/lib/auth/learner-account";
import {
  clearLocalLearnerSession,
  getLocalLearnerSession,
  registerLocalLearnerAccount,
  signInLocalLearnerAccount,
} from "@/lib/auth/local-learner-auth";
import {
  isLearnerAuthAvailable,
  isPhoneAuthAvailable,
} from "@/lib/auth/phone-auth-config";
import { saveRememberedLoginAccount, saveRememberedPhone } from "@/lib/auth/remembered-login";
import { toE164Phone } from "@/lib/auth/phone";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isCloudSyncActive, pullFromCloud } from "@/lib/storage/cloud-sync";
import { updateProfile } from "@/lib/points/storage";

type LearnerAuthState = {
  loading: boolean;
  signedIn: boolean;
  phone: string | null;
  accountLabel: string | null;
  error: string | null;
};

async function finishAuthSession(
  account: string,
  phoneHint?: string | null,
  realName?: string | null,
  nickname?: string | null
) {
  const normalizedPhone =
    extractMainlandPhone(account) ??
    (phoneHint ? phoneHint.replace(/^\+86/, "") : null);

  if (isCloudSyncActive()) {
    const linkRes = await fetch("/api/auth/link", {
      method: "POST",
      credentials: "include",
    });
    if (!linkRes.ok) throw new Error("link_failed");
    await pullFromCloud();
  }

  const trimmedName = realName?.trim();
  const trimmedNickname = nickname?.trim();
  updateProfile((p) => ({
    ...p,
    ...(trimmedName ? { realName: p.realName || trimmedName } : {}),
    ...(trimmedNickname ? { nickname: trimmedNickname } : {}),
    ...(normalizedPhone ? { phone: p.phone || normalizedPhone } : {}),
  }));

  saveRememberedLoginAccount(account);
  if (normalizedPhone) saveRememberedPhone(normalizedPhone);
  window.dispatchEvent(new Event("auth-linked"));
}

function resolveUserIdentity(user: {
  phone?: string | null;
  email?: string | null;
}): { phone: string | null; accountLabel: string | null } {
  const phone = user.phone?.replace(/^\+86/, "") ?? null;
  const accountLabel = phone ?? authEmailToAccountLabel(user.email);
  return { phone, accountLabel };
}

function resolveLocalIdentity(session: NonNullable<ReturnType<typeof getLocalLearnerSession>>) {
  return {
    phone: session.phone,
    accountLabel: session.nickname || session.realName || session.username,
  };
}

export function usePhoneAuth() {
  const [state, setState] = useState<LearnerAuthState>({
    loading: true,
    signedIn: false,
    phone: null,
    accountLabel: null,
    error: null,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");

  const refresh = useCallback(async () => {
    if (isPhoneAuthAvailable()) {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const identity = resolveUserIdentity(data.user);
        setState({
          loading: false,
          signedIn: true,
          phone: identity.phone,
          accountLabel: identity.accountLabel,
          error: null,
        });
        return;
      }
    }

    const localSession = getLocalLearnerSession();
    if (localSession) {
      const identity = resolveLocalIdentity(localSession);
      setState({
        loading: false,
        signedIn: true,
        phone: identity.phone,
        accountLabel: identity.accountLabel,
        error: null,
      });
      return;
    }

    setState({
      loading: false,
      signedIn: false,
      phone: null,
      accountLabel: null,
      error: null,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sendOtp = useCallback(async (phone: string) => {
    if (!isPhoneAuthAvailable()) {
      const message = "当前环境未配置短信登录，请使用账号密码登录";
      setState((s) => ({ ...s, error: message }));
      return { ok: false as const, error: message };
    }

    setState((s) => ({ ...s, error: null, loading: true }));
    try {
      const e164 = toE164Phone(phone);
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) throw error;
      setPendingPhone(phone);
      saveRememberedLoginAccount(phone);
      saveRememberedPhone(phone);
      setOtpSent(true);
      setState((s) => ({ ...s, loading: false, error: null }));
      return { ok: true as const };
    } catch (err) {
      const message =
        err instanceof Error && err.message === "invalid_phone"
          ? "请输入 11 位中国大陆手机号"
          : "验证码发送失败，请稍后重试";
      setState((s) => ({ ...s, loading: false, error: message }));
      return { ok: false as const, error: message };
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!isPhoneAuthAvailable()) {
        return { ok: false as const, error: "短信登录未配置" };
      }

      setState((s) => ({ ...s, error: null, loading: true }));
      try {
        const e164 = toE164Phone(pendingPhone || state.phone || "");
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.verifyOtp({
          phone: e164,
          token: code.trim(),
          type: "sms",
        });
        if (error) throw error;

        const account = pendingPhone || state.phone || "";
        await finishAuthSession(account, account);
        await refresh();
        setOtpSent(false);
        return { ok: true as const };
      } catch {
        const message = "验证码错误或已过期";
        setState((s) => ({ ...s, loading: false, error: message }));
        return { ok: false as const, error: message };
      }
    },
    [pendingPhone, state.phone, refresh]
  );

  const signInWithPassword = useCallback(
    async (account: string, password: string) => {
      setState((s) => ({ ...s, error: null, loading: true }));
      try {
        if (isPhoneAuthAvailable()) {
          const email = accountToAuthEmail(account);
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!error) {
            await finishAuthSession(account);
            await refresh();
            return { ok: true as const };
          }
        }

        const localResult = await signInLocalLearnerAccount(account, password);
        if (!localResult.ok) {
          throw new Error(localResult.error);
        }

        await finishAuthSession(
          localResult.session.username,
          localResult.session.phone,
          localResult.session.realName,
          localResult.session.nickname
        );
        await refresh();
        return { ok: true as const };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "登录失败，请检查账号和密码";
        setState((s) => ({ ...s, loading: false, error: message }));
        return { ok: false as const, error: message };
      }
    },
    [refresh]
  );

  const registerWithPassword = useCallback(
    async (
      account: string,
      password: string,
      realName?: string,
      nickname?: string
    ) => {
      setState((s) => ({ ...s, error: null, loading: true }));
      try {
        if (!isValidRealName(realName ?? "")) {
          throw new Error("invalid_name");
        }
        if (!isValidNickname(nickname ?? "")) {
          throw new Error("invalid_nickname");
        }
        if (!isValidRegisterUsername(account)) {
          throw new Error("invalid_username");
        }
        if (!isValidRegisterPassword(password)) {
          throw new Error("invalid_password");
        }

        if (isPhoneAuthAvailable()) {
          const email = accountToAuthEmail(account);
          const phone = extractMainlandPhone(account);
          const supabase = createSupabaseBrowserClient();
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            phone: phone ? toE164Phone(phone) : undefined,
          });

          if (!error) {
            if (!data.session) {
              const signInResult = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (signInResult.error) throw signInResult.error;
            }

            await finishAuthSession(account, phone, realName, nickname);
            await refresh();
            return { ok: true as const };
          }
        }

        const localResult = await registerLocalLearnerAccount(
          account,
          password,
          realName ?? "",
          nickname ?? ""
        );
        if (!localResult.ok) {
          throw new Error(localResult.error);
        }

        await finishAuthSession(
          account,
          extractMainlandPhone(account),
          realName,
          nickname
        );
        await refresh();
        return { ok: true as const };
      } catch (err) {
        const message =
          err instanceof Error && err.message === "invalid_name"
            ? "请输入 2–20 位姓名"
            : err instanceof Error && err.message === "invalid_nickname"
              ? "请输入 2–20 位昵称"
              : err instanceof Error && err.message === "invalid_username"
              ? "账号需为 3–20 位字母、数字或中文"
              : err instanceof Error && err.message === "invalid_password"
                ? "密码需为 6–32 位"
                : err instanceof Error
                  ? err.message
                  : "注册失败，请更换账号或稍后再试";
        setState((s) => ({ ...s, loading: false, error: message }));
        return { ok: false as const, error: message };
      }
    },
    [refresh]
  );

  const signOut = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    if (isCloudSyncActive()) {
      await fetch("/api/auth/link", { method: "DELETE", credentials: "include" });
    }
    if (isPhoneAuthAvailable()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }
    clearLocalLearnerSession();
    setOtpSent(false);
    await refresh();
    window.dispatchEvent(new Event("auth-signed-out"));
  }, [refresh]);

  return {
    ...state,
    otpSent,
    pendingPhone,
    sendOtp,
    verifyOtp,
    signInWithPassword,
    registerWithPassword,
    signOut,
    refresh,
    cloudEnabled: isCloudSyncActive(),
    phoneAuthAvailable: isPhoneAuthAvailable(),
    learnerAuthAvailable: isLearnerAuthAvailable(),
    phoneOtpAvailable: isPhoneAuthAvailable(),
  };
}

export const useLearnerAuth = usePhoneAuth;
