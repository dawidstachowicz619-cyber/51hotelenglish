import type { Metadata } from "next";
import { Suspense } from "react";

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
        <Suspense
          fallback={
            <div className="mx-auto max-w-lg px-6 pb-24 pt-32 text-center text-sm font-semibold text-muted-foreground">
              加载中…
            </div>
          }
        >
          <ProfilePageContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
