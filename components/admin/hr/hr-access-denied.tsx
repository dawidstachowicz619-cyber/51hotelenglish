"use client";

import { ShieldAlert } from "lucide-react";

import { HR_PERMISSION_LABELS, type HrPermissionKey } from "@/lib/types/hr-permissions";

type HrAccessDeniedProps = {
  hotel: string;
  reason: "disabled" | "permission";
  permission?: HrPermissionKey;
};

export function HrAccessDenied({ hotel, reason, permission }: HrAccessDeniedProps) {
  return (
    <div className="card-elevated flex items-start gap-3 p-5">
      <ShieldAlert className="size-5 shrink-0 text-amber-600" />
      <div>
        <p className="text-sm font-extrabold text-foreground">权限不足</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          {reason === "disabled"
            ? `「${hotel}」的 HR 后台已被平台管理员禁用，请联系平台开通。`
            : permission
              ? `您没有「${HR_PERMISSION_LABELS[permission].label}」权限，请联系平台管理员。`
              : "您没有访问此功能的权限。"}
        </p>
      </div>
    </div>
  );
}
