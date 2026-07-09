import type { Metadata } from "next";

import { PlatformHotelLearningDashboard } from "@/components/admin/platform/platform-hotel-learning-dashboard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let hotel = slug;
  try {
    hotel = decodeURIComponent(slug);
  } catch {
    /* keep raw slug */
  }
  return {
    title: `${hotel} · 学员学习数据 | 51HotelEnglish`,
    description: "平台管理员查看酒店学员学习进度与测评数据。",
    robots: { index: false, follow: false },
  };
}

export default async function PlatformHotelLearningPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-muted">
      <PlatformHotelLearningDashboard slug={slug} />
    </main>
  );
}
