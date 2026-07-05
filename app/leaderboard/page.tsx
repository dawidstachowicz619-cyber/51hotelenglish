import type { Metadata } from "next";

import { LeaderboardPageContent } from "@/components/points/leaderboard-page-content";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "学习成绩排名 | 51HotelEnglish",
  description: "查看积分排行榜，通过测评和课程学习赚取积分。",
};

export default function LeaderboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted">
        <LeaderboardPageContent />
      </main>
      <Footer />
    </>
  );
}
