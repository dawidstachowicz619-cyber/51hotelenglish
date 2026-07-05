import type { Metadata } from "next";

import { PlatformAdminDashboard } from "@/components/admin/platform/platform-admin-dashboard";

export const metadata: Metadata = {
  title: "平台管理中心 | 51HotelEnglish",
  description: "超级管理员配置各酒店 HR 后台权限。",
  robots: { index: false, follow: false },
};

export default function PlatformAdminPage() {
  return (
    <main className="min-h-screen bg-muted">
      <PlatformAdminDashboard />
    </main>
  );
}
