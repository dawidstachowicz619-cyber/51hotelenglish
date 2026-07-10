import type { Metadata } from "next";

import { HrEmployeeRecordPage } from "@/components/admin/hr/hr-employee-record-page";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "学员学习记录 | 51HotelEnglish",
    description: "查看学员全部课程学习数据与活动记录。",
    robots: { index: false, follow: false },
  };
}

export default async function HrEmployeeRecordRoute({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-muted">
      <HrEmployeeRecordPage employeeIdParam={id} />
    </main>
  );
}
