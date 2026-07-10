"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Lock, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isHrRegisteredUser } from "@/lib/hr/hr-registration";
import {
  HR_COURSE_LOCK_HINT,
  HR_REGISTRATION_EVENT,
  HR_REGISTRATION_MESSAGE,
} from "@/lib/types/learning-gate";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HrRegistrationPrompt({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-labelledby="hr-reg-title"
        className="max-w-md rounded-2xl border-2 border-border bg-white p-6 shadow-xl"
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Lock className="size-6" />
        </div>
        <h2 id="hr-reg-title" className="mt-4 font-display text-xl text-foreground">
          课程暂未开通
        </h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">
          {HR_REGISTRATION_MESSAGE}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-900">
          <Lock className="size-4 text-amber-700" />
          {HR_COURSE_LOCK_HINT}
        </p>
        <ul className="mt-4 space-y-2 text-xs font-semibold text-foreground">
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 size-3.5 shrink-0 text-primary" />
            在个人档案中填写与 HR 登记一致的手机号
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            联系酒店 HR 在「企业 HR 后台」添加您的员工信息
          </li>
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" asChild onClick={onClose}>
            <a href="/profile">完善个人档案</a>
          </Button>
          <Button className="flex-1" variant="outline" onClick={onClose}>
            我知道了
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HrRegistrationProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(HR_REGISTRATION_EVENT, show);
    return () => window.removeEventListener(HR_REGISTRATION_EVENT, show);
  }, []);

  return <HrRegistrationPrompt open={open} onClose={() => setOpen(false)} />;
}

export function HrTrialBanner() {
  const [registered, setRegistered] = useState(true);

  const refresh = useCallback(() => {
    setRegistered(isHrRegisteredUser());
  }, []);

  useEffect(() => {
    refresh();
    const events = [
      HR_REGISTRATION_EVENT,
      "hr-registration-updated",
      "points-updated",
    ] as const;
    for (const e of events) window.addEventListener(e, refresh);
    return () => {
      for (const e of events) window.removeEventListener(e, refresh);
    };
  }, [refresh]);

  if (registered) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-bold text-amber-900">
      <Lock className="size-3.5 shrink-0 text-amber-700" aria-hidden />
      <span>{HR_COURSE_LOCK_HINT}</span>
      <a href="/profile" className="font-extrabold text-amber-950 underline decoration-amber-400 underline-offset-2">
        完善档案
      </a>
    </div>
  );
}
