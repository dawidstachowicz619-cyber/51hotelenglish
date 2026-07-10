import type { Metadata } from "next";

import { PlatformRussianAnalyticsDashboard } from "@/components/admin/platform/platform-russian-analytics-dashboard";

export const metadata: Metadata = {
  title: "酒店俄语学习统计 | 51HotelEnglish",
  description: "平台管理员查看酒店俄语课程学习人数、数量与时长。",
  robots: { index: false, follow: false },
};

export default function PlatformRussianAnalyticsPage() {
  return (
    <main className="min-h-screen bg-muted">
      <PlatformRussianAnalyticsDashboard />
    </main>
  );
}
