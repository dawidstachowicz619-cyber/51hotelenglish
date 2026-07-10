import type { Metadata } from "next";

import { ProfileLearningRecordPage } from "@/components/profile/profile-learning-record-page";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "我的学习记录 | 51HotelEnglish",
  description: "查看全部课程学习统计与活动记录。",
};

export default function ProfileLearningPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted">
        <ProfileLearningRecordPage />
      </main>
      <Footer />
    </>
  );
}
