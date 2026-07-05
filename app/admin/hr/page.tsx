import type { Metadata } from "next";

import { HrAdminDashboard } from "@/components/admin/hr/hr-admin-dashboard";

export const metadata: Metadata = {
  title: "人力资源部管理后台 | 51HotelEnglish",
  description: "查看酒店员工 CEFR 测评、课程进度与积分学习数据。",
  robots: { index: false, follow: false },
};

export default function HrAdminPage() {
  return (
    <main className="min-h-screen bg-muted">
      <HrAdminDashboard />
    </main>
  );
}
