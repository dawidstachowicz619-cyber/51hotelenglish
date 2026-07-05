import type { Metadata } from "next";

import { CourseContentAdmin } from "@/components/admin/platform/course-content-admin";

export const metadata: Metadata = {
  title: "课程内容管理 | 51HotelEnglish",
  description: "平台管理员调整前厅各岗位关卡主题与学习内容。",
  robots: { index: false, follow: false },
};

export default function CourseContentAdminPage() {
  return (
    <main className="min-h-screen bg-muted">
      <CourseContentAdmin />
    </main>
  );
}
