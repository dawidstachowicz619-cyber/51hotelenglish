import type { Metadata } from "next";

import { PlatformEmployeeRecordPage } from "@/components/admin/platform/platform-employee-record-page";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "学员学习记录 | 51HotelEnglish",
    description: "平台管理员查看学员全部学习记录。",
    robots: { index: false, follow: false },
  };
}

export default async function PlatformEmployeeRecordRoute({ params }: Props) {
  const { slug, id } = await params;
  return (
    <main className="min-h-screen bg-muted">
      <PlatformEmployeeRecordPage hotelSlug={slug} employeeIdParam={id} />
    </main>
  );
}
