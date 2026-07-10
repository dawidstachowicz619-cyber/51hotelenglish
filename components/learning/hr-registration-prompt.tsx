"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getTrialLessonsRemaining,
  isHrRegisteredUser,
} from "@/lib/hr/hr-registration";
import { HR_REGISTRATION_EVENT, HR_REGISTRATION_MESSAGE } from "@/lib/types/learning-gate";

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
          <Building2 className="size-6" />
        </div>
        <h2 id="hr-reg-title" className="mt-4 font-display text-xl text-foreground">
          请联系 HR 完成注册
        </h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">
          {HR_REGISTRATION_MESSAGE}
        </p>
        <ul className="mt-4 space-y-2 text-xs font-semibold text-foreground">
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 size-3.5 shrink-0 text-primary" />
            在个人档案中填写与 HR 登记一致的手机号
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            联系酒店人力资源部在「企业 HR 后台」添加您的员工信息
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
  const [remaining, setRemaining] = useState(0);

  const refresh = useCallback(() => {
    setRegistered(isHrRegisteredUser());
    setRemaining(getTrialLessonsRemaining());
  }, []);

  useEffect(() => {
    refresh();
    const events = [
      HR_REGISTRATION_EVENT,
      "hr-registration-updated",
      "trial-lessons-updated",
      "points-updated",
    ] as const;
    for (const e of events) window.addEventListener(e, refresh);
    return () => {
      for (const e of events) window.removeEventListener(e, refresh);
    };
  }, [refresh]);

  if (registered) return null;

  return (
    <div className="border-b-2 border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-900">
      {remaining > 0
        ? `体验模式：您还可免费学习 ${remaining} 课（前厅英语、CEFR 测评等）。如需继续，请联系酒店 HR 在后台注册您的手机号。`
        : "体验课已用完。前厅英语、CEFR 测评等课程需联系酒店 HR 在后台注册后再继续学习。"}
      <a href="/profile" className="ml-2 font-bold text-primary underline">
        填写手机号
      </a>
    </div>
  );
}
