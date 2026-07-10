import type { Metadata } from "next";

import { PlatformCourseAnalyticsDashboard } from "@/components/admin/platform/platform-course-analytics-dashboard";

export const metadata: Metadata = {
  title: "全平台课程学习统计 | 51HotelEnglish",
  description: "平台管理员查看各课程学员人数、学习数量与时长。",
  robots: { index: false, follow: false },
};

export default function PlatformCourseAnalyticsPage() {
  return (
    <main className="min-h-screen bg-muted">
      <PlatformCourseAnalyticsDashboard />
    </main>
  );
}
