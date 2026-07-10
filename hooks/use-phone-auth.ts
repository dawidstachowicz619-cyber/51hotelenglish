"use client";

import { useCallback, useEffect, useState } from "react";

import { isPhoneAuthAvailable } from "@/lib/auth/phone-auth-config";
import { saveRememberedPhone } from "@/lib/auth/remembered-phone";
import { toE164Phone } from "@/lib/auth/phone";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isCloudSyncActive, pullFromCloud } from "@/lib/storage/cloud-sync";
import { updateProfile } from "@/lib/points/storage";

type PhoneAuthState = {
  loading: boolean;
  signedIn: boolean;
  phone: string | null;
  error: string | null;
};

export function usePhoneAuth() {
  const [state, setState] = useState<PhoneAuthState>({
    loading: true,
    signedIn: false,
    phone: null,
    error: null,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");

  const refresh = useCallback(async () => {
    if (!isPhoneAuthAvailable()) {
      setState({ loading: false, signedIn: false, phone: null, error: null });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    const phone = data.user?.phone?.replace(/^\+86/, "") ?? null;
    setState({
      loading: false,
      signedIn: !!data.user,
      phone,
      error: null,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sendOtp = useCallback(async (phone: string) => {
    setState((s) => ({ ...s, error: null, loading: true }));
    try {
      const e164 = toE164Phone(phone);
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) throw error;
      setPendingPhone(phone);
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

        const loggedInPhone = (pendingPhone || state.phone || "").replace(/\s|-/g, "");
        const normalizedPhone = loggedInPhone.replace(/^\+86/, "");

        if (isCloudSyncActive()) {
          const linkRes = await fetch("/api/auth/link", {
            method: "POST",
            credentials: "include",
          });
          if (!linkRes.ok) throw new Error("link_failed");
          await pullFromCloud();
        }

        if (normalizedPhone) {
          saveRememberedPhone(normalizedPhone);
          updateProfile((p) => ({
            ...p,
            phone: p.phone || normalizedPhone,
          }));
        }
        await refresh();
        setOtpSent(false);
        window.dispatchEvent(new Event("auth-linked"));
        return { ok: true as const };
      } catch {
        const message = "验证码错误或已过期";
        setState((s) => ({ ...s, loading: false, error: message }));
        return { ok: false as const, error: message };
      }
    },
    [pendingPhone, state.phone, refresh]
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
    signOut,
    refresh,
    cloudEnabled: isCloudSyncActive(),
    phoneAuthAvailable: isPhoneAuthAvailable(),
  };
}
