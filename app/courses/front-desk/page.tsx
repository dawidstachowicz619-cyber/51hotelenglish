import type { Metadata } from "next";

import { FrontDeskCourse } from "@/components/courses/front-desk/front-desk-course";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "前厅英语 | 51HotelEnglish",
  description:
    "前厅四大岗位英语：酒店接待、礼宾部、预订部、客服中心。按 CEFR 级别通关地图闯关学习。",
};

export default function FrontDeskPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted">
        <FrontDeskCourse />
      </main>
      <Footer />
    </>
  );
}
