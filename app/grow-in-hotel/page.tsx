import type { Metadata } from "next";

import { GrowInHotelPageContent } from "@/components/grow-in-hotel/grow-in-hotel-page-content";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Grow in Hotel | 51HotelEnglish",
  description:
    "酒店人才成长计划：入职培训、在岗岗位学习与 ASK 三维度成长，试用期学习档案可打印。",
};

export default function GrowInHotelPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted">
        <GrowInHotelPageContent />
      </main>
      <Footer />
    </>
  );
}
