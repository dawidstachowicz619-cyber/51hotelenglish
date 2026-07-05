import type { Metadata } from "next";

import { ProfilePageContent } from "@/components/profile/profile-page-content";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "个人档案 | 51HotelEnglish",
  description: "查看和编辑学员个人信息、积分与学习数据。",
};

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted">
        <ProfilePageContent />
      </main>
      <Footer />
    </>
  );
}
